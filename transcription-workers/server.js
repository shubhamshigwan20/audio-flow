require("dotenv").config();
const express = require("express");
const app = express();
const helmet = require("helmet");
const cors = require("cors");
const { Worker } = require("bullmq");
const {
  connection,
  aggregationQueue,
  transcriptionQueue,
} = require("./utils/queue");
const { getPresignedURL } = require("./utils/supabaseClient");
const groqTranscribe = require("./utils/groqStt");

const PORT = process.env.PORT || 80;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  return res.status(200).json({
    status: true,
    service: "transcription-worker",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  return res.status(200).json({
    status: true,
  });
});

app.get("/queue-status", async (req, res) => {
  try {
    const [waiting, active] = await Promise.all([
      transcriptionQueue.getWaitingCount(),
      transcriptionQueue.getActiveCount(),
    ]);
    return res.status(200).json({
      status: true,
      queue: "transcription",
      waiting,
      active,
      busy: waiting > 0 || active > 0,
    });
  } catch (err) {
    return res.status(500).json({ status: false, error: err.message });
  }
});

const worker = new Worker(
  "transcription",
  async (job) => {
    try {
      const jobId = job.data.jobId;
      const chunkIndex = job.data.chunkIndex;
      const chunkUrl = job.data.chunkUrl;
      console.log("job id ->", jobId);
      console.log("chunk index ->", chunkIndex);
      console.log("chunk url ->", chunkUrl);

      const presignedUrl = await getPresignedURL(chunkUrl);
      console.log("presigned url ->", presignedUrl);
      const text = await groqTranscribe(
        "url",
        "",
        presignedUrl,
        "whisper-large-v3-turbo",
      );
      console.log("text ->", text);

      await connection.hset(
        `job:${jobId}:chunks`,
        chunkIndex.toString(), // Redis keys must be strings
        text,
      );
      const completed = await connection.hlen(`job:${jobId}:chunks`);
      console.log("completed chunks ->", completed);
      const total = await connection.get(`job:${jobId}:totalCurrentChunks`);
      console.log("total chunks ->", total);

      if (Number(completed) === Number(total)) {
        console.log("All chunks done → triggering aggregation");

        const aggregationPayload = {
          jobId,
        };
        console.log(`aggregation queue payload ${aggregationPayload}`);
        const result = await aggregationQueue.add("job", aggregationPayload);
        console.log(`file ${result.id} added to aggregation queue`);
      }
    } catch (err) {
      console.error(`[transcript-worker] job ${job.data.jobId} failed:`, err);
      throw err;
    } finally {
    }
  },
  {
    connection,
    concurrency: 5,
    defaultJobOptions: {
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 5000, // 1st retry after 5s, 2nd after 10s, 3rd after 20s
      },
    },
  },
);

worker.on("completed", (job) => {
  console.log(`job ${job.id} completed processing`);
});

worker.on("failed", (job, err) => {
  console.log(`job ${job.id} failed processing due to ${err}`);
});

process.on("SIGTERM", async () => await worker.close());
process.on("SIGINT", async () => await worker.close());

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});

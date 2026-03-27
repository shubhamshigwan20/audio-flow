require("dotenv").config();
const express = require("express");
const app = express();
const helmet = require("helmet");
const cors = require("cors");
const { Worker } = require("bullmq");
const { connection, aggregationQueue } = require("./utils/queue");
const { getPresignedURL } = require("./utils/supabaseClient");
const groqTranscribe = require("./utils/groqStt");

const PORT = process.env.PORT || 80;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  return res.status(200).json({
    status: true,
    service: "chunk-worker",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  return res.status(200).json({
    status: true,
  });
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
      const total = await connection.get(`job:${jobId}:totalChunks`);

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
      console.log(err);
    } finally {
    }
  },
  { connection, concurrency: 5 },
);

worker.on("completed", (job) => {
  console.log(`job ${job.id} completed processing`);
});

worker.on("failed", (job, err) => {
  console.log(`job ${job.id} failed processing due to ${err}`);
});

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});

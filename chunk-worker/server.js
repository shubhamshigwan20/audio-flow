require("dotenv").config();
const express = require("express");
const app = express();
const helmet = require("helmet");
const cors = require("cors");
const fs = require("fs");
const { Worker } = require("bullmq");
const { connection, transcriptionQueue, chunkQueue } = require("./utils/queue");
const { upload, getPresignedURL } = require("./utils/supabaseClient");
const { downloadFile, splitAudio } = require("./utils/helper");

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

app.get("/queue-status", async (req, res) => {
  try {
    const [waiting, active] = await Promise.all([
      chunkQueue.getWaitingCount(),
      chunkQueue.getActiveCount(),
    ]);
    return res.status(200).json({
      status: true,
      queue: "chunk",
      waiting,
      active,
      busy: waiting > 0 || active > 0,
    });
  } catch (err) {
    return res.status(500).json({ status: false, error: err.message });
  }
});

const worker = new Worker(
  "chunk",
  async (job) => {
    let wavFile;
    try {
      const jobId = job.data.jobId;
      const chunkIndex = job.data.chunkIndex;
      const chunkUrl = job.data.chunkUrl;
      console.log("job id ->", jobId);
      console.log("chunk index ->", chunkIndex);
      console.log("chunk url ->", chunkUrl);

      wavFile = `${jobId}.wav`;
      const presignedUrl = await getPresignedURL(chunkUrl);
      const downloadedWavFile = await downloadFile(presignedUrl, wavFile);
      const chunks = await splitAudio(downloadedWavFile, jobId);

      const newTotal = await connection.incrby(
        `job:${jobId}:totalCurrentChunks`,
        chunks.length, // ← atomic: Redis does read+add+write itself
      );
      console.log("totalCurrentChunks after increment →", newTotal);

      const oldTotal = await connection.get(
        `job:${jobId}:totalCurrentChunks`,
        chunks.length,
      );

      for (let i = 0; i < chunks.length; i++) {
        const chunkKey = `${jobId}_${i + oldTotal}.wav`;

        const chunkUrl = await upload(chunks[i], chunkKey);

        const transcribePayload = {
          jobId,
          chunkIndex: i + oldTotal,
          chunkUrl,
        };

        console.log(
          `transcription queue payload ${JSON.stringify(transcribePayload)}`,
        );

        const result = await transcriptionQueue.add("job", transcribePayload, {
          attempts: 3,
          removeOnComplete: 5, // keep last 100
          removeOnFail: 2,
          backoff: {
            type: "exponential",
            delay: 5000,
          },
        });
        console.log(`file ${result.id} added to transcription queue`);
      }
    } catch (err) {
      console.error(`[chunk-worker] job ${job.data.jobId} failed:`, err);
      throw err;
    } finally {
      if (wavFile && fs.existsSync(wavFile)) {
        fs.unlinkSync(wavFile);
      }
    }
  },
  {
    connection,
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

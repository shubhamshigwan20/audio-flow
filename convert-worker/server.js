require("dotenv").config();
const fs = require("fs");
const { Worker } = require("bullmq");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const app = express();
const { connection, chunkQueue, downloadQueue } = require("./utils/queue");
const { getPresignedURL } = require("./utils/supabaseClient");
const {
  downloadMp3,
  convertMp3ToWav,
  getFileSizeBytes,
} = require("./utils/helper");
const { upload } = require("./utils/supabaseClient");
const PORT = process.env.PORT || 80;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  return res.status(200).json({
    status: true,
    service: "convert-worker",
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
      downloadQueue.getWaitingCount(),
      downloadQueue.getActiveCount(),
    ]);
    return res.status(200).json({
      status: true,
      queue: "download",
      waiting,
      active,
      busy: waiting > 0 || active > 0,
    });
  } catch (err) {
    return res.status(500).json({ status: false, error: err.message });
  }
});

const worker = new Worker(
  "download",
  async (job) => {
    let inputFile;
    let wavFile;
    try {
      const jobId = job.data.jobId;
      const chunkIndex = job.data.chunkIndex;
      const chunkUrl = job.data.chunkUrl;
      console.log("job id ->", jobId);
      console.log("chunk index", chunkIndex);
      console.log("chunk url ->", chunkUrl);

      const extWithDot = `.${chunkUrl.split(".").pop()}`; // ".mp3"
      console.log("extension ->", extWithDot);

      inputFile = `${jobId}_${chunkIndex}${extWithDot}`;
      wavFile = `${jobId}_${chunkIndex}.wav`;
      const presignedUrl = await getPresignedURL(chunkUrl);
      await downloadMp3(presignedUrl, inputFile);
      await convertMp3ToWav(inputFile, wavFile);

      const sizeBytes = await getFileSizeBytes(wavFile);
      console.log("wav file size ->", sizeBytes / (1024 * 1024));

      const filePath = await upload(wavFile, wavFile);
      console.log("path ->", filePath);

      const payload = {
        jobId,
        chunkIndex,
        chunkUrl: filePath,
      };
      console.log("chunk queue payload ->", payload);

      const result = await chunkQueue.add("job", payload);
      console.log(`data ${result.id} added to chunk queue`);
    } catch (err) {
      console.error(`[convert-worker] job ${job.data.jobId} failed:`, err);
      throw err;
    } finally {
      if (wavFile && fs.existsSync(wavFile)) {
        fs.unlinkSync(wavFile);
      }
      if (inputFile && fs.existsSync(inputFile)) {
        fs.unlinkSync(inputFile);
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

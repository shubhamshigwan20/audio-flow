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
      const supabasePath = job.data.supabasePath;
      console.log("job id ->", jobId);
      console.log("job name ->", supabasePath);

      wavFile = `${jobId}.wav`;
      const presignedUrl = await getPresignedURL(supabasePath);
      const downloadedWavFile = await downloadFile(presignedUrl, wavFile);
      const chunks = await splitAudio(downloadedWavFile, jobId);

      await connection.set(`job:${jobId}:totalChunks`, chunks.length);

      for (let i = 0; i < chunks.length; i++) {
        const chunkKey = `chunks/${jobId}_${i}.wav`;

        const chunkUrl = await upload(chunks[i], chunkKey);

        const transcribePayload = {
          jobId,
          chunkIndex: i,
          chunkUrl,
        };

        console.log(`transcription queue payload ${transcribePayload}`);

        const result = await transcriptionQueue.add("job", transcribePayload, {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 5000,
          },
        });
        console.log(`file ${result.id} added to transcription queue`);
      }
    } catch (err) {
      console.log(err);
    } finally {
      if (wavFile && fs.existsSync(wavFile)) {
        fs.unlinkSync(wavFile);
      }
    }
  },
  { connection },
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

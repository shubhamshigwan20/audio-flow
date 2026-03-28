require("dotenv").config();
const fs = require("fs");
const { Worker } = require("bullmq");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const app = express();
const { connection, chunkQueue, downloadQueue } = require("./utils/queue");
const { getPresignedURL } = require("./utils/supabaseClient");
const { downloadMp3, convertMp3ToWav } = require("./utils/helper");
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
    let mp3File;
    let wavFile;
    try {
      const jobId = job.data.jobId;
      const supabasePath = job.data.supabasePath;
      console.log("job id ->", jobId);
      console.log("job name ->", supabasePath);

      mp3File = `${jobId}.mp3`;
      wavFile = `${jobId}.wav`;
      const presignedUrl = await getPresignedURL(supabasePath);
      await downloadMp3(presignedUrl, mp3File);
      await convertMp3ToWav(mp3File, wavFile);

      // const fileExt = path.extname(originalname).slice(1); // "mp3"
      // const fileName = `${jobId}.${fileExt}`;

      const filePath = await upload(wavFile, wavFile);
      console.log("path ->", filePath);
      // const presignedURL = await getPresignedURL(filePath);
      // console.log("presigned url ->", presignedURL);

      const payload = {
        jobId,
        supabasePath: filePath,
      };
      console.log("chunk queue payload ->", payload);

      const result = await chunkQueue.add("job", payload);
      console.log(`transcription ${result.id} added to chunk queue`);
    } catch (err) {
      console.log(err);
    } finally {
      if (wavFile && fs.existsSync(wavFile)) {
        fs.unlinkSync(wavFile);
      }
      if (mp3File && fs.existsSync(mp3File)) {
        fs.unlinkSync(mp3File);
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

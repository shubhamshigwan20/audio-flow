require("dotenv").config();
const express = require("express");
const app = express();
const helmet = require("helmet");
const cors = require("cors");
const { Worker } = require("bullmq");
const { connection, aggregationQueue } = require("./utils/queue");
const {
  getAllChunkResults,
  mergeWithOverlapHandling,
} = require("./utils/helper");

const PORT = process.env.PORT || 80;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  return res.status(200).json({
    status: true,
    service: "aggregation-worker",
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
      aggregationQueue.getWaitingCount(),
      aggregationQueue.getActiveCount(),
    ]);
    return res.status(200).json({
      status: true,
      queue: "aggregation",
      waiting,
      active,
      busy: waiting > 0 || active > 0,
    });
  } catch (err) {
    return res.status(500).json({ status: false, error: err.message });
  }
});

const worker = new Worker(
  "aggregation",
  async (job) => {
    try {
      const jobId = job.data.jobId;
      console.log("job id ->", jobId);

      const results = await getAllChunkResults(jobId);
      console.log("results ->", results);
      const sorted = results.sort((a, b) => a.chunkIndex - b.chunkIndex);
      console.log("sorted ->", sorted);
      const finalText = mergeWithOverlapHandling(sorted);
      console.log("final text ->", finalText);
      // await saveResult(jobId, finalText);
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

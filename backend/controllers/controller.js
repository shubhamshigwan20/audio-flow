const { v4: uuid } = require("uuid");
const fs = require("fs-extra");
const db = require("../db/db");
const { processTranscribe } = require("../utils/helper");
const { connection } = require("../utils/queue");
const { z } = require("zod");

async function detectFileType(filePath) {
  const { fileTypeFromFile } = await import("file-type");
  return fileTypeFromFile(filePath);
}

const ALLOWED_AUDIO_TYPES = new Set([
  "audio/mpeg", // .mp3
  "audio/wav", // .wav
  "audio/x-wav", // .wav (alternate)
  "audio/mp4", // .m4a
  "audio/x-m4a", // .m4a (alternate)
  "audio/ogg", // .ogg
  "audio/flac", // .flac
  "audio/x-flac", // .flac (alternate)
  "audio/webm", // .webm
  "audio/aac", // .aac
]);

const getJobStatusSchema = z.object({
  id: z.string(),
});

const getJobHistorySchema = z.object({
  status: z.string(),
});

const transcribe = async (req, res, next) => {
  //schema cheq
  try {
    const fileObj = req.file;
    if (!fileObj) {
      return res.status(400).json({
        status: false,
        message: "audio file not found",
      });
    }

    console.log("req file -> ", fileObj);

    const detected = await detectFileType(fileObj.path);

    if (!detected || !ALLOWED_AUDIO_TYPES.has(detected.mime)) {
      // Clean up the file before rejecting
      await fs.remove(fileObj.path);
      return res.status(400).json({
        status: false,
        message: `invalid file type. detected: ${detected?.mime ?? "unknown"}. only audio files are allowed.`,
      });
    }

    //create a unique job id
    const jobId = uuid();
    console.log("jobId ->", jobId);
    console.log("mimetype ->", detected.mime);

    await db.query(`INSERT INTO results(jobId, status) VALUES($1, $2)`, [
      jobId,
      "received",
    ]);

    res
      .status(202)
      .json({ status: true, message: "file uploaded success", jobId });

    setImmediate(async () => {
      processTranscribe(jobId, fileObj);
    });
  } catch (err) {
    next(err);
  }
};

const getJobStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const parseResult = getJobStatusSchema.safeParse({ id });
    if (!parseResult.success) {
      return res.status(400).json({
        status: false,
        message: "id should be string",
      });
    }

    const statusDbResult = await db.query(
      `SELECT status FROM results WHERE jobId = $1`,
      [id],
    );
    const status = statusDbResult.rowCount ? statusDbResult.rows[0]?.status : 0;

    const initialChunks = await connection.get(`job:${id}:totalInitialChunks`);
    const converted = await connection.get(`job:${id}:chunksConverted`);
    const transcribed = await connection.get(`job:${id}:chunksTranscribed`);
    const total = await connection.get(`job:${id}:totalCurrentChunks`);

    const payload = {
      jobId: id,
      status: status,
      progress: {
        initialChunks: initialChunks,
        converted: converted,
        transcribed: transcribed,
        total: total,
      },
    };
    return res.status(200).json({
      status: true,
      data: payload,
    });
  } catch (err) {
    next(err);
  }
};

const getTranscript = async (req, res, next) => {
  try {
    const { id } = req.params;

    const parseResult = getJobStatusSchema.safeParse({ id });
    if (!parseResult.success) {
      return res.status(400).json({
        status: false,
        message: "id should be string",
      });
    }

    const statusDbResult = await db.query(
      `SELECT transcript FROM results WHERE jobId = $1`,
      [id],
    );

    const transcript = statusDbResult.rowCount
      ? statusDbResult.rows[0]?.transcript
      : "";

    return res.status(200).json({
      status: true,
      data: transcript,
    });
  } catch (err) {
    next(err);
  }
};

const getJobHistory = async (req, res, next) => {
  try {
    const parseResult = getJobHistorySchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        status: false,
        message: "invalid status",
      });
    }
    const status = req.body.status;
    let dbResult = "";
    if (status === "all-status") {
      dbResult = await db.query(`SELECT * FROM results`);
    } else {
      dbResult = await db.query(`SELECT * FROM results WHERE status = $1`, [
        status,
      ]);
    }

    if (!dbResult.rowCount) {
      return res.status(200).json({
        status: false,
        data: [],
      });
    }

    const payload = dbResult.rows;
    return res.status(200).json({
      status: true,
      data: payload,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { transcribe, getJobStatus, getJobHistory, getTranscript };

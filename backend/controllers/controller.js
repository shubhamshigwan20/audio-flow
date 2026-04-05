const { v4: uuid } = require("uuid");
const fs = require("fs-extra");
const db = require("../db/db");
const { processTranscribe } = require("../utils/helper");

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
      await db.query(`UPDATE results SET status= $1 WHERE jobId= $2`, [
        "download-queue",
        jobId,
      ]);
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { transcribe };

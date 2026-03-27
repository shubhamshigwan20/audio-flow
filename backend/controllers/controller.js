const downloadQueue = require("../utils/queue");
const { v4: uuid } = require("uuid");
const path = require("path");
const { upload, getPresignedURL } = require("../utils/supabaseClient");

const transcribe = async (req, res, next) => {
  //schema cheq
  try {
    console.log("a45", req.file);
    if (!req.file) {
      return res.status(400).json({
        status: false,
        message: "audio file not found",
      });
    }
    const { originalname, mimetype } = req.file;
    console.log("req file -> ", req.file);

    if (!mimetype || !mimetype.startsWith("audio/")) {
      return res.status(400).json({
        status: false,
        message: "only audio files are allowed.",
      });
    }
    const jobId = uuid();

    const fileExt = path.extname(originalname).slice(1); // "mp3"
    const fileName = `${jobId}.${fileExt}`;
    const filePath = await upload(req.file, fileName);
    console.log("path ->", filePath);

    const payload = {
      jobId,
      supabasePath: filePath,
    };
    console.log("download queue payload ->", payload);

    const result = await downloadQueue.add("job", payload);
    console.log(`transcription ${result.id} added to download queue`);
    return res.status(200).json({
      status: true,
      message: `transcription ${result.id} added to download queue`,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { transcribe };

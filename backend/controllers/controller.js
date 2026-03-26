const downloadQueue = require("../utils/queue");
const { v4: uuid } = require("uuid");
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
    const { mimetype } = req.file;
    console.log("req file -> ", req.file);

    if (!mimetype || !mimetype.startsWith("audio/")) {
      return res.status(400).json({
        status: false,
        message: "only audio files are allowed.",
      });
    }
    const path = await upload(req.file);
    console.log("path ->", path);
    const presignedURL = await getPresignedURL(path);
    console.log("presigned url ->", presignedURL);

    const jobId = uuid();
    const payload = {
      jobId,
      presignedURL,
    };
    console.log("download queue payload ->", payload);

    const result = await downloadQueue.add("job", payload);
    return res.status(200).json({
      status: true,
      message: `transcription ${result.id} added to download queue`,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { transcribe };

const { v4: uuid } = require("uuid");
const { processTranscribe } = require("../utils/helper");
const { fromFile } = require("file-type");

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

    const detected = await fromFile(fileObj.path);

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

    res
      .status(202)
      .json({ status: true, message: "file uploaded success", jobId });

    setImmediate(() => processTranscribe(jobId, fileObj));
  } catch (err) {
    next(err);
  }
};

module.exports = { transcribe };

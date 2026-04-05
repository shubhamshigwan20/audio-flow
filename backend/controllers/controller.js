const { v4: uuid } = require("uuid");
const { processTranscribe } = require("../utils/helper");

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

    const { mimetype } = fileObj;
    console.log("req file -> ", fileObj);
    console.log("mimetype ->", mimetype);

    if (!mimetype || !mimetype.startsWith("audio/")) {
      return res.status(400).json({
        status: false,
        message: "only audio files are allowed.",
      });
    }

    //create a unique job id
    const jobId = uuid();
    console.log("jobId ->", jobId);

    res
      .status(202)
      .json({ status: true, message: "file uploaded success", jobId });

    setImmediate(() => processTranscribe(jobId, fileObj));
  } catch (err) {
    next(err);
  }
};

module.exports = { transcribe };

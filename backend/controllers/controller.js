const { v4: uuid } = require("uuid");
const { processTranscribe } = require("../utils/helper");

const transcribe = async (req, res, next) => {
  //schema cheq
  try {
    const fileObj = req.file;
    const { mimetype } = fileObj;
    console.log("req file -> ", fileObj);
    console.log("mimetype ->", mimetype);
    if (!fileObj) {
      return res.status(400).json({
        status: false,
        message: "audio file not found",
      });
    }

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

    // const fileExt = path.extname(originalname).slice(1); // "mp3"
    // const fileName = `${jobId}.${fileExt}`;
    // const filePath = await upload(req.file, fileName);
    // console.log("path ->", filePath);

    // const payload = {
    //   jobId,
    //   supabasePath: filePath,
    // };
    // console.log("download queue payload ->", payload);

    // const result = await downloadQueue.add("job", payload);
    // console.log(`transcription ${result.id} added to download queue`);
    // return res.status(200).json({
    //   status: true,
    //   message: `transcription ${result.id} added to download queue`,
    // });
  } catch (err) {
    next(err);
  }
};

module.exports = { transcribe };

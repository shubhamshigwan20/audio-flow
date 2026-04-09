const router = require("express").Router();
const {
  transcribe,
  getJobStatus,
  getJobHistory,
  getTranscript,
} = require("../controllers/controller");
const { fileUploadHandler } = require("../middleware/fileUpload.middleware");

router.post("/transcribe", fileUploadHandler(), transcribe);
router.get("/jobs/:id", getJobStatus);
router.post("/jobs", getJobHistory);
router.get("/jobs/:id/transcript", getTranscript);

module.exports = router;

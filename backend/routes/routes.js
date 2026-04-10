const router = require("express").Router();
const {
  transcribe,
  getJobStatus,
  getJobHistory,
  getTranscript,
  getGoogleToken,
  transcribeGDrive,
} = require("../controllers/controller");
const { fileUploadHandler } = require("../middleware/fileUpload.middleware");

router.post("/transcribe", fileUploadHandler(), transcribe);
router.post("/transcribe-gdrive", transcribeGDrive);
router.get("/jobs/:id", getJobStatus);
router.post("/jobs", getJobHistory);
router.get("/jobs/:id/transcript", getTranscript);
router.post("/auth/google-token", getGoogleToken);

module.exports = router;

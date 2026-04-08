const router = require("express").Router();
const {
  transcribe,
  getJobStatus,
  getJobHistory,
} = require("../controllers/controller");
const { fileUploadHandler } = require("../middleware/fileUpload.middleware");

router.post("/transcribe", fileUploadHandler(), transcribe);
router.get("/jobs/:id", getJobStatus);
router.post("/jobs", getJobHistory);

module.exports = router;

const router = require("express").Router();
const { transcribe, getJobStatus } = require("../controllers/controller");
const { fileUploadHandler } = require("../middleware/fileUpload.middleware");

router.post("/transcribe", fileUploadHandler(), transcribe);
router.get("/jobs/:id", getJobStatus);

module.exports = router;

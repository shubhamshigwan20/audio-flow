const router = require("express").Router();
const { transcribe } = require("../controllers/controller");
const { fileUploadHandler } = require("../middleware/fileUpload.middleware");

router.post("/transcribe", fileUploadHandler(), transcribe);

module.exports = router;

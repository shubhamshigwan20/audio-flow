const router = require("express").Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { transcribe } = require("../controllers/controller");

router.post("/transcribe", upload.single("file"), transcribe);

module.exports = router;

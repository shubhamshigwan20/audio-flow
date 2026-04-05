const multer = require("multer");
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 1000 * 1024 * 1024, // 1GB in bytes
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("audio/")) {
      return cb(new Error("Only audio files are allowed."));
    }
    cb(null, true);
  },
});

const fileUploadHandler = () => {
  return upload.single("file");
};
module.exports = { fileUploadHandler };

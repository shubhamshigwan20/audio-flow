const multer = require("multer");
const errorHandler = async (err, req, res, next) => {
  if (!err) {
    next();
  }
  console.log("error ->", err);

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        status: false,
        message: "file too large. maximum allowed size is 1 GB.",
      });
    }
  }
  return res.status(500).json({
    status: false,
    message: "internal server error",
  });
};

module.exports = errorHandler;

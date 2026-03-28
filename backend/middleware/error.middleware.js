const errorHandler = async (err, req, res, next) => {
  if (!err) {
    next();
  }
  console.log("error ->", err);
  return res.status(500).json({
    status: false,
    message: "internal server error",
  });
};

module.exports = errorHandler;

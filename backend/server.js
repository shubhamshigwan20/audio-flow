require("dotenv").config();
const express = require("express");
const app = express();
const helmet = require("helmet");
const cors = require("cors");
const routes = require("./routes/routes");
const errorHandler = require("./middleware/error.middleware");

const PORT = process.env.PORT || 80;

app.get("/", (req, res) => {
  return res.status(200).json({
    status: true,
    service: "backend",
    timestamp: new Date().toISOString(),
    message: "check README.md file for usage instructions"
  });
});

app.get("/health", (req, res) => {
  return res.status(200).json({
    status: true,
  });
});

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(routes);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});

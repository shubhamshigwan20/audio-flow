// const ffmpeg = require("fluent-ffmpeg");
// const axios = require("axios");
// const fs = require("fs-extra");
// const path = require("path");
// const os = require("os");

// async function downloadFile(url, outputPath) {
//   const response = await axios({
//     method: "GET",
//     url,
//     responseType: "stream",
//   });

//   if (response.status < 200 || response.status >= 300) {
//     throw new Error(`Failed to download audio. HTTP ${response.status}`);
//   }

//   const writer = fs.createWriteStream(outputPath);

//   response.data.pipe(writer);

//   return new Promise((resolve, reject) => {
//     writer.on("finish", () => resolve(outputPath));
//     writer.on("error", reject);
//   });
// }

// module.exports = { downloadFile };

const axios = require("axios");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");

const fsPromises = require("fs/promises");

async function getFileSizeBytes(filePath) {
  const stats = await fsPromises.stat(filePath);
  return stats.size; // bytes
}

async function downloadMp3(url, outputPath) {
  const response = await axios({
    method: "GET",
    url: url,
    responseType: "stream",
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Failed to download audio. HTTP ${response.status}`);
  }

  const writer = fs.createWriteStream(outputPath);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

function convertMp3ToWav(input, output) {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .audioChannels(1) // mono
      .audioFrequency(16000) // 16 kHz
      .format("wav")
      .on("end", () => {
        console.log("converted to wav");
        resolve();
      })
      .on("error", reject)
      .save(output);
  });
}

module.exports = { downloadMp3, convertMp3ToWav, getFileSizeBytes };

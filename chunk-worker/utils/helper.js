const ffmpeg = require("fluent-ffmpeg");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");

async function downloadFile(url, outputPath) {
  const response = await axios({
    method: "GET",
    url,
    responseType: "stream",
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Failed to download audio. HTTP ${response.status}`);
  }

  const writer = fs.createWriteStream(outputPath);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve(outputPath));
    writer.on("error", reject);
  });
}

function getAudioDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format.duration);
    });
  });
}

async function splitAudio(inputPath, jobId) {
  const duration = await getAudioDuration(inputPath);
  console.log("split audio duration ->", duration);

  const CHUNK_DURATION = Number(process.env.CHUNK_DURATION) || 30; // seconds
  const OVERLAP = Number(process.env.CHUNK_OVERLAP) || 3; // seconds

  const chunks = [];

  let start = 0;
  let index = 0;

  const jobTempDir = path.join(os.tmpdir(), "audio_chunks", String(jobId));

  while (start < duration) {
    await fs.ensureDir(jobTempDir);
    const outputPath = path.join(jobTempDir, `chunk_${index}.wav`);
    console.log("split audio output path", outputPath);

    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(start)
        .setDuration(CHUNK_DURATION)
        .output(outputPath)
        .on("end", resolve)
        .on("error", reject)
        .run();
    });

    const buffer = await fs.readFile(outputPath);
    console.log("split audio buffer", buffer);
    chunks.push(buffer);
    await fs.remove(outputPath);

    // Move forward with overlap
    start += CHUNK_DURATION - OVERLAP;
    index++;
  }
  console.log("split audio remove input file ->", inputPath);
  // Cleanup input file
  await fs.remove(inputPath);

  return chunks;
}

module.exports = { downloadFile, splitAudio, getAudioDuration };

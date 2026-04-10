require("dotenv").config();
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");
const { downloadQueue, connection } = require("./queue");
const { upload } = require("./supabaseClient");
const db = require("../db/db");
const { getDriveClientWithRefreshToken } = require("../utils/googleAuth");

if (process.env.FFMPEG_PATH) {
  ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
}

if (process.env.FFPROBE_PATH) {
  ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);
}

function ffprobeAsync(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata);
    });
  });
}

function calculateChunkDuration({ sampleRate, channels, maxSizeMB }) {
  const bytesPerSample = 2; // 16-bit PCM
  const maxBytes = Number(maxSizeMB) * 1024 * 1024;
  if (!Number.isFinite(maxBytes) || maxBytes <= 0) {
    throw new Error("Invalid maxSizeMB for chunk duration calculation.");
  }
  return Math.floor(maxBytes / (sampleRate * channels * bytesPerSample));
}

const calculateDuration = async (file) => {
  const metadata = await ffprobeAsync(file.path);

  const streams = Array.isArray(metadata.streams) ? metadata.streams : [];
  const audioStream =
    streams.find((s) => s.codec_type === "audio") || streams[0];
  if (!audioStream) {
    throw new Error("ffprobe did not return any audio streams.");
  }

  const sampleRate = Number(audioStream.sample_rate);
  const channels = Number(audioStream.channels);
  if (!Number.isFinite(sampleRate) || !Number.isFinite(channels)) {
    throw new Error("Invalid audio stream metadata from ffprobe.");
  }

  const maxSizeMB = Math.min(
    Number(process.env.SUPABASE_MAX_MB || 50),
    Number(process.env.WHISPER_MAX_MB || 25),
  );

  const duration = calculateChunkDuration({
    sampleRate,
    channels,
    maxSizeMB,
  });
  return duration;
};

function getAudioDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format.duration);
    });
  });
}

async function splitAudio(fileObj, jobId, chunkDuration = 120) {
  const inputPath = fileObj.path;
  console.log("input path ->", inputPath);
  console.log("file Obj ->", fileObj);
  const duration = await getAudioDuration(inputPath);
  console.log("split audio duration ->", duration);

  const chunks = [];

  let start = 0;
  let index = 0;

  const jobTempDir = path.join(os.tmpdir(), "audio_chunks", String(jobId));
  console.log("temp job dir ->", jobTempDir);
  const extWithDot = `.${fileObj.originalname.split(".").pop()}`; // ".mp3"
  console.log("extension ->", extWithDot);

  while (start < duration) {
    await fs.ensureDir(jobTempDir);
    const outputPath = path.join(jobTempDir, `chunk_${index}${extWithDot}`);
    console.log("split audio output path", outputPath);

    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(start)
        .setDuration(chunkDuration)
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
    start += chunkDuration;
    index++;
  }
  console.log("split audio remove input file ->", inputPath);
  // Cleanup input file
  await fs.remove(inputPath);

  return { chunks, duration };
}

const processTranscribe = async (jobId, fileObj) => {
  console.log("file obj ->", fileObj);
  const chunkDurationEnv = Number(process.env.CHUNK_DURATION);
  const chunkDuration = chunkDurationEnv
    ? chunkDurationEnv
    : await calculateDuration(fileObj);
  console.log("chunk duration ->", chunkDuration);
  const { chunks, duration } = await splitAudio(fileObj, jobId, chunkDuration);
  console.log("chunks ->", chunks);

  const totalInitialChunks = chunks.length;
  await db.query(
    `UPDATE results SET initial = $1, duration = $2 WHERE jobid = $3`,
    [totalInitialChunks, duration, jobId],
  );

  await connection.set(`job:${jobId}:totalInitialChunks`, totalInitialChunks);
  const extWithDot = `.${fileObj.originalname.split(".").pop()}`; // ".mp3"
  console.log("extension ->", extWithDot);

  for (let i = 0; i < chunks.length; i++) {
    if (i === chunks.length - 1) {
      await db.query(`UPDATE results SET status= $1 WHERE jobid= $2`, [
        "queued",
        jobId,
      ]);
    }

    const chunkKey = `${jobId}_${i}${extWithDot}`;
    console.log(`chunk ${i} size ->`, chunks[i].length / (1024 * 1024));
    const chunkUrl = await upload(chunks[i], chunkKey, fileObj.mimetype);

    const downloadPayload = {
      jobId,
      chunkIndex: i,
      chunkUrl,
    };

    console.log(`download queue payload ${JSON.stringify(downloadPayload)}`);

    const result = await downloadQueue.add("job", downloadPayload, {
      attempts: 3,
      removeOnComplete: 5, // keep last 100
      removeOnFail: 2,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
    });
    console.log(`file ${result.id} added to download queue`);
  }
};

const downloadGoogleDriveMp3 = async (refreshToken, fileId, mp3File) => {
  const drive = await getDriveClientWithRefreshToken(refreshToken);

  const fileMeta = await drive.files.get({
    fileId,
    fields: "name, mimeType",
  });

  const allowedMimeTypes = [
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/x-wav",
    "audio/ogg",
    "audio/mp4",
  ];

  if (!allowedMimeTypes.includes(fileMeta.data.mimeType)) {
    throw new Error(`Invalid file type: ${fileMeta.data.mimeType}`);
  }

  const response = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "stream" },
  );

  const writer = fs.createWriteStream(mp3File);
  response.data.pipe(writer);

  console.log(
    `file saved to disk output path ${mp3File} fileId ${fileId} originalName ${fileMeta.data.name}`,
  );
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};

module.exports = {
  calculateDuration,
  processTranscribe,
  downloadGoogleDriveMp3,
};

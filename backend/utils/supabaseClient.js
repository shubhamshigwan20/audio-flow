require("dotenv").config();
const fs = require("fs/promises");
const { createClient } = require("@supabase/supabase-js");

const PROJECT_URL = process.env.SUPABASE_PROJECT_URL;
const API_KEY = process.env.SUPABASE_API_KEY;
const BUCKET = process.env.SUPABASE_BUCKET;
const FOLDER = process.env.SUPABASE_FOLDER;

const supabase = createClient(PROJECT_URL, API_KEY);
const upload = async (file) => {
  if (!PROJECT_URL || !API_KEY || !BUCKET || !FOLDER || !file) {
    return;
  }
  const { originalname, mimetype, path } = file;
  const buffer = await fs.readFile(path);
  const fileName = originalname;
  const filePath = `${FOLDER}/${fileName}`;
  console.log("file name ->", fileName);
  console.log("filePath ->", filePath);

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, buffer, {
      contentType: mimetype || "audio/mpeg",
      upsert: false,
    });
  console.log("data ->", data);
  console.log("error ->", error);
  console.log("data path ->", data.path);

  if (error) {
    throw new Error();
  }

  return data.path;
};

const getPresignedURL = async (filePath) => {
  if (!PROJECT_URL || !API_KEY || !BUCKET || !FOLDER || !filePath) {
    return;
  }
  console.log("file path ->", filePath);
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(filePath, 3600);

  if (error) {
    throw new Error();
  }
  console.log("data ->", data);
  console.log("error ->", error);
  console.log("data signed url ->", data.signedUrl);
  return data.signedUrl;
};

const deleteFile = async (req, res) => {
  const { folder, filename } = req.body;
  const data = await supabase.storage.from(BUCKET).remove([folder, filename]);

  //   if (data) {
  //     return res.status(200).json({
  //       status: true,
  //       message: data,
  //     });
  //   }
};

module.exports = { upload, getPresignedURL, deleteFile };

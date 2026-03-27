require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const PROJECT_URL = process.env.SUPABASE_PROJECT_URL;
const API_KEY = process.env.SUPABASE_API_KEY;
const BUCKET = process.env.SUPABASE_BUCKET;
const FOLDER = process.env.SUPABASE_FOLDER;

const supabase = createClient(PROJECT_URL, API_KEY);
const upload = async (buffer, fileName, contentType = "audio/wav") => {
  if (!PROJECT_URL || !API_KEY || !BUCKET || !buffer || !fileName) {
    return;
  }

  const filePath = `${FOLDER}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, buffer, { contentType, upsert: false });

  if (error) throw new Error(error.message);
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

module.exports = { upload, getPresignedURL };

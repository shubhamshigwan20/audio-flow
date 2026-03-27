require("dotenv").config();
const fs = require("fs");
const Groq = require("groq-sdk");

// Initialize the Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const groqTranscribe = async (
  type,
  wavFile,
  presignedUrl,
  transcriptionModel,
) => {
  // Create a transcription job
  console.log("groq wav file ->", wavFile);
  const source =
    type === "google-drive"
      ? { file: fs.createReadStream(wavFile) }
      : { url: presignedUrl };

  const transcription = await groq.audio.transcriptions.create({
    ...source,
    model: transcriptionModel,
    language: "en",
    temperature: 0.0,
  });
  // To print only the transcription text, you'd use console.log(transcription.text); (here we're printing the entire transcription object to access timestamps)
  console.log("stt output -> ", JSON.stringify(transcription, null, 2));
  return transcription.text;
};

module.exports = groqTranscribe;

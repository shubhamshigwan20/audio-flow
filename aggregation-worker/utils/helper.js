const { connection } = require("./queue");
async function getAllChunkResults(jobId) {
  const key = `job:${jobId}:chunks`;

  const data = await connection.hgetall(key);
  console.log("redis stored data getallchunks ->", data);

  // Convert to array
  const results = Object.entries(data).map(([chunkIndex, text]) => ({
    chunkIndex: Number(chunkIndex),
    text,
  }));
  console.log("getAllChunksResults results ->", results);

  return results;
}

function findOverlap(prevText, currentText) {
  const MAX_WINDOW = 50; // words

  console.log("prev text ->", prevText);
  console.log("current text ->", currentText);
  const prevWords = prevText.split(" ");
  const currWords = currentText.split(" ");

  console.log("prev words ->", prevWords);
  console.log("current words ->", currWords);

  const maxOverlap = Math.min(MAX_WINDOW, prevWords.length, currWords.length);

  console.log("max overlap ->", maxOverlap);
  for (let size = maxOverlap; size > 0; size--) {
    const prevSlice = prevWords.slice(-size).join(" ");
    const currSlice = currWords.slice(0, size).join(" ");

    console.log("prev slice ->", prevSlice);
    console.log("curr slice ->", currSlice);
    if (prevSlice === currSlice) {
      return currSlice.length;
    }
  }

  return 0;
}

function mergeWithOverlapHandling(chunks) {
  if (!chunks.length) return "";

  let finalText = chunks[0].text.trim();
  console.log("merge with overlap final text ->", finalText);

  for (let i = 1; i < chunks.length; i++) {
    const prevText = finalText;
    const currentText = chunks[i].text.trim();

    console.log("merge with overlap prev text ->", prevText);
    console.log("merge with overlap current text ->", currentText);

    const overlap = findOverlap(prevText, currentText);
    console.log("merge wo overlap ->", overlap);

    finalText += " " + currentText.slice(overlap).trim();
  }
  console.log("merge wo final text ->", finalText);
  return finalText;
}

module.exports = { getAllChunkResults, mergeWithOverlapHandling };

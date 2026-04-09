const allowedMimeType = ["audio/mpeg", "audio/wav"]
const jobStatuses = [
  { key: "all-status", value: "All Status" },
  { key: "received", value: "Recieved" },
  { key: "queued", value: "Queued" },
  { key: "processing", value: "Processing" },
  { key: "done", value: "Done" },
]

export { allowedMimeType, jobStatuses }

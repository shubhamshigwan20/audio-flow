import InsightsCard from "./components/InsightsCard"
import PipelineProgressCard from "./components/PipelineProgressCard"
import TranscriptionPreviewCard from "./components/TranscriptionPreviewCard"

const JobStatus = () => {
  const headers = {
    status: "Transcribing",
    totalChunks: 20,
    chunksDone: 14,
    elapsedTime: 145,
    remainingTime: 45,
  }
  return (
    <div className="flex flex-col gap-7 py-5">
      <InsightsCard fileName="interview.mp3" jobId="abc123" headers={headers} />
      <PipelineProgressCard />
      <TranscriptionPreviewCard />
    </div>
  )
}

export default JobStatus

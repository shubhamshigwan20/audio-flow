import { useEffect } from "react"
import { useParams } from "react-router-dom"
import InsightsCard from "./components/InsightsCard"
import PipelineProgressCard from "./components/PipelineProgressCard"
import TranscriptionPreviewCard from "./components/TranscriptionPreviewCard"
import { JOB_STATUS } from "@/constants/endpoints"
import api from "@/api/api"
import useJobStatus from "@/store/JobStatusStore"

const JobStatus = () => {
  const headers = {
    status: "Transcribing",
    totalChunks: 20,
    chunksDone: 14,
    elapsedTime: 145,
    remainingTime: 45,
  }
  const { jobId = "" } = useParams<{ jobId: string }>()
  const setJobData = useJobStatus((state) => state.setJobData)
  const jobIdStore = useJobStatus((state) => state.jobId)

  useEffect(() => {
    if (!jobId) return

    const fetchData = async () => {
      try {
        const result = await api.get(JOB_STATUS(jobId))
        setJobData(result.data.data)
      } catch (err) {
        console.log(err)
      }
    }
    fetchData()
  }, [jobId])
  return (
    <div className="flex flex-col gap-7 py-5">
      <InsightsCard fileName={""} jobId={jobIdStore} headers={headers} />
      <PipelineProgressCard />
      <TranscriptionPreviewCard />
    </div>
  )
}

export default JobStatus

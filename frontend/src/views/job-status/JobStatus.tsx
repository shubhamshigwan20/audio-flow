import { useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import InsightsCard from "./components/InsightsCard"
import PipelineProgressCard from "./components/PipelineProgressCard"
import TranscriptionPreviewCard from "./components/TranscriptionPreviewCard"
import { GET_TRANSCRIPT, JOB_STATUS } from "@/constants/endpoints"
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
  const setTranscriptData = useJobStatus((state) => state.setTranscriptData)
  const jobIdStore = useJobStatus((state) => state.jobId)
  const checkStatus = useRef(true)

  useEffect(() => {
    if (!jobId) return

    // eslint-disable-next-line prefer-const
    let intervalId: ReturnType<typeof setInterval>

    const fetchData = async () => {
      try {
        const result = await api.get(JOB_STATUS(jobId))
        setJobData(result.data.data)
        if (result.data.data?.status === "done") {
          checkStatus.current = false
          clearInterval(intervalId)
        }
        if (result.data.data?.status === "done") {
          const transcriptApiResult = await api.get(GET_TRANSCRIPT(jobId))
          setTranscriptData(transcriptApiResult.data.data)
        }
      } catch (err) {
        console.log(err)
      }
    }
    fetchData()
    intervalId = setInterval(fetchData, 4000)

    return () => {
      clearInterval(intervalId)
    }
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

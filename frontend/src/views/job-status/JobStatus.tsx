import { useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import InsightsCard from "./components/InsightsCard"
import PipelineProgressCard from "./components/PipelineProgressCard"
import TranscriptionPreviewCard from "./components/TranscriptionPreviewCard"
import { GET_TRANSCRIPT, JOB_STATUS } from "@/constants/endpoints"
import api from "@/api/api"
import useJobStatus from "@/store/JobStatusStore"
// import useLoaderState from "@/store/LoaderStateStore"

const JobStatus = () => {
  const { jobId = "" } = useParams<{ jobId: string }>()
  const setJobData = useJobStatus((state) => state.setJobData)
  const setTranscriptData = useJobStatus((state) => state.setTranscriptData)
  // const setIsOpen = useLoaderState((state) => state.setIsOpen)
  const checkStatus = useRef(true)

  useEffect(() => {
    if (!jobId) return

    // eslint-disable-next-line prefer-const
    let intervalId: ReturnType<typeof setInterval>

    const fetchData = async () => {
      try {
        // setIsOpen(true)
        const result = await api.get(JOB_STATUS(jobId))
        // setIsOpen(false)
        setJobData(result.data.data)
        if (result.data.data?.status === "done") {
          checkStatus.current = false
          clearInterval(intervalId)
        }
        if (result.data.data?.status === "done") {
          // setIsOpen(true)
          const transcriptApiResult = await api.get(GET_TRANSCRIPT(jobId))
          setTranscriptData(transcriptApiResult.data.data)
          // setIsOpen(false)
        }
      } catch (err) {
        console.log(err)
        // setIsOpen(false)
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
      <InsightsCard />
      <PipelineProgressCard />
      <TranscriptionPreviewCard />
    </div>
  )
}

export default JobStatus

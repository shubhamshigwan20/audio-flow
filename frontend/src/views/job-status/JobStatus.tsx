import { useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import InsightsCard from "./components/InsightsCard"
import PipelineProgressCard from "./components/PipelineProgressCard"
import TranscriptionPreviewCard from "./components/TranscriptionPreviewCard"
import { GET_TRANSCRIPT, JOB_STATUS } from "@/constants/endpoints"
import api from "@/api/api"
import useJobStatus from "@/store/JobStatusStore"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

const JobStatus = () => {
  const { jobId = "" } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const setJobData = useJobStatus((state) => state.setJobData)
  const setTranscriptData = useJobStatus((state) => state.setTranscriptData)
  const checkStatus = useRef(true)

  useEffect(() => {
    if (!jobId) return

    let intervalId: ReturnType<typeof setInterval>

    const fetchData = async () => {
      try {
        const result = await api.get(JOB_STATUS(jobId))
        setJobData(result.data.data)
        if (result.data.data?.status === "done") {
          checkStatus.current = false
          clearInterval(intervalId)
          const transcriptApiResult = await api.get(GET_TRANSCRIPT(jobId))
          setTranscriptData(transcriptApiResult.data.data)
        }
      } catch (err) {
        console.log(err)
      }
    }

    fetchData()
    intervalId = setInterval(fetchData, 4000)

    return () => clearInterval(intervalId)
  }, [jobId])

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2 gap-1.5 text-xs text-muted-foreground"
          onClick={() => navigate("/job-history")}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to My Jobs
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Job Status</h1>
        <p className="mt-1 font-mono text-sm text-muted-foreground">{jobId}</p>
      </div>

      <div className="flex flex-col gap-5">
        <InsightsCard />
        <PipelineProgressCard />
        <TranscriptionPreviewCard />
      </div>
    </div>
  )
}

export default JobStatus

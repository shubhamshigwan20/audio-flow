import { useState, useCallback } from "react"
import StatusDropdown from "./components/StatusDropdown"
import JobCard from "./components/JobCard"
import { JOB_HISTORY } from "@/constants/endpoints"
import api from "@/api/api"
import useLoaderState from "@/store/LoaderStateStore"
import { Inbox } from "lucide-react"

type APICardType = {
  jobid: string
  status: string
  transcript: string
  filename: string
  size: number
  duration: number
  created_at: string
}

type CardType = {
  fileName: string
  jobId: string
  status: string
  size: number
  duration: number
  createdAt: string
}

const JobHistory = () => {
  const [jobCards, setJobCards] = useState<CardType[]>([])
  const [hasFetched, setHasFetched] = useState(false)
  const setIsOpen = useLoaderState((state) => state.setIsOpen)

  const fetchJobHistory = useCallback(
    async (status: string) => {
      try {
        setIsOpen(true)
        const results = await api.post(JOB_HISTORY, { status })
        setIsOpen(false)
        setHasFetched(true)
        if (results.status === 200) {
          const jobs = results.data.data.map((card: APICardType) => ({
            fileName: card.filename,
            jobId: card.jobid,
            status: card.status,
            size: Number(card.size),
            duration: Number(card.duration),
            createdAt: card.created_at,
          }))
          setJobCards(jobs)
        }
      } catch (err) {
        setIsOpen(false)
        setHasFetched(true)
        console.log(err)
      }
    },
    [api, JOB_HISTORY, setIsOpen]
  )

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Jobs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View and track all your transcription jobs.
          </p>
        </div>
        <StatusDropdown fetchJobHistory={fetchJobHistory} />
      </div>

      {/* Job List */}
      {hasFetched && jobCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Inbox className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">
            No jobs found
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try changing the status filter or upload a new file.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {jobCards.map((card) => (
            <JobCard key={card.jobId} card={card} />
          ))}
        </div>
      )}
    </div>
  )
}

export default JobHistory

import { useCallback, useState } from "react"
import StatusDropdown from "./components/StatusDropdown"
import JobCard from "./components/JobCard"
import { JOB_HISTORY } from "@/constants/endpoints"
import api from "@/api/api"

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

  const fetchJobHistory = useCallback(async (status: string) => {
    try {
      const payload = { status: status }
      const results = await api.post(JOB_HISTORY, payload)
      if (results.status === 200) {
        const jobCards = results.data.data
        const jobs = jobCards.map((card: APICardType) => {
          return {
            fileName: card.filename,
            jobId: card.jobid,
            status: card.status,
            size: Number(card.size),
            duration: Number(card.duration),
            createdAt: card.created_at,
          }
        })
        setJobCards(jobs)
      }
    } catch (err) {
      console.log(err)
    }
  }, [])

  return (
    <div className="flex flex-col gap-3 py-2">
      <StatusDropdown fetchJobHistory={fetchJobHistory} />
      {jobCards.map((card) => (
        <JobCard key={card.jobId} card={card} />
      ))}
    </div>
  )
}

export default JobHistory

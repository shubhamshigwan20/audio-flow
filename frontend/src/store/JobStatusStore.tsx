import { create } from "zustand"

type JobProgressType = {
  converted: number
  initialChunks: number
  total: number
  transcribed: number
}

type FileStatusType = {
  jobId: string
  progress: JobProgressType
  status: string
  transcript: string
}

interface JobStatusState {
  jobId: string
  status: string
  progress: JobProgressType
  transcript: string
  setJobData: (data: FileStatusType) => void
}

const useJobStatus = create<JobStatusState>((set) => ({
  jobId: "",
  status: "",
  progress: {
    converted: 0,
    initialChunks: 0,
    total: 0,
    transcribed: 0,
  },
  transcript: "",
  setJobData: (data: FileStatusType) =>
    set(() => ({
      jobId: data.jobId,
      status: data.status,
      progress: data.progress,
      transcript: data.transcript,
    })),
}))

export default useJobStatus

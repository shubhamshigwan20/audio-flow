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
  created_at: string
  completed_at: string
  transcript: string
}

interface JobStatusState {
  jobId: string
  status: string
  progress: JobProgressType
  transcript: string
  createdAt: string
  completedAt: string
  setJobData: (data: FileStatusType) => void
  setTranscriptData: (data: string) => void
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
  createdAt: "",
  completedAt: "",
  transcript: "",
  setJobData: (data: FileStatusType) =>
    set(() => ({
      jobId: data.jobId,
      status: data.status,
      progress: data.progress,
      createdAt: data.created_at,
      completedAt: data.completed_at,
    })),
  setTranscriptData: (data: string) => set(() => ({ transcript: data })),
}))

export default useJobStatus

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import useJobStatus from "@/store/JobStatusStore"
import { formatSeconds } from "@/utils/helper"

type HeadersType = {
  status: string
  totalChunks: number
  chunksDone: number
  elapsedTime: number
  remainingTime: number
}

type InsightsCardPropType = {
  fileName: string
  jobId: string
  headers: HeadersType
}

const InsightsCard = (props: InsightsCardPropType) => {
  const { fileName, jobId, headers } = props
  const status = useJobStatus((state) => state.status)
  const progress = useJobStatus((state) => state.progress)
  const createdAt = useJobStatus((state) => state.createdAt)
  const completedAt = useJobStatus((state) => state.completedAt)

  const getElapsedTime = () => {
    let secondsElapsed: number = 0
    const dbTime = new Date(createdAt).getTime()

    if (completedAt) {
      const completeTime = new Date(completedAt).getTime()
      secondsElapsed = (completeTime - dbTime) / 1000
    } else {
      const now = new Date().getTime()
      secondsElapsed = (now - dbTime) / 1000
    }

    return formatSeconds(secondsElapsed)
  }
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>{fileName}</CardTitle>
          <CardDescription>{jobId}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            <div>
              <p>Stage</p>
              <p>
                <Badge variant="default">{status}</Badge>
              </p>
            </div>
            <div>
              <p>Chunks Done</p>
              <p>{`${progress.transcribed}/${progress.total}`}</p>
            </div>
            <div>
              <p>Elapsed</p>
              <p>{getElapsedTime()}</p>
            </div>
            <div>
              <p>Est. remaining</p>
              <p>~{headers.remainingTime}s</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default InsightsCard

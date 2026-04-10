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

const InsightsCard = () => {
  const fileName = useJobStatus((state) => state.filename)
  const jobIdStore = useJobStatus((state) => state.jobId)
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
          <CardDescription>{jobIdStore}</CardDescription>
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
              <p>~{0}s</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default InsightsCard

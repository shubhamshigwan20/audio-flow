import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import useJobStatus from "@/store/JobStatusStore"

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
              <p>{`${headers.chunksDone}/${headers.totalChunks}`}</p>
            </div>
            <div>
              <p>Elapsed</p>
              <p>{headers.elapsedTime}s</p>
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

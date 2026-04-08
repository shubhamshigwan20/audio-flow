import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

type CardType = {
  fileName: string
  jobId: string
  status: string
  size: number
  duration: number
}

type JobCardPropsType = {
  card: CardType
}

const JobCard = (props: JobCardPropsType) => {
  const { card } = props
  const navigate = useNavigate()
  const handleTrackStatusClick = () => {
    navigate(`/job-status/${card.jobId}`)
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>{card.fileName}</CardTitle>
        <Separator />
        <CardDescription>
          <div className="flex justify-between">
            <span>{card.jobId}</span>
            <span>
              {card.size} | {card.duration}
            </span>
          </div>
        </CardDescription>
        <CardAction>
          <Badge variant="default">{card.status}</Badge>
        </CardAction>
      </CardHeader>
      <Separator />
      <CardContent>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTrackStatusClick}>
            Track Status
          </Button>
          {/* <Button variant="outline">Download .txt</Button> */}
        </div>
      </CardContent>
    </Card>
  )
}

export default JobCard

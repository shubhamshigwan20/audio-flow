import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { formatDate, formatSeconds } from "../../../utils/helper"
import { FileAudio, Clock, HardDrive, ArrowRight, Hash } from "lucide-react"

type CardType = {
  fileName: string
  jobId: string
  status: string
  size: number
  duration: number
  createdAt: string
}

type JobCardPropsType = {
  card: CardType
}

const statusConfig: Record<string, { label: string; className: string }> = {
  done: {
    label: "Done",
    className:
      "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  },
  processing: {
    label: "Processing",
    className:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  },
  queued: {
    label: "Queued",
    className:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  },
  received: {
    label: "Received",
    className:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
  error: {
    label: "Error",
    className:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  },
}

const JobCard = (props: JobCardPropsType) => {
  const { card } = props
  const navigate = useNavigate()
  const status = statusConfig[card.status] ?? {
    label: card.status,
    className: "",
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <FileAudio className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <CardTitle className="truncate text-base">
                {card.fileName}
              </CardTitle>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Hash className="h-3 w-3" />
                <span className="font-mono">{card.jobId}</span>
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`shrink-0 text-xs font-medium ${status.className}`}
          >
            {status.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              {(card.size / (1024 * 1024)).toFixed(2)} MB
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatSeconds(card.duration)}
            </span>
            <span>{formatDate(card.createdAt)}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={() => navigate(`/job-status/${card.jobId}`)}
          >
            View
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default JobCard

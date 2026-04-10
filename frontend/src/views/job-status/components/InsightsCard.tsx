import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import useJobStatus from "@/store/JobStatusStore"
import { formatSeconds } from "@/utils/helper"
import { FileAudio, Hash, Layers, Timer } from "lucide-react"

const statusConfig: Record<string, { className: string }> = {
  done: {
    className:
      "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  },
  processing: {
    className:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  },
  queued: {
    className:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  },
  received: {
    className:
      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
  error: {
    className:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  },
}

const InsightsCard = () => {
  const fileName = useJobStatus((state) => state.filename)
  const jobIdStore = useJobStatus((state) => state.jobId)
  const status = useJobStatus((state) => state.status)
  const progress = useJobStatus((state) => state.progress)
  const createdAt = useJobStatus((state) => state.createdAt)
  const completedAt = useJobStatus((state) => state.completedAt)

  const getElapsedTime = () => {
    if (!createdAt) return "—"
    const dbTime = new Date(createdAt).getTime()
    const secondsElapsed = completedAt
      ? (new Date(completedAt).getTime() - dbTime) / 1000
      : (new Date().getTime() - dbTime) / 1000
    return formatSeconds(secondsElapsed)
  }

  const statusStyle = statusConfig[status] ?? { className: "" }

  const stats = [
    {
      icon: <Layers className="h-4 w-4 text-muted-foreground" />,
      label: "Stage",
      value: status ? (
        <Badge
          variant="outline"
          className={`text-xs font-medium ${statusStyle.className}`}
        >
          {status}
        </Badge>
      ) : (
        "—"
      ),
    },
    {
      icon: <Hash className="h-4 w-4 text-muted-foreground" />,
      label: "Chunks Done",
      value: status ? `${progress.transcribed} / ${progress.total}` : "—",
    },
    {
      icon: <Timer className="h-4 w-4 text-muted-foreground" />,
      label: "Elapsed",
      value: getElapsedTime(),
    },
    {
      icon: <Timer className="h-4 w-4 text-muted-foreground" />,
      label: "Est. Remaining",
      value: status && status !== "done" ? `~${0}s` : "—",
    },
  ]

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <FileAudio className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <CardTitle className="truncate text-base">
              {fileName || "Waiting for data…"}
            </CardTitle>
            {jobIdStore && (
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                {jobIdStore}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg bg-muted/50 px-4 py-3">
              <div className="mb-1 flex items-center gap-1.5">
                {stat.icon}
                <p className="text-xs font-medium text-muted-foreground">
                  {stat.label}
                </p>
              </div>
              <div className="text-sm font-semibold">{stat.value}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default InsightsCard

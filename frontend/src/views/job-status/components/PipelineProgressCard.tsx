import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import useJobStatus from "@/store/JobStatusStore"
import { CheckCircle2, Loader2, Circle } from "lucide-react"

type StepStatus = "done" | "in-progress" | "waiting"

const StepIcon = ({ status }: { status: StepStatus }) => {
  if (status === "done")
    return <CheckCircle2 className="h-4 w-4 text-green-500" />
  if (status === "in-progress")
    return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
  return <Circle className="h-4 w-4 text-muted-foreground/40" />
}

const stepRowClass = (status: StepStatus) => {
  if (status === "done") return "text-foreground"
  if (status === "in-progress") return "text-foreground"
  return "text-muted-foreground"
}

const PipelineProgressCard = () => {
  const progress = useJobStatus((state) => state.progress)
  const status = useJobStatus((state) => state.status)

  const getOverallProgress = () => {
    if (status === "received") return 10
    if (status === "queued") return 20
    if (status === "done") return 100
    if (status === "processing") {
      if (progress.converted !== progress.initialChunks) {
        return 20 + (progress.converted / progress.initialChunks) * 30
      }
      return 50 + (progress.transcribed / progress.total) * 50
    }
    return 0
  }

  const getUploadSplitStatus = (): StepStatus => {
    if (status === "queued" || status === "processing" || status === "done")
      return "done"
    if (status === "received") return "in-progress"
    return "waiting"
  }

  const getConvertWAVStatus = (): StepStatus => {
    if (status === "received" || status === "queued") return "waiting"
    if (
      status === "processing" &&
      progress.converted !== progress.initialChunks
    )
      return "in-progress"
    if (status === "processing" || status === "done") return "done"
    return "waiting"
  }

  const getFineChunkingStatus = (): StepStatus => {
    if (status === "received" || status === "queued") return "waiting"
    if (
      status === "processing" &&
      progress.converted !== progress.initialChunks
    )
      return "in-progress"
    if (status === "processing" || status === "done") return "done"
    return "waiting"
  }

  const getTranscriptionStatus = (): StepStatus => {
    if (
      status === "done" ||
      (progress.total > 0 && progress.total === progress.transcribed)
    )
      return "done"
    if (status === "processing" && progress.transcribed > 0)
      return "in-progress"
    return "waiting"
  }

  const getAggregationStatus = (): StepStatus => {
    if (status === "done") return "done"
    return "waiting"
  }

  const steps = [
    {
      label: "Upload & Split",
      status: getUploadSplitStatus(),
      detail: progress.initialChunks
        ? `${progress.initialChunks} initial chunks`
        : null,
    },
    {
      label: "Convert to WAV",
      status: getConvertWAVStatus(),
      detail: progress.initialChunks
        ? `${progress.converted} / ${progress.initialChunks} chunks`
        : null,
    },
    {
      label: "Fine Chunking",
      status: getFineChunkingStatus(),
      detail: progress.total ? `${progress.total} sub-chunks` : null,
    },
    {
      label: "Transcription",
      status: getTranscriptionStatus(),
      detail: progress.total
        ? `${progress.transcribed} / ${progress.total} chunks`
        : null,
    },
    {
      label: "Aggregation",
      status: getAggregationStatus(),
      detail: null,
    },
  ]

  const overallProgress = getOverallProgress() ?? 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Pipeline Progress</CardTitle>
          <span className="text-sm font-semibold text-muted-foreground tabular-nums">
            {Math.round(overallProgress)}%
          </span>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {steps.map((step, i) => (
            <div
              key={step.label}
              className={`flex items-center justify-between rounded-lg px-3 py-2.5 ${step.status === "in-progress" ? "bg-blue-50/60 dark:bg-blue-950/20" : "hover:bg-muted/40"}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                  <StepIcon status={step.status} />
                </div>
                <div>
                  <p
                    className={`text-sm font-medium ${stepRowClass(step.status)}`}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {step.detail && (
                  <span className="text-xs text-muted-foreground">
                    {step.detail}
                  </span>
                )}
                <span
                  className={`flex items-center gap-1 text-xs font-medium ${
                    step.status === "done"
                      ? "text-green-600 dark:text-green-400"
                      : step.status === "in-progress"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-muted-foreground/60"
                  }`}
                >
                  {step.status === "done"
                    ? "Done"
                    : step.status === "in-progress"
                      ? "In progress"
                      : "Waiting"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default PipelineProgressCard

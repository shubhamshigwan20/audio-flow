import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import useJobStatus from "@/store/JobStatusStore"

const PipelineProgressCard = () => {
  const progress = useJobStatus((state) => state.progress)
  const status = useJobStatus((state) => state.status)

  const getOverallProgress = () => {
    if (status === "received") {
      return 10
    }
    if (status === "queued") {
      return 20
    }
    if (status === "processing") {
      if (progress.converted !== progress.initialChunks) {
        return 20 + (progress.converted / progress.initialChunks) * 30
      } else {
        return 50 + (progress.transcribed / progress.total) * 50
      }
    }
  }

  const getConvertedWAVStatus = () => {
    if (status === "received" || status === "queued") {
      return "Waiting"
    } else if (
      status === "processing" &&
      progress.converted !== progress.initialChunks
    ) {
      return "In progress"
    } else {
      return "Done"
    }
  }

  const getUploadSplitStatus = () => {
    if (status === "queued" || status === "processing" || status === "done") {
      return "Done"
    }
    return "In progress"
  }

  const getTranscriptionProgress = () => {
    if (
      progress.total === progress.transcribed &&
      (status === "processing" || status === "done")
    ) {
      return "Done"
    } else if (progress.transcribed === 0 && status !== "processing") {
      return "Waiting"
    } else {
      return "In Progress"
    }
  }

  const getAggregationStatus = () => {
    if (status === "done") {
      return "Done"
    } else {
      return "Waiting"
    }
  }
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div>
              <p>Overall</p>
              <Progress value={getOverallProgress()} />
            </div>
            <Separator />
            <div>
              <p>Upload & Split</p>
              <p>
                {getUploadSplitStatus()} | {progress.initialChunks} initial
                chunks
              </p>
            </div>
            <Separator />
            <div>
              <p>Convert to WAV</p>
              <p>
                {getConvertedWAVStatus()} |{" "}
                {`${progress.converted} /
                 ${progress.initialChunks} chunks`}
              </p>
            </div>
            <Separator />
            <div>
              <p>Fine Chunking</p>
              <p>
                {getConvertedWAVStatus()} | {progress.total} sub-chunks
              </p>
            </div>
            <Separator />
            <div>
              <p>Transcription</p>
              <p>
                {getTranscriptionProgress()} |{" "}
                {`${progress.transcribed} / 
                ${progress.total}`}{" "}
                chunks
              </p>
            </div>
            <Separator />
            <div>
              <p>Aggregation</p>
              <p>{getAggregationStatus()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PipelineProgressCard

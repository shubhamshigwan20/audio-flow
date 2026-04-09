import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import useJobStatus from "@/store/JobStatusStore"

const PipelineProgressCard = () => {
  const progress = useJobStatus((state) => state.progress)

  const getOverallProgress = () => {
    return (progress.transcribed / progress.total) * 100
  }

  const getTranscriptionProgress = () => {
    if (progress.total === progress.transcribed) {
      return "Done"
    } else if (progress.transcribed === 0) {
      return "Waiting"
    } else {
      return "In Progress"
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
              <p>Done | {progress.initialChunks} initial chunks</p>
            </div>
            <Separator />
            <div>
              <p>Convert to WAV</p>
              <p>
                Done | {progress.converted}/{progress.initialChunks}
              </p>
            </div>
            <Separator />
            <div>
              <p>Fine Chunking</p>
              <p>Done | {progress.total} sub-chunks</p>
            </div>
            <Separator />
            <div>
              <p>Transcription</p>
              <p>
                {getTranscriptionProgress()} |{progress.transcribed}/
                {progress.total} chunks
              </p>
            </div>
            <Separator />
            <div>
              <p>Aggregation</p>
              <p>
                {progress.transcribed === progress.total ? "Done" : "Waiting"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PipelineProgressCard

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import useJobStatus from "@/store/JobStatusStore"

const TranscriptionPreviewCard = () => {
  const transcript = useJobStatus((state) => state.transcript)
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Transcription Preview</CardTitle>
          {/* <CardDescription>Card Description</CardDescription> */}
          {/* <CardAction>Card Action</CardAction> */}
        </CardHeader>
        <CardContent>
          <p>{transcript}</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default TranscriptionPreviewCard

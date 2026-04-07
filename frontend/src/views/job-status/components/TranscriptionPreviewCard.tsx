import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const TranscriptionPreviewCard = () => {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Transcription Preview</CardTitle>
          {/* <CardDescription>Card Description</CardDescription> */}
          {/* <CardAction>Card Action</CardAction> */}
        </CardHeader>
        <CardContent>
          <p>Available when complete</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default TranscriptionPreviewCard

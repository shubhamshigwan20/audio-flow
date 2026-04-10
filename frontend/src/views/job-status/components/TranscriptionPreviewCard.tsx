import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import useJobStatus from "@/store/JobStatusStore"
import { Copy, Check, FileText } from "lucide-react"
import { useState } from "react"

const TranscriptionPreviewCard = () => {
  const transcript = useJobStatus((state) => state.transcript)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!transcript) return
    await navigator.clipboard.writeText(transcript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Transcription Preview</CardTitle>
          {transcript && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-green-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {transcript ? (
          <div className="max-h-64 overflow-y-auto rounded-lg bg-muted/50 p-4">
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
              {transcript}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
            <FileText className="h-8 w-8 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              No transcript yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Transcript will appear here once the job is complete.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TranscriptionPreviewCard

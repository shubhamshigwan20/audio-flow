import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

const PipelineProgressCard = () => {
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
              <Progress value={33} />
            </div>
            <Separator />
            <div>
              <p>Upload & Split</p>
              <p>Done | 4 initial chunks</p>
            </div>
            <Separator />
            <div>
              <p>Convert to WAV</p>
              <p>Done | 4/4</p>
            </div>
            <Separator />
            <div>
              <p>Fine Chunking</p>
              <p>Done | 20 sub-chunks</p>
            </div>
            <Separator />
            <div>
              <p>Transcription</p>
              <p>In progress | 14/20 chunks</p>
            </div>
            <Separator />
            <div>
              <p>Aggregation</p>
              <p>Waiting</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PipelineProgressCard

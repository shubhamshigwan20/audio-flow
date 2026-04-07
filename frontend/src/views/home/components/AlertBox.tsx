import { useNavigate } from "react-router-dom"
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle2Icon, OctagonX } from "lucide-react"

type AlertBoxPropType = {
  jobId: string
}

const AlertBox = (props: AlertBoxPropType) => {
  const { jobId } = props
  const navigate = useNavigate()

  const isError = jobId === "error"
  const handleBtnClick = () => {
    navigate(`/job-status/${jobId}`)
  }

  return (
    <div className="w-full">
      <Alert>
        {isError ? <OctagonX /> : <CheckCircle2Icon />}
        <AlertTitle>
          {isError ? "Error Uploading File" : "File Uploaded Successfully"}
        </AlertTitle>
        <AlertDescription>
          {isError ? "Retry" : `Job Id: ${jobId}`}
        </AlertDescription>
        {!isError && (
          <AlertAction>
            <Button variant="outline" onClick={handleBtnClick}>
              Track Status
            </Button>
          </AlertAction>
        )}
      </Alert>
    </div>
  )
}

export default AlertBox

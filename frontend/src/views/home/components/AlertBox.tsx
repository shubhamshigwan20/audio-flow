import { useNavigate } from "react-router-dom"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle2Icon, OctagonX, ArrowRight } from "lucide-react"

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
      <Alert
        className={
          isError
            ? "border-destructive/50 bg-destructive/5"
            : "border-green-500/30 bg-green-50/50 dark:bg-green-950/20"
        }
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {isError ? (
              <OctagonX className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            ) : (
              <CheckCircle2Icon className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
            )}
            <div>
              <AlertTitle className="text-sm font-semibold">
                {isError ? "Upload failed" : "File uploaded successfully"}
              </AlertTitle>
              <AlertDescription className="mt-0.5 text-xs text-muted-foreground">
                {isError
                  ? "Something went wrong. Please try again."
                  : `Job ID: ${jobId}`}
              </AlertDescription>
            </div>
          </div>
          {!isError && (
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 gap-1.5 text-xs"
              onClick={handleBtnClick}
            >
              Track Status
              <ArrowRight className="h-3 w-3" />
            </Button>
          )}
        </div>
      </Alert>
    </div>
  )
}

export default AlertBox

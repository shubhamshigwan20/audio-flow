import { Badge } from "@/components/ui/badge"
import { FileAudio, CheckCircle2, XCircle } from "lucide-react"

type SelectedFileProps = {
  selectedFileName: string
  size: number
  mimetype: string
  validFile: boolean
}

const SelectedFile = (props: SelectedFileProps) => {
  const { selectedFileName, size, mimetype, validFile } = props

  return (
    <div
      className={`flex w-full items-center gap-4 rounded-xl border px-5 py-4 transition-colors ${validFile ? "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20" : "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20"}`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${validFile ? "bg-green-100 dark:bg-green-900/40" : "bg-red-100 dark:bg-red-900/40"}`}
      >
        <FileAudio
          className={`h-5 w-5 ${validFile ? "text-green-600 dark:text-green-400" : "text-red-500"}`}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {selectedFileName}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {size} MB · {mimetype}
        </p>
      </div>
      <div className="shrink-0">
        {validFile ? (
          <Badge
            variant="default"
            className="gap-1.5 bg-green-600 text-white hover:bg-green-600"
          >
            <CheckCircle2 className="h-3 w-3" />
            Valid
          </Badge>
        ) : (
          <Badge variant="destructive" className="gap-1.5">
            <XCircle className="h-3 w-3" />
            Invalid
          </Badge>
        )}
      </div>
    </div>
  )
}

export default SelectedFile

import { Badge } from "@/components/ui/badge"

type SelectedFileProps = {
  selectedFileName: string
  size: number
  mimetype: string
  validFile: boolean
}

const SelectedFile = (props: SelectedFileProps) => {
  const { selectedFileName, size, mimetype, validFile } = props

  return (
    <div className="flex w-full items-center justify-between border-1 px-5 py-2">
      <div className="flex flex-col justify-center">
        <p className="text-md">Selected File</p>
        <p className="text-sm">{selectedFileName}</p>
        <p className="text-sm">
          {size} MB | {mimetype}
        </p>
      </div>
      <div className="h-full">
        <Badge variant="default">{validFile ? "Valid" : "Invalid"}</Badge>
      </div>
    </div>
  )
}

export default SelectedFile

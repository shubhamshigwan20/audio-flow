import { Badge } from "@/components/ui/badge"

type SelectedFileProps = {
  selectedFileName: string
  size: number
  mimetype: string
}

const SelectedFile = (props: SelectedFileProps) => {
  const { selectedFileName, size, mimetype } = props
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
        <Badge variant="default">Valid</Badge>
      </div>
    </div>
  )
}

export default SelectedFile

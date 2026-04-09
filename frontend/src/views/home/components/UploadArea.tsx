import { useRef } from "react"
import type { ChangeEvent } from "react"
import { Button } from "@/components/ui/button"

type UploadAreaProps = {
  setSelectedFile: (file: File) => void
}

const UploadArea = (props: UploadAreaProps) => {
  const { setSelectedFile } = props
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    setSelectedFile(file)
  }
  return (
    <div className="mt-8 flex h-[30vh] w-full flex-col items-center justify-center border-1 border-dashed">
      <p className="text-lg">Drop audio file here</p>
      <p className="text-md mb-4">MP3, WAV, M4A, OGG, FLAC max 200 MB</p>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        variant="outline"
        type="button"
        onClick={() => fileInputRef.current?.click()}
      >
        Upload
      </Button>
    </div>
  )
}

export default UploadArea

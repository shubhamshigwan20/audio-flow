import { useRef, useState } from "react"
import type { ChangeEvent, DragEvent } from "react"
import { UploadCloud } from "lucide-react"
import { Button } from "@/components/ui/button"

type UploadAreaProps = {
  setSelectedFile: (file: File) => void
}

const UploadArea = (props: UploadAreaProps) => {
  const { setSelectedFile } = props
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (!file) return
    setSelectedFile(file)
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => fileInputRef.current?.click()}
      className={`group relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed px-8 py-16 text-center transition-all duration-200 ${
        isDragging
          ? "scale-[1.01] border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-muted/40"
      }`}
    >
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-full bg-muted transition-all duration-200 ${isDragging ? "bg-primary/10" : "group-hover:bg-primary/10"}`}
      >
        <UploadCloud
          className={`h-7 w-7 transition-colors duration-200 ${isDragging ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}
        />
      </div>
      <div>
        <p className="text-base font-semibold text-foreground">
          {isDragging ? "Drop your file here" : "Drop audio file here"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          MP3, WAV, M4A, OGG, FLAC · max 500 MB
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          fileInputRef.current?.click()
        }}
        className="mt-1"
      >
        Browse files
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}

export default UploadArea

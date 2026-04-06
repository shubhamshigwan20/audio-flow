import { Button } from "@/components/ui/button"

const UploadArea = () => {
  return (
    <div className="mt-8 flex h-[30vh] w-full flex-col items-center justify-center border-1 border-dashed">
      <p className="text-lg">Drop audio file here</p>
      <p className="text-md mb-4">MP3, WAV, M4A, OGG, FLAC max 200 MB</p>
      <Button variant="outline">Upload</Button>
    </div>
  )
}

export default UploadArea

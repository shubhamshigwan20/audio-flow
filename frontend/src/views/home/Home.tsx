import { useState, useEffect } from "react"
import api from "@/api/api"
import UploadArea from "./components/UploadArea"
import SelectedFile from "./components/SelectedFile"
import { Button } from "@/components/ui/button"
import { allowedMimeType } from "@/constants/constants"
import AlertBox from "./components/AlertBox"
import useLoaderState from "@/store/LoaderStateStore"
import { TRANSCRIBE } from "@/constants/endpoints"
import { Wand2 } from "lucide-react"

const MAX_FILE_SIZE = 500

const Home = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [validFile, setValidFile] = useState(false)
  const [jobId, setJobId] = useState("")
  const [uploding, setUploading] = useState(false)
  const setIsOpen = useLoaderState((state) => state.setIsOpen)

  const handleTranscribeBtnClick = async () => {
    if (!selectedFile) return
    const formData = new FormData()
    formData.append("file", selectedFile, selectedFile.name)
    try {
      setUploading(true)
      setIsOpen(true)
      const response = await api.post(TRANSCRIBE, formData)
      setUploading(false)
      setIsOpen(false)
      setJobId(response.data.jobId)
    } catch (err) {
      setJobId("error")
      setUploading(false)
      setIsOpen(false)
      console.log(err)
    }
  }

  useEffect(() => {
    if (!selectedFile) {
      setValidFile(false)
      return
    }
    const fileSizeInMb = Number((selectedFile.size / (1024 * 1024)).toFixed(2))
    const isValidMimeType = allowedMimeType.includes(selectedFile.type)
    setValidFile(isValidMimeType && fileSizeInMb < MAX_FILE_SIZE)
  }, [selectedFile])

  return (
    <div className="mx-auto max-w-2xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Transcribe Audio</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload an audio file and our pipeline will generate a full transcript.
        </p>
      </div>

      {/* Upload Section */}
      <div className="flex flex-col gap-4">
        <UploadArea setSelectedFile={setSelectedFile} />

        {selectedFile && (
          <SelectedFile
            selectedFileName={selectedFile.name}
            size={Number((selectedFile.size / (1024 * 1024)).toFixed(2))}
            mimetype={selectedFile.type}
            validFile={validFile}
          />
        )}

        <Button
          className="w-full gap-2"
          size="lg"
          onClick={handleTranscribeBtnClick}
          disabled={!selectedFile || !validFile || uploding}
        >
          <Wand2 className="h-4 w-4" />
          {uploding ? "Uploading…" : "Transcribe"}
        </Button>

        {!validFile && selectedFile && (
          <p className="text-center text-xs text-muted-foreground">
            Only MP3 and WAV files under 500 MB are supported.
          </p>
        )}

        {jobId && <AlertBox jobId={jobId} />}
      </div>
    </div>
  )
}

export default Home

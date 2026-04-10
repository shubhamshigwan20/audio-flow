import { useState, useEffect } from "react"
import api from "@/api/api"
import UploadArea from "./components/UploadArea"
import SelectedFile from "./components/SelectedFile"
import { Button } from "@/components/ui/button"
import { allowedMimeType } from "@/constants/constants"
import AlertBox from "./components/AlertBox"

const MAX_FILE_SIZE = 500

const Home = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [validFile, setValidFile] = useState(false)
  const [jobId, setJobId] = useState("")
  const [uploding, setUploading] = useState(false)

  const handleTranscribeBtnClick = async () => {
    if (!selectedFile) return

    const formData = new FormData()
    formData.append("file", selectedFile, selectedFile.name)

    try {
      setUploading(true)
      const response = await api.post("/transcribe", formData)
      setUploading(false)
      setJobId(response.data.jobId)
    } catch (err) {
      setJobId("error")
      setUploading(false)
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
    <div className="flex flex-col items-center gap-8">
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
        variant="outline"
        className="w-[99%] border-1"
        onClick={handleTranscribeBtnClick}
        disabled={!selectedFile || !validFile || uploding}
      >
        Transcribe
      </Button>
      {jobId && <AlertBox jobId={jobId} />}
    </div>
  )
}

export default Home

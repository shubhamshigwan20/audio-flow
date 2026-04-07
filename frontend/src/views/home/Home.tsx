import { useState } from "react"
import api from "@/api/api"
import UploadArea from "./components/UploadArea"
import SelectedFile from "./components/SelectedFile"
import { Button } from "@/components/ui/button"

const Home = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const handleTranscribeBtnClick = async () => {
    if (!selectedFile) return

    const formData = new FormData()
    formData.append("file", selectedFile, selectedFile.name)

    try {
      const response = await api.post("/transcribe", formData)
      console.log("Uploaded:", response.data)
    } catch (err) {
      console.log(err)
    }
  }
  return (
    <div className="flex flex-col items-center gap-8">
      <UploadArea setSelectedFile={setSelectedFile} />
      {selectedFile && (
        <SelectedFile
          selectedFileName={selectedFile.name}
          size={Number((selectedFile.size / (1024 * 1024)).toFixed(2))}
          mimetype={selectedFile.type}
        />
      )}
      <Button
        variant="outline"
        className="w-[99%] border-1"
        onClick={handleTranscribeBtnClick}
        disabled={!selectedFile}
      >
        Transcribe
      </Button>
    </div>
  )
}

export default Home

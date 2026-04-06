import UploadArea from "./components/UploadArea"
import SelectedFile from "./components/SelectedFile"
import { Button } from "@/components/ui/button"

const Home = () => {
  return (
    <div className="flex flex-col items-center gap-8">
      <UploadArea />
      <SelectedFile
        selectedFileName="final.mp3"
        size={10}
        mimetype="audio/mpeg"
      />
      <Button variant="outline" className="w-[99%] border-1">
        Transcribe
      </Button>
    </div>
  )
}

export default Home

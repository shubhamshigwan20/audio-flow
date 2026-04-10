import { useState, useEffect } from "react"
import api from "@/api/api"
import UploadArea from "./components/UploadArea"
import SelectedFile from "./components/SelectedFile"
import { Button } from "@/components/ui/button"
import { allowedMimeType } from "@/constants/constants"
import AlertBox from "./components/AlertBox"
import useLoaderState from "@/store/LoaderStateStore"
import {
  AUTH_GOOGLE_TOKEN,
  TRANSCRIBE,
  TRANSCRIBE_GOOGLE_DRIVE,
} from "@/constants/endpoints"
import { Wand2 } from "lucide-react"

const MAX_FILE_SIZE = 500

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const API_KEY = import.meta.env.VITE_API_KEY
console.log("ad122", API_KEY)

type Docs = { id: string; name: string; mimeType: string }

type codeResponseType = {
  code: string
}

type pickerCallbackDataType = {
  action: string
  docs?: Docs[]
}

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

  async function pickerCallback(
    data: pickerCallbackDataType,
    refreshToken: string
  ) {
    if (data.action === google.picker.Action.PICKED) {
      const file = data.docs?.[0]
      console.log("file -->", file)
      if (!file?.id) {
        return
      }

      // Validate it's an audio file on frontend too
      const allowedMimeTypes = [
        "audio/mpeg",
        "audio/mp3",
        "audio/wav",
        "audio/x-wav",
        "audio/ogg",
        "audio/mp4",
      ]

      if (!allowedMimeTypes.includes(file.mimeType)) {
        alert("Please select an audio file only")
        return
      }

      const payload = {
        filename: data.docs?.[0]?.name,
        fileid: file?.id,
        refreshToken: refreshToken,
        mimeType: file?.mimeType,
      }

      setIsOpen(true)
      try {
        const result = await api.post(TRANSCRIBE_GOOGLE_DRIVE, payload)
        setIsOpen(false)
        setJobId(result.data.jobId)
      } catch (err) {
        console.log(err)
        setJobId("error")
      } finally {
        setIsOpen(false)
      }
    }
  }

  function openPicker(accessToken: string, refreshToken: string) {
    if (!API_KEY) {
      return
    }
    gapi.load("picker", () => {
      const picker = new google.picker.PickerBuilder()
        .addView(
          new google.picker.View(google.picker.ViewId.DOCS).setMimeTypes(
            [
              "audio/mpeg", // .mp3
              "audio/mp3", // fallback
              "audio/wav", // .wav
              "audio/x-wav", // fallback
              "audio/ogg", // .ogg
              "audio/mp4", // .m4a
              "audio/aac", // .aac
              "audio/flac", // .flac
            ].join(",")
          )
        )
        .setOAuthToken(accessToken)
        .setDeveloperKey(API_KEY)
        .setCallback((data: pickerCallbackDataType) => {
          pickerCallback(data, refreshToken)
        })
        .build()

      picker.setVisible(true)
    })
  }

  const handleGoogleDriveUpload = async () => {
    if (!CLIENT_ID) {
      return
    }

    const existingAccessToken = localStorage.getItem("googleAccessToken")
    const existingRefreshToken = localStorage.getItem("googleRefreshToken")

    if (existingRefreshToken && existingAccessToken) {
      openPicker(existingAccessToken, existingRefreshToken)
      return
    } else {
      const client = google.accounts.oauth2.initCodeClient({
        client_id: CLIENT_ID,
        scope: "https://www.googleapis.com/auth/drive.readonly",
        callback: async (codeResponse: codeResponseType) => {
          const payload = {
            code: codeResponse.code,
          }
          const result = await api.post(AUTH_GOOGLE_TOKEN, payload)
          if (result.status === 200) {
            localStorage.setItem("googleAccessToken", result.data.accessToken)
            localStorage.setItem("googleRefreshToken", result.data.refreshToken)
            openPicker(result.data.accessToken, result.data.refreshToken)
          }
        },
      })

      client.requestCode()
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
        <div className="flex justify-center">
          <Button
            className="w-full gap-2 p-2"
            onClick={handleGoogleDriveUpload}
          >
            <div className="flex h-4 items-center gap-3 p-0">
              <i className="fab fa-google-drive fa-2x"></i> Google Drive Upload
            </div>
          </Button>
        </div>

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

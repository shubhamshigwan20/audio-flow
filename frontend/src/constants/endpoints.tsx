const JOB_HISTORY = `/jobs` //POST

const JOB_STATUS = (id: string) => `/jobs/${id}` //GET

const GET_TRANSCRIPT = (id: string) => `/jobs/${id}/transcript` //GET

const TRANSCRIBE = `/transcribe` //POST

const AUTH_GOOGLE_TOKEN = `/auth/google-token` //POST

const TRANSCRIBE_GOOGLE_DRIVE = `/transcribe-gdrive` //POST

export {
  JOB_HISTORY,
  JOB_STATUS,
  GET_TRANSCRIPT,
  TRANSCRIBE,
  AUTH_GOOGLE_TOKEN,
  TRANSCRIBE_GOOGLE_DRIVE,
}

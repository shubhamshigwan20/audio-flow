const JOB_HISTORY = `/jobs` //POST

const JOB_STATUS = (id: string) => `/jobs/${id}` //GET

const GET_TRANSCRIPT = (id: string) => `/jobs/${id}/transcript` //GET

export { JOB_HISTORY, JOB_STATUS, GET_TRANSCRIPT }

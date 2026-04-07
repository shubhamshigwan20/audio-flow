import StatusDropdown from "./components/StatusDropdown"
import JobCard from "./components/JobCard"

const JobHistory = () => {
  const jobCards = [
    {
      fileName: "interview.mp3",
      jobId: "abc123",
      status: "done",
      size: 48,
      duration: 130,
    },
    {
      fileName: "interview.mp3",
      jobId: "abc123",
      status: "done",
      size: 48,
      duration: 130,
    },
  ]
  return (
    <div className="flex flex-col gap-3 py-2">
      <StatusDropdown />
      {jobCards.map((card) => (
        <JobCard card={card} />
      ))}
    </div>
  )
}

export default JobHistory

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "../views/home/Home"
import ProtectedRoutes from "./ProtectedRoutes"
import Observer from "@/views/observe/Observer"
import DLQ from "@/views/dlq/DLQ"
import JobHistory from "@/views/job-history/JobHistory"
import JobStatus from "@/views/job-status/JobStatus"

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<Home />} />
          <Route path="/job-history" element={<JobHistory />} />
          <Route path="/job-status/:jobId" element={<JobStatus />} />
          <Route path="/observe" element={<Observer />} />
          <Route path="/dlq" element={<DLQ />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default AppRoutes

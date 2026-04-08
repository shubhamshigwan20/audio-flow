import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { jobStatuses } from "@/constants/constants"

type StatusDropdownPropType = {
  fetchJobHistory: (status: string) => void
}

const StatusDropdown = (props: StatusDropdownPropType) => {
  const { fetchJobHistory } = props
  const [filterStatus, setFilterStatus] = useState("all-status")
  const handleStatusChange = (key: string) => {
    setFilterStatus(key)
  }
  const getStatusValue = (key: string) =>
    jobStatuses.find((status) => status.key === key)?.value ?? "Unknown"

  useEffect(() => {
    fetchJobHistory(filterStatus)
  }, [filterStatus, fetchJobHistory])

  return (
    <div className="w-full">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {getStatusValue(filterStatus)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {jobStatuses.map((status) => (
            <DropdownMenuItem onClick={() => handleStatusChange(status.key)}>
              {status.value}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default StatusDropdown

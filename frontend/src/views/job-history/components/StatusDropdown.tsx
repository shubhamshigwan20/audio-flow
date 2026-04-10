import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { jobStatuses } from "@/constants/constants"
import { ChevronDown, Filter } from "lucide-react"

type StatusDropdownPropType = {
  fetchJobHistory: (status: string) => void
}

const StatusDropdown = (props: StatusDropdownPropType) => {
  const { fetchJobHistory } = props
  const [filterStatus, setFilterStatus] = useState("all-status")

  const handleStatusChange = (key: string) => setFilterStatus(key)

  const getStatusValue = (key: string) =>
    jobStatuses.find((status) => status.key === key)?.value ?? "Unknown"

  useEffect(() => {
    fetchJobHistory(filterStatus)
  }, [filterStatus, fetchJobHistory])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          {getStatusValue(filterStatus)}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        {jobStatuses.map((status) => (
          <DropdownMenuItem
            key={status.key}
            onClick={() => handleStatusChange(status.key)}
            className={
              filterStatus === status.key ? "bg-accent font-medium" : ""
            }
          >
            {status.value}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default StatusDropdown

import type { DataTableColumn } from "@/app/components/DataTable/DataTable"
import { Button } from "@/components/ui/button"
import { Cancel01Icon, Edit04Icon, Locker01Icon, Tick02Icon, TickDouble01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export type LeaveRow = {
    id?: string
    enr: number
    employeeName: string
    leaveType: string
    startDate: string
    endDate: string
    totalDays: string | number
    reason?: string
    status: string
}

export const leaveColumns = ({
    onApprove,
    onReject
}: {
    onApprove: (id: string) => void,
    onReject: (id: string) => void
}): DataTableColumn<LeaveRow>[] => [
    { header: "ENR", accessor: "enr" },
    { header: "EMPLOYEE", accessor: "employeeName" },
    { header: "LEAVE TYPE", accessor: "leaveType" },
    { header: "START DATE", accessor: "startDate" },
    { header: "END DATE", accessor: "endDate" },
    { header: "TOTAL DAYS", accessor: "totalDays" },
    { header: "STATUS", accessor: "status" },
    {
        header: "ACTIONS",
        accessor: "id",
        className: "text-right",
        cell: (leave) => (
            <div className="flex gap-2 justify-end">
                
                <Button
                    variant="default"
                    title="approve"
                    size={"xs"}
                    onClick={() => leave.id && onApprove(leave.id)}
                    disabled={leave.status === 'approved'}
                >
                   <HugeiconsIcon icon={Tick02Icon} />
                </Button>
                
                <Button
                    variant="destructive"
                    title="reject"
                    size={"xs"}
                    onClick={() => leave.id && onReject(leave.id)}
                    disabled={leave.status === 'rejected'}
                >
                    <HugeiconsIcon icon={Cancel01Icon} />
                </Button>
            </div>
        ),
    },
]
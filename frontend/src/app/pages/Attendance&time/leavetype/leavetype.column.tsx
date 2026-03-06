import type { DataTableColumn } from "@/app/components/DataTable/DataTable";
import { Button } from "@/components/ui/button";
import { Edit04Icon, Logout01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export type LeaveTypeRow = {
    _id?: string
    enr: number
    name: string,
    defaultDays: string,
    requiresApproval?: boolean,
    status: string,
}

export const LeaveTypeColumns = ({
    onEdit,
    onDeactivate
}: {
    onEdit: (leavetype: LeaveTypeRow) => void,
    onDeactivate: (id: string) => void
}): DataTableColumn<LeaveTypeRow>[] => [
        { header: "ENR", accessor: "enr" },
        { header: "NAME", accessor: 'name' },
        { header: "DEFAULT DAYS", accessor: 'defaultDays' },
        { header: "REQUIRES APPROVAL", accessor: 'requiresApproval' },
        { header: "STATUS", accessor: 'status' },
        {
            header: "ACTIONS",
            accessor: '_id',
            className: "text-right",
            cell: (leavetype) => (
                <div>
                    <Button
                        variant="outline"
                        title="edit"
                        onClick={() => onEdit(leavetype)}
                    >
                        <HugeiconsIcon icon={Edit04Icon} />
                    </Button>
                    <Button
                        variant="destructive"
                        title="deactivate"
                        onClick={() => leavetype._id && onDeactivate(leavetype._id)}
                    >
                        <HugeiconsIcon icon={Logout01Icon} />
                    </Button>
                </div>
            )
        }
    ]

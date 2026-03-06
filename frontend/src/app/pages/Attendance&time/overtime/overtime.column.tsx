import type { DataTableColumn } from "@/app/components/DataTable/DataTable";
import { Button } from "@/components/ui/button";
import { Edit04Icon, Logout01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export type OvertimeRow = {
    _id?: string
    enr: number
    payrollName: string
    employeeName: string,
    date: string,
    hours: number,
    rate: number,
    multiplier: number
    amount: number
    status: string,
}

export const OvertimeColumns = ({
    onEdit,
    onVoid
}: {
    onEdit: (overtime: OvertimeRow) => void,
    onVoid: (id: string) => void
}): DataTableColumn<OvertimeRow>[] => [
        { header: "ENR", accessor: "enr" },
        { header: "PAYROLL", accessor: 'payrollName' },
        { header: "EMPLOYEE", accessor: 'employeeName' },
        { header: "DATE", accessor: 'date' },
        { header: "HOURS WORKED", accessor: 'hours' },
        { header: "RATE PER HOUR", accessor: 'rate' },
        { header: "MULTIPLIER", accessor: 'multiplier' },
        { header: "AMOUNT", accessor: 'amount' },
        { header: "STATUS", accessor: 'status' },
        {
            header: "ACTIONS",
            accessor: '_id',
            className: "text-right",
            cell: (overtime) => (
                <div>
                    <Button
                        variant="outline"
                        title="edit"
                        onClick={() => onEdit(overtime)}
                    >
                        <HugeiconsIcon icon={Edit04Icon} />
                    </Button>
                    <Button
                        variant="destructive"
                        title="void"
                        onClick={() => overtime._id && onVoid(overtime._id)}
                    >
                        <HugeiconsIcon icon={Logout01Icon} />
                    </Button>
                </div>
            )
        }
    ]

import type { DataTableColumn } from "@/app/components/DataTable/DataTable";
import { Button } from "@/components/ui/button";
import { Edit04Icon, Logout01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export type DeductionRow = {
    _id?: string,
    enr: number
    name: string
    employeeName: string
    type: string
    startDate: string
    endDate: string
    totalAmount: number
    remainingAmount: number
    frequency: string
    status: string
}

export const DeductionColumn = ({
    onEdit,
    onVoid
}: {
    onEdit: (deduction: DeductionRow) => void,
    onVoid: (id: string) => void
}): DataTableColumn<DeductionRow>[] => [
        { header: 'ENR', accessor: 'enr' },
        { header: 'NAME', accessor: 'name' },
        { header: 'EMPLOYEE', accessor: 'employeeName' },
        { header: 'TYPE', accessor: 'type' },
        {
            header: 'START DATE',
            accessor: 'startDate',
            cell: row => new Date(row.startDate).toLocaleTimeString()
        },
        {
            header: 'END DATE',
            accessor: 'endDate',
            cell: row => new Date(row.endDate).toLocaleTimeString()
        },
        { header: 'TOTAL AMOUNT', accessor: 'totalAmount' },
        { header: 'REMAINING AMOUNT', accessor: 'remainingAmount' },
        { header: 'FREQUENCY', accessor: 'frequency' },

        { header: 'STATUS', accessor: 'status' },
        {
            header: 'ACTIONS',
            accessor: '_id',
            cell: (deduction) => (
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        title="edit"
                        onClick={() => onEdit(deduction)}
                    >
                        <HugeiconsIcon icon={Edit04Icon} />
                    </Button>
                    <Button
                        variant="destructive"
                        title="void"
                        onClick={() => deduction._id && onVoid(deduction._id)}
                    >
                        <HugeiconsIcon icon={Logout01Icon} />
                    </Button>
                </div>
            )
        }
    ]
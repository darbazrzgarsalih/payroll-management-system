import type { DataTableColumn } from "@/app/components/DataTable/DataTable";
import { Button } from "@/components/ui/button";
import { Delete03Icon, Edit04Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export type PunishmentRow = {
    id?: string
    enr: number
    name: string
    employeeName: string
    type: string
    frequency: string
    totalAmount: number
    remainingAmount: number
    startDate: string
    endDate: string
    status: string
}

export const PunishmentColumns = ({
    onEdit,
    onDelete
}: {
    onEdit: (punishment: PunishmentRow) => void,
    onDelete: (id: string) => void
}): DataTableColumn<PunishmentRow>[] => [
    { header: "ENR", accessor: "enr" },
    { header: "NAME", accessor: 'name' },
    { header: "EMPLOYEE", accessor: 'employeeName' },
    { header: "TYPE", accessor: 'type' },
    { header: "FREQUENCY", accessor: 'frequency' },
    { header: "TOTAL AMOUNT", accessor: 'totalAmount' },
    { header: "REMAINING AMOUNT", accessor: 'remainingAmount' },
    { header: "START DATE", accessor: 'startDate' },
    { header: "END DATE", accessor: 'endDate' },
    { header: "STATUS", accessor: 'status' },
    {
        header: "ACTIONS",
        accessor: 'id',
        className: "text-right",
        cell: (punishment) => (
            <div>
                <Button
                    variant="outline"
                    title="edit"
                    onClick={() => onEdit(punishment)}
                >
                    <HugeiconsIcon icon={Edit04Icon} />
                </Button>
                <Button
                    variant="destructive"
                    title="delete"
                    onClick={() => punishment.id && onDelete(punishment.id)}
                >
                    <HugeiconsIcon icon={Delete03Icon} />
                </Button>
            </div>
        )
    }
]
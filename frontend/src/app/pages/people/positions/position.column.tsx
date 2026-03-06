import type { DataTableColumn } from "@/app/components/DataTable/DataTable"
import { Button } from "@/components/ui/button"
import { Delete03Icon, Edit04Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export type PositionRow = {
    id?: string
    enr: number
    title: string
    level: string
    department: string
    description: string
    status: string
    createdBy?: string
    updatedBy?: string
}

export const positionColumns = ({
    onEdit,
    onDelete
}: {
    onEdit: (position: PositionRow) => void,
    onDelete: (id: string) => void
}): DataTableColumn<PositionRow>[] => [
    { header: "ENR", accessor: "enr" },
    { header: "TITLE", accessor: "title" },
    { header: "LEVEL", accessor: "level" },
    { header: "DEPARTMENT", accessor: "department" },
    { header: "DESCRIPTION", accessor: "description" },
    { header: "STATUS", accessor: "status" },
    {
        header: "ACTIONS",
        accessor: "id",
        className: "text-right",
        cell: (position) => (
            <div className="flex gap-2 justify-end">
                <Button
                    variant="outline"
                    title="edit"
                    onClick={() => onEdit(position)}
                >
                    <HugeiconsIcon icon={Edit04Icon} />
                </Button>
               <Button
                    variant="destructive"
                    title="delete"
                    onClick={() => position.id && onDelete(position.id)}
                >
                    <HugeiconsIcon icon={Delete03Icon} />
                </Button>
            </div>
        ),
    },
]
import type { DataTableColumn } from "@/app/components/DataTable/DataTable"
import { Button } from "@/components/ui/button"
import { Delete03Icon, Edit04Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export type DepartmentRow = {
    id?: string
    enr: number
    name: string
    budget: number | string
    status: string
}

export const departmentColumns = ({
    onEdit,
    onDelete
}: {
    onEdit: (department: DepartmentRow) => void,
    onDelete: (id: string) => void
}): DataTableColumn<DepartmentRow>[] => [
    { header: "ENR", accessor: "enr" },
    { header: "NAME", accessor: "name" },
    { header: "BUDGET", accessor: "budget" },
    { header: "STATUS", accessor: "status" },
    {
        header: "ACTIONS",
        accessor: "id",
        className: "text-right",
        cell: (department) => (
            <div className="flex gap-2 justify-end">
                <Button
                    variant="outline"
                    title="edit"
                    onClick={() => onEdit(department)}
                >
                    <HugeiconsIcon icon={Edit04Icon} />
                </Button>

                <Button
                    variant="destructive"
                    title="delete"
                    onClick={() => department.id && onDelete(department.id)}
                >
                    <HugeiconsIcon icon={Delete03Icon} />
                </Button>
            </div>
        ),
    },
]
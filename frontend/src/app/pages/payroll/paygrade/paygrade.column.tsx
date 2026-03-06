import type { DataTableColumn } from "@/app/components/DataTable/DataTable";
import { Button } from "@/components/ui/button";
import { Delete03Icon, Edit04Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export type PaygradeRow = {
    _id?: string,
    enr: number
    name: string,
    level: string,
    minSalary: number,
    maxSalary: number,
    currency: string,
    description: string
    status: string,
}

export const PaygradeColumns = ({
    onEdit,
    onDelete
}: {
    onEdit: (paygrade: PaygradeRow) => void,
    onDelete: (id: string) => void
}): DataTableColumn<PaygradeRow>[] => [
        { header: "ENR", accessor: "enr" },
        { header: "NAME", accessor: 'name' },
        { header: "LEVEL", accessor: 'level' },
        { header: "MIN SALARY", accessor: 'minSalary' },
        { header: "MAX SALARY", accessor: 'maxSalary' },
        { header: "CURRENCY", accessor: 'currency' },
        { header: "DESCRIPTION", accessor: 'description' },
        { header: "STATUS", accessor: 'status' },
        {
            header: "ACTIONS",
            accessor: '_id',
            className: "text-right",
            cell: (paygrade) => (
                <div>
                    <Button
                        variant="outline"
                        title="edit"
                        onClick={() => onEdit(paygrade)}
                    >
                        <HugeiconsIcon icon={Edit04Icon} />
                    </Button>
                    <Button
                        variant="destructive"
                        title="delete"
                        onClick={() => paygrade._id && onDelete(paygrade._id)}
                    >
                        <HugeiconsIcon icon={Delete03Icon} />
                    </Button>
                </div>
            )
        }
    ]
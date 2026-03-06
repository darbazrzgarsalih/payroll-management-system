import type { DataTableColumn } from "@/app/components/DataTable/DataTable";
import { Button } from "@/components/ui/button";
import { Edit04Icon, Logout01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export type SalaryComponentRow = {
    id?: string,
    enr: number
    name: string,
    description: string,
    type: string,
    category: string,
    effectiveFrom: string
    applicableFor: string
    status: string,
}

export const SalaryComponentColumns = ({
    onEdit,
    onDeactivate
}: {
    onEdit: (salarycomponent: SalaryComponentRow) => void,
    onDeactivate: (id: string) => void
}): DataTableColumn<SalaryComponentRow>[] => [
        { header: "ENR", accessor: "enr" },
        { header: "NAME", accessor: 'name' },
        { header: "TYPE", accessor: 'type' },
        { header: "CATEGORY", accessor: 'category' },
        { header: "EFFECTIVE FROM", accessor: 'effectiveFrom' },
        { header: "APPLICABLE FOR", accessor: 'applicableFor' },
        { header: "DESCRIPTION", accessor: 'description' },
        { header: "STATUS", accessor: 'status' },
        {
            header: "ACTIONS",
            accessor: 'id',
            className: "text-right",
            cell: (salarycomponent) => (
                <div>
                    <Button
                        variant="outline"
                        title="edit"
                        onClick={() => onEdit(salarycomponent)}
                    >
                        <HugeiconsIcon icon={Edit04Icon} />
                    </Button>
                    <Button
                        variant="destructive"
                        title="deactivate"
                        onClick={() => salarycomponent.id && onDeactivate(salarycomponent.id)}
                    >
                        <HugeiconsIcon icon={Logout01Icon} />
                    </Button>
                </div>
            )
        }
    ]
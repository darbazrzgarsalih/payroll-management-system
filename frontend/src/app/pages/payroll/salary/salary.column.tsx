
import type { DataTableColumn } from "@/app/components/DataTable/DataTable";
import { Button } from "@/components/ui/button";
import { Delete03Icon, Edit04Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export type SalaryRow = {
    id?: string,
    enr: number,
    employeeName: string
    salaryType: string
    amount: string
    currency: string
    effectiveDate: string
    endDate: string
    payGrade: string
    status: string
    createdBy: string
}

export const SalaryColumns = ({
    onEdit,
    onDelete
}: {
    onEdit: (salary: SalaryRow) => void,
    onDelete: (id: string) => void
}): DataTableColumn<SalaryRow>[] => [
        { header: "ENR", accessor: "enr" },
        { header: "EMPLOYEE", accessor: 'employeeName' },
        { header: "SALARY TYPE", accessor: 'salaryType' },
        { header: "AMOUNT", accessor: 'amount' },
        { header: "CURRENCY", accessor: 'currency' },
        { header: "EFFECTIVE DATE", accessor: 'effectiveDate' },
        { header: "END DATE", accessor: 'endDate' },
        { header: "PAYGRADE", accessor: 'payGrade' },
        { header: "STATUS", accessor: 'status' },
        { header: "CREATED BY", accessor: 'createdBy' },
        {
            header: "ACTIONS",
            accessor: 'id',
            className: "text-right",
            cell: (salary) => (
                <div>
                    <Button
                        variant="outline"
                        title="edit"
                        onClick={() => onEdit(salary)}
                    >
                        <HugeiconsIcon icon={Edit04Icon} />
                    </Button>
                    <Button
                        variant="destructive"
                        title="delete"
                        onClick={() => salary.id && onDelete(salary.id)}
                    >
                        <HugeiconsIcon icon={Delete03Icon} />
                    </Button>
                </div>
            )
        }
    ]
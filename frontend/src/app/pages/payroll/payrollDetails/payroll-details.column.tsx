
import type { DataTableColumn } from "@/app/components/DataTable/DataTable";
import { Button } from "@/components/ui/button";

export type PayrollDetailsRow = {
    id: string,
    employee: string,
    base: number,
    gross: number,
    rewards: number,
    overtimes: number,
    punishments: number,
    deductions: number,
    net: number,
    status: string
}

export const PayrollDetailsColumns: DataTableColumn<PayrollDetailsRow>[] = [
    { header: "EMPLOYEE", accessor: 'employee' },
    { header: "BASE", accessor: 'base' },
    { header: "GROSS", accessor: 'gross' },
    { header: "REWARDS", accessor: 'rewards' },
    { header: "OVERTIMES", accessor: 'overtimes' },
    { header: "PUNISHMENTS", accessor: 'punishments' },
    { header: "DEDUCTIONS", accessor: 'deductions' },
    { header: "TOTAL NET", accessor: 'net' },
    { header: "STATUS", accessor: 'status' },

    {
        header: "ACTIONS",
        accessor: 'id',
        className: "text-right",
    }
]
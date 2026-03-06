
import type { DataTableColumn } from "@/app/components/DataTable/DataTable";
import { Button } from "@/components/ui/button";

export type PayrollDetailsRow = {
    employee: string,
    base: number,
    gross: number,
    deductions: number,
    net: number,
    status: string
}

export const PayrollDetailsColumns: DataTableColumn<PayrollDetailsRow>[] = [
    {header: "EMPLOYEE", accessor: 'employee'},
    {header: "BASE", accessor: 'base'},
    {header: "GROSS", accessor: 'gross'},
    {header: "TOTAL NET", accessor: 'net'},
    {header: "STATUS", accessor: 'status'},
    
    {
        header: "ACTIONS",
        accessor: 'employee',
        className: "text-right",
    }
]
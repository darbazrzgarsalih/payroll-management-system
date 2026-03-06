import type { DataTableColumn } from "@/app/components/DataTable/DataTable"
import { Button } from "@/components/ui/button"

export type EmployeeRow = {
    id: number
    name: string
    email: string
    department: string
    position: string
    gender: string
    address: string
}

export const employeeColumns: DataTableColumn<EmployeeRow>[] = [
    { header: "ENR NO", accessor: "id" },
    { header: "NAME", accessor: "name" },
    { header: "EMAIL", accessor: "email" },
    { header: "DEPARTMENT", accessor: "department" },
    { header: "POSITION", accessor: "position" },
    { header: "GENDER", accessor: "gender" },
    { header: "ADDRESS", accessor: "address" },
    {
        header: "ACTIONS",
        accessor: "id",
        className: "text-right",
        cell: () => (
            <div className="flex justify-end gap-2">
                <Button size="sm">Edit</Button>
                <Button size="sm" variant="destructive">Delete</Button>
            </div>
        ),
    },
]
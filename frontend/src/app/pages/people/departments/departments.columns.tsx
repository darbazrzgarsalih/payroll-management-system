
import type { DataTableColumn } from "@/app/components/DataTable/DataTable";
import { Button } from "@/components/ui/button";

export type DepartmentRow = {
    id: number,
    name: string,
    budget: number,
    status: string,
}

export const DepartmentColumns: DataTableColumn<DepartmentRow>[] = [
    {header: "ENR", accessor: "id"},
    {header: "NAME", accessor: 'name'},
    {header: "BUDGET", accessor: 'budget'},
    {header: "STATUS", accessor: 'status'},
    {
        header: "ACTIONS",
        accessor: 'id',
        className: "text-right",
        cell: () => (
            <div>
                <Button size={'sm'}>Edit</Button>
                <Button size={'sm'} variant={'destructive'}>Delete</Button>
            </div>
        )
    }
]
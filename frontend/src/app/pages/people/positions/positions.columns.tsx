import type { DataTableColumn } from "@/app/components/DataTable/DataTable";
import { Button } from "@/components/ui/button";

export type PositionRow = {
    id: string,
    title: string,
    level: string,
    departmentID: string,
    description: string,
    status: string
}

export const PositionColumn: DataTableColumn<PositionRow>[] = [
    {header: "ENR", accessor: 'id'},
    {header: "TITLE", accessor: 'title'},
    {header: "LEVEL", accessor: 'level'},
    {header: "DEPARTMENT", accessor: 'departmentID'},
    {header: "DESCRIPTION", accessor: 'description'},
    {header: "STATUS", accessor: 'status'},
    {
        header: "ACTIONS",
        accessor: 'id',
        className: "text-right",
        cell: () => (
            <div className="">
                <Button size={'sm'}>Edit</Button>
                <Button size={'sm'} variant={'destructive'}>Delete</Button>
            </div>
        )
    }
]
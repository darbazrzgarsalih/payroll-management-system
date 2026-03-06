











//     header: string
//     accessor: keyof T
//     cell?: (row: T) => React.ReactNode




//     columns: DataTableColumn<T>[]
//     data: T[]



















































import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import React from "react"

export type DataTableColumn<T> = {
    header: React.ReactNode
    accessor: keyof T | string
    cell?: (row: T) => React.ReactNode
    className?: string
}

type DataTableProps<T> = {
    columns: DataTableColumn<T>[]
    data: T[]
    emptyMessage?: string
    showRowNumber?: boolean
    loading?: boolean
    onRowClick?: (row: T) => void
}

export function DataTable<T>({
    columns,
    data,
    emptyMessage = "No records found",
    loading,
    onRowClick,
}: DataTableProps<T>) {
    if (!loading && data.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-10">
                {emptyMessage}
            </div>
        )
    }

    return (
        <div className="border border-muted p-2 rounded-2xl">
            <Table>
                <TableHeader className="rounded-md">
                    <TableRow>
                        {columns.map(col => (
                            <TableHead key={String(col.accessor)} className={`${col.className} font-semibold`}>
                                {col.header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {data.map((row, idx) => (
                        <TableRow
                            key={idx}
                            onClick={() => onRowClick?.(row)}
                            className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                        >
                            {columns.map(col => (
                                <TableCell key={String(col.accessor)} className={`${col.className} font-medium`}>
                                    {col.cell ? col.cell(row) : String((row as any)[col.accessor] ?? '')}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
import type { DataTableColumn } from "@/app/components/DataTable/DataTable";
import { Button } from "@/components/ui/button";

export type AuditLogRow = {
    id?: string,
    enr: number,
    user: string,
    action: string,
    entity: string,
    entityID?: string,
    OldValue: string,
    newValue: string,
    ipAddress: string,
    createdAt: string
}

export const AuditLogColumns: DataTableColumn<AuditLogRow>[] = [
    { header: "ENR", accessor: "enr" },
    { header: "USER", accessor: 'user' },
    { header: "ENTITY", accessor: 'entity' },
    // { header: "ENTITY ID", accessor: 'entityID' },
    {header: "ACTION", accessor: 'action'},
    { header: "IP ADDRESS", accessor: 'ipAddress' },
    {
        header: "TIMESTAMP",
        accessor: "createdAt",
        cell: (row) => new Date(row.createdAt).toLocaleString('en-US', {
            timeZone: 'Asia/Baghdad',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    }
]
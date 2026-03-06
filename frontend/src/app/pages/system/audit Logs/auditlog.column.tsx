

import type { DataTableColumn } from "@/app/components/DataTable/DataTable";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export type AuditLogRow = {
    id?: string
    enr: number
    user: string
    action: string
    entity: string
    entityID?: string
    OldValue: string
    newValue: string
    ipAddress: string
    createdAt: string
    onView?: (id: string) => void,
    quickView?: string
}

const actionColors: Record<string, string> = {
    CREATE: "bg-green-100 text-green-700",
    UPDATE: "bg-blue-100 text-blue-700",
    DELETE: "bg-red-100 text-red-700",
    TERMINATE: "bg-red-100 text-red-700",
    RUN_PAYROLL: "bg-orange-100 text-orange-700",
    CHECK_IN: "bg-teal-100 text-teal-700",
    CHECK_OUT: "bg-teal-100 text-teal-700",
}

export const AuditLogColumns: DataTableColumn<AuditLogRow>[] = [
    { header: "ENR", accessor: "enr" },
    { header: "USER", accessor: "user" },
    { header: "ENTITY", accessor: "entity" },
    {
        header: "ACTION",
        accessor: "action",
        cell: (row) => (
            <span className={`text-xs px-2 py-1 rounded font-semibold ${actionColors[row.action] || "bg-gray-100 text-gray-700"}`}>
                {row.action}
            </span>
        )
    },
    { header: "IP ADDRESS", accessor: "ipAddress" },
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
    },
    {
        header: "QUICK ACTIONS",
        accessor: "id",
        cell: (row) => (
            <Button
                size="sm"
                variant="ghost"
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                    e.stopPropagation() 
                    if (row.id && row.onView) row.onView(row.id)
                }}
            >
                <Eye className="h-4 w-4" />
                Quick view
            </Button>
        )
    },
]
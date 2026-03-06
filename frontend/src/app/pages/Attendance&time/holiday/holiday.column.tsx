import type { DataTableColumn } from "@/app/components/DataTable/DataTable"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit02Icon, Delete02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { Holiday } from "./holiday.hooks"

const typeColors: Record<string, "default" | "secondary" | "outline"> = {
    public: "default",
    company: "secondary",
    optional: "outline",
}

export const HolidayColumns = ({
    onEdit,
    onDelete,
}: {
    onEdit: (h: Holiday) => void
    onDelete: (id: string) => void
}): DataTableColumn<Holiday>[] => [
        {
            header: "NAME",
            accessor: "name",
            cell: (h) => <span className="font-medium">{h.name}</span>,
        },
        {
            header: "DATE",
            accessor: "date",
            cell: (h) =>
                h.date
                    ? new Date(h.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                    : "—",
        },
        {
            header: "TYPE",
            accessor: "type",
            cell: (h) => (
                <Badge variant={typeColors[h.type] ?? "outline"} className="capitalize">
                    {h.type}
                </Badge>
            ),
        },
        {
            header: "PAID",
            accessor: "isPaid",
            cell: (h) => (
                <Badge variant={h.isPaid ? "default" : "secondary"}>{h.isPaid ? "Paid" : "Unpaid"}</Badge>
            ),
        },
        {
            header: "RECURRING",
            accessor: "isRecurring",
            cell: (h) => (h.isRecurring ? "Yes" : "No"),
        },
        {
            header: "DESCRIPTION",
            accessor: "description",
            cell: (h) => <span className="text-muted-foreground text-sm">{h.description || "—"}</span>,
        },
        {
            header: "ACTIONS",
            accessor: "_id",
            cell: (h) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => onEdit(h)}>
                        <HugeiconsIcon icon={Edit02Icon} className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(h._id)}>
                        <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ]

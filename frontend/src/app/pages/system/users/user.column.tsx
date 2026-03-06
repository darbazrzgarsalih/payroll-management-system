import type { DataTableColumn } from "@/app/components/DataTable/DataTable";
import { Button } from "@/components/ui/button";
import { Delete03Icon, Edit04Icon, UserCircle02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export type UserRow = {
    id?: string,
    enr: number,
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    role: string,
    lastLogin: string,
    employeeName: string
    status: string
    avatar?: string
}

export const UserColumns = ({
    onEdit,
    onDelete,
}: {
    onEdit: (user: UserRow) => void,
    onDelete: (id: string) => void,
}): DataTableColumn<UserRow>[] => [
        { header: "ENR", accessor: "enr" },
        {
            header: "IMAGE",
            accessor: 'avatar',
            cell: (row) => (
                <div className="w-8 h-8 rounded-full overflow-hidden bg-muted border border-border flex items-center justify-center">
                    {row.avatar?.trim() ? (
                        <img
                            src={row.avatar.trim().startsWith('http') ? row.avatar.trim() : `${(import.meta.env.VITE_BACKEND_URL?.replace('/api/v1', '') || 'http://localhost:8000').replace(/\/+$/, '')}/${row.avatar.trim().replace(/^\/+/, '')}`}
                            alt={row.username}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <HugeiconsIcon icon={UserCircle02Icon} className="w-5 h-5 text-muted-foreground" />
                    )}
                </div>
            )
        },
        { header: "USERNAME", accessor: 'username' },
        { header: "FIRST NAME", accessor: 'firstName' },
        { header: "LAST NAME", accessor: 'lastName' },
        { header: "EMAIL", accessor: 'email' },
        { header: "ROLE", accessor: 'role' },
        { header: "EMPLOYEE NAME", accessor: 'employeeName' },
        { header: "STATUS", accessor: 'status' },
        {
            header: "LAST LOGIN",
            accessor: "lastLogin",
            cell: (row) => new Date(row.lastLogin).toLocaleString('en-US', {
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
            header: "ACTIONS",
            accessor: 'id',
            className: "text-right",
            cell: (user) => (
                <div>
                    <Button
                        variant="outline"
                        title="edit"
                        onClick={() => onEdit(user)}
                    >
                        <HugeiconsIcon icon={Edit04Icon} />
                    </Button>
                    <Button
                        variant="destructive"
                        title="delete"
                        onClick={() => user.id && onDelete(user.id)}
                    >
                        <HugeiconsIcon icon={Delete03Icon} />
                    </Button>
                </div>
            )
        }
    ]
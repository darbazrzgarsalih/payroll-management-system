import type { DataTableColumn } from "@/app/components/DataTable/DataTable"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete03Icon, Edit04Icon, FileViewIcon, Logout01Icon, UserCircle02Icon } from "@hugeicons/core-free-icons"
export type EmployeeRow = {
    id?: string
    enr: number
    employeeName: string
    employeeCode?: string
    email: string
    department: string
    position: string
    gender: string
    address: string
    status: string
    avatar?: string
}

export const employeeColumns = ({
    onEdit,
    onDelete,
    onTerminate,
    onView
}: {
    onEdit: (employee: EmployeeRow) => void,
    onDelete: (id: string) => void,
    onTerminate: (id: string) => void,
    onView: (id: string) => void
}): DataTableColumn<EmployeeRow>[] => [
        { header: "ENR", accessor: "enr" },
        {
            header: "IMAGE",
            accessor: 'avatar',
            cell: (row) => {
                const getImageUrl = (path: string) => {
                    const trimmed = path.trim();
                    if (trimmed.startsWith('http')) return trimmed;
                    const baseUrl = (import.meta.env.VITE_BACKEND_URL?.replace('/api/v1', '') || 'http://localhost:8000').replace(/\/+$/, '');
                    return `${baseUrl}/${trimmed.replace(/^\/+/, '')}`;
                };
                return (
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-muted border border-border flex items-center justify-center">
                        {row.avatar ? (
                            <img src={getImageUrl(row.avatar)} alt={row.employeeName} className="w-full h-full object-cover" />
                        ) : (
                            <HugeiconsIcon icon={UserCircle02Icon} className="w-5 h-5 text-muted-foreground" />
                        )}
                    </div>
                )
            }
        },
        { header: "FULL NAME", accessor: "employeeName" },
        { header: "EMAIL", accessor: "email" },
        { header: "DEPARTMENT", accessor: "department" },
        { header: "POSITION", accessor: "position" },
        { header: "GENDER", accessor: "gender" },
        { header: "ADDRESS", accessor: "address" },
        { header: "STATUS", accessor: "status" },
        {
            header: "ACTIONS",
            accessor: "id",
            className: "text-right",
            cell: (employee) => {
                return (
                    <div className="flex justify-center gap-2">
                        <Button
                            variant="outline"
                            title="edit"
                            onClick={() => onEdit(employee)}
                        >
                            <HugeiconsIcon icon={Edit04Icon} />
                        </Button>

                        <Button
                            variant="outline"
                            title="Deactivate"
                            className="text-orange-500 hover:text-orange-600"
                            onClick={() => employee.id && onTerminate(employee.id)}
                            disabled={employee.status === 'terminated'}
                        >
                            <HugeiconsIcon icon={Logout01Icon} />
                        </Button>

                        <Button
                            variant="destructive"
                            title="delete"
                            onClick={() => employee.id && onDelete(employee.id)}
                        >
                            <HugeiconsIcon icon={Delete03Icon} />
                        </Button>

                        <Button
                            variant="outline"
                            title="Full view"
                            onClick={() => employee.id && onView(employee.id)}
                        >
                            <HugeiconsIcon icon={FileViewIcon} />
                        </Button>
                    </div>
                )
            },
        }
    ]

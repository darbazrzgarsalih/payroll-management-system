import type { DataTableColumn } from "@/app/components/DataTable/DataTable";
import { Button } from "@/components/ui/button";
import { Edit04Icon, UnavailableIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Spinner } from "@/components/ui/spinner";

export type RewardRow = {
    id?: string,
    enr: number,
    employeeName: string
    payrollName: string
    type: string
    amount: number
    reason: string
    paymentDate: string
    status: string
}

export const RewardColumns = ({
    onEdit,
    onVoid,
    actionLoading
}: {
    onEdit: (reward: RewardRow) => void,
    onVoid: (id: string) => void,
    actionLoading: string | null
}): DataTableColumn<RewardRow>[] => [
        { header: "ENR", accessor: "enr" },
        { header: "PAYROLL NAME", accessor: 'payrollName' },
        { header: "EMPLOYEE NAME", accessor: 'employeeName' },
        { header: "TYPE", accessor: 'type' },
        { header: "REASON", accessor: 'reason' },
        { header: "AMOUNT", accessor: 'amount' },
        { header: "PAYMENT DATE", accessor: 'paymentDate' },
        { header: "STATUS", accessor: 'status' },
        {
            header: "ACTIONS",
            accessor: 'id',
            className: "text-right",
            cell: (reward) => (
                <div className="flex gap-2 justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        title="edit"
                        disabled={reward.status === 'voided' || reward.status === 'paid'}
                        onClick={() => onEdit(reward)}
                    >
                        <HugeiconsIcon icon={Edit04Icon} className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        title="void"
                        disabled={reward.status === 'voided' || reward.status === 'paid' || actionLoading === reward.id}
                        onClick={() => reward.id && onVoid(reward.id)}
                    >
                        {actionLoading === reward.id ? <Spinner /> : <HugeiconsIcon icon={UnavailableIcon} className="h-4 w-4" />}
                    </Button>
                </div>
            )
        }
    ]



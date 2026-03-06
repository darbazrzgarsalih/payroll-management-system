import type { DataTableColumn } from "@/app/components/DataTable/DataTable";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export type PayslipRow = {
    id: string;
    enr: number;
    employeeName: string;
    payrollName: string;
    startDate: string;
    endDate: string;
    baseSalary: number;
    grossPay: number;
    netPay: number;
    status: "draft" | "approved" | "paid";
    isAdjustment?: boolean;
};

const statusColor: Record<string, string> = {
    paid: "bg-green-100 text-green-800 border border-green-200",
    approved: "bg-blue-100 text-blue-800 border border-blue-200",
    draft: "bg-muted text-muted-foreground border",
};

const fmt = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val ?? 0);

export const PayslipColumns = (
    onView: (row: PayslipRow) => void
): DataTableColumn<PayslipRow>[] => [
        { header: "ENR", accessor: "enr" },
        {
            header: "EMPLOYEE",
            accessor: "employeeName",
            cell: (row: PayslipRow) => (
                <div className="flex items-center gap-1.5">
                    <span className="font-medium">{row.employeeName}</span>
                    {row.isAdjustment && (
                        <span className="text-xs bg-orange-100 text-orange-700 border border-orange-200 px-1.5 py-0.5 rounded-full">
                            Adj
                        </span>
                    )}
                </div>
            ),
        },
        { header: "PAYROLL", accessor: "payrollName" },
        { header: "START DATE", accessor: "startDate" },
        { header: "END DATE", accessor: "endDate" },
        {
            header: "GROSS",
            accessor: "grossPay",
            cell: (row: PayslipRow) => <span className="font-mono text-sm">{fmt(row.grossPay)}</span>,
        },
        {
            header: "NET PAY",
            accessor: "netPay",
            cell: (row: PayslipRow) => (
                <span className="font-mono text-sm font-semibold text-emerald-600">{fmt(row.netPay)}</span>
            ),
        },
        {
            header: "STATUS",
            accessor: "status",
            cell: (row: PayslipRow) => (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[row.status] ?? statusColor.draft}`}>
                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                </span>
            ),
        },
        {
            header: "",
            accessor: "id",
            className: "text-right",
            cell: (row: PayslipRow) => (
                <Button size="sm" variant="ghost" onClick={() => onView(row)}>
                    <Eye className="h-3.5 w-3.5 mr-1" /> View
                </Button>
            ),
        },
    ];
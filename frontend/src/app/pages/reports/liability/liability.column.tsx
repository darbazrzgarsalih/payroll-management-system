import type { DataTableColumn } from "@/app/components/DataTable/DataTable"
import type { LiabilityRow } from "./liability.hooks"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const liabilityColumns: DataTableColumn<LiabilityRow>[] = [
    {
        accessor: "month",
        header: "Month",
        cell: (row) => {
            const m = row.month;
            return <span className="font-medium">{MONTHS[m - 1]} {row.year}</span>
        }
    },
    {
        accessor: "department",
        header: "Department",
        cell: (row) => <span className="text-gray-700">{row.department}</span>
    },
    {
        accessor: "employeeCount",
        header: "Employees",
        cell: (row) => <span>{row.employeeCount}</span>
    },
    {
        accessor: "totalGrossPay",
        header: "Gross Pay",
        cell: (row) => <span className="text-gray-700">${row.totalGrossPay?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
    },
    {
        accessor: "totalDeductions",
        header: "Employee Deductions",
        cell: (row) => <span className="text-gray-700">${row.totalDeductions?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
    },
    {
        accessor: "totalNetPay",
        header: "Net Pay",
        cell: (row) => <span className="text-gray-700">${row.totalNetPay?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
    },
    {
        accessor: "employerTaxes",
        header: "Employer Taxes",
        cell: (row) => <span className="text-gray-700">${row.employerTaxes?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
    },
    {
        accessor: "totalLiability",
        header: "Total Liability",
        cell: (row) => <span className="font-semibold">${row.totalLiability?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
    }
]

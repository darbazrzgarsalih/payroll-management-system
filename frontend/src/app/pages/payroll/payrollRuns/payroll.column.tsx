






//     _id: string,
//     enr: number,
//     startDate: string,
//     endDate: string,
//     payDate: string
//     status: string,




// export const PayrollColumns: DataTableColumn<PayrollRow>[] = [
//     { header: "ENR", accessor: "enr" },
//     { header: "START DATE", accessor: 'startDate' },
//     { header: "END DATE", accessor: 'endDate' },
//     { header: "PAY DATE", accessor: 'payDate' },
//     { header: "STATUS", accessor: 'status' },

//         header: "ACTIONS",
//         accessor: '_id',
//         className: "text-right",
//         cell: (cellProps) => {  
//              



//             

















import type { DataTableColumn } from "@/app/components/DataTable/DataTable";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export type PayrollRow = {
    _id?: string
    enr: number
    startDate: string
    endDate: string
    payDate: string
    status: string
}

const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    processing: "bg-blue-100 text-blue-700",
    approved: "bg-green-100 text-green-700",
    paid: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
}

export const PayrollColumns: DataTableColumn<PayrollRow>[] = [
    { header: "ENR", accessor: "enr" },
    { header: "START DATE", accessor: "startDate" },
    { header: "END DATE", accessor: "endDate" },
    { header: "PAY DATE", accessor: "payDate" },
    {
        header: "STATUS",
        accessor: "status",
        cell: (row) => (
            <span className={`text-xs px-2 py-1 rounded font-semibold ${statusColors[row.status] || "bg-gray-100 text-gray-700"}`}>
                {row.status.toUpperCase()}
            </span>
        )
    },
    {
        header: "",
        accessor: "_id",
        className: "text-right",
        cell: (row) => (
            <div className="flex gap-2 justify-end">
                <Link to={`/app/payroll/${row._id}/summary`}>
                    <Button size="sm" variant="outline">Details</Button>
                </Link>
            </div>
        )
    }
]
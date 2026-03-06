



//     id: string
//     enr: number
//     employeeName: string
//     date: string
//     timeIn: string
//     timeOut: string
//     totalHours: number
//     regularHours: number
//     overtimeHours: number
//     shift: string
//     status: string
//     remarks: string


// export const AttendanceColumn: DataTableColumn<AttendanceRow>[] = [
//     {header: 'ENR', accessor: 'enr'},
//     {header: 'EMPLOYEE', accessor: 'employeeName'},

//         header: 'TIME IN',
//         accessor: 'timeIn',
//         cell: row => new Date(row.timeIn).toLocaleTimeString()


//         header: 'TIME OUT', 
//         accessor: 'timeOut',
//         cell: row => new Date(row.timeOut).toLocaleTimeString()

//     {header: 'TOTAL HOURS', accessor: 'totalHours'},
//     {header: 'REGULAR HOURS', accessor: 'regularHours'},
//     {header: 'OVERTIME HOURS', accessor: 'overtimeHours'},
//     {header: 'SHIFT', accessor: 'shift'},
//     {header: 'STATUS', accessor: 'status'},
//     {header: 'REMARKS', accessor: 'remarks'},

//         header: 'ACTIONS',
//         accessor: 'id',
//         cell: () => (









import type { DataTableColumn } from "@/app/components/DataTable/DataTable"
import { Button } from "@/components/ui/button"

export type AttendanceRow = {
    _id: string
    enr: number
    employeeName: string
    employeeCode: string
    date: string
    timeIn: string
    timeOut: string
    totalHours: number
    regularHours: number
    overtimeHours: number
    status: string
    remarks: string
    onEdit?: (row: AttendanceRow) => void
}

const statusColors: Record<string, string> = {
    present: "bg-green-100 text-green-700",
    absent: "bg-red-100 text-red-700",
    late: "bg-orange-100 text-orange-700",
    half_day: "bg-yellow-100 text-yellow-700",
    on_leave: "bg-blue-100 text-blue-700",
}

const formatTime = (val: string) => {
    if (!val) return "—"
    try {
        return new Date(val).toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', hour12: true,
            timeZone: 'Asia/Baghdad'
        })
    } catch { return "—" }
}

const formatDate = (val: string) => {
    if (!val) return "—"
    return new Date(val).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    })
}

export const AttendanceColumns: DataTableColumn<AttendanceRow>[] = [
    { header: "ENR", accessor: "enr" },
    {
        header: "EMPLOYEE",
        accessor: "employeeName",
        cell: (row) => (
            <div className="flex flex-col">
                <span className="font-medium">{row.employeeName}</span>
                <span className="text-xs text-muted-foreground">{row.employeeCode}</span>
            </div>
        )
    },
    {
        header: "DATE",
        accessor: "date",
        cell: (row) => formatDate(row.date)
    },
    {
        header: "TIME IN",
        accessor: "timeIn",
        cell: (row) => formatTime(row.timeIn)
    },
    {
        header: "TIME OUT",
        accessor: "timeOut",
        cell: (row) => formatTime(row.timeOut)
    },
    {
        header: "TOTAL HRS",
        accessor: "totalHours",
        cell: (row) => row.totalHours ? `${row.totalHours}h` : "—"
    },
    {
        header: "OVERTIME",
        accessor: "overtimeHours",
        cell: (row) => row.overtimeHours ? (
            <span className="text-orange-600 font-medium">{row.overtimeHours}h</span>
        ) : "—"
    },
    {
        header: "STATUS",
        accessor: "status",
        cell: (row) => (
            <span className={`text-xs px-2 py-1 rounded font-semibold ${statusColors[row.status] || "bg-gray-100 text-gray-700"}`}>
                {row.status.replace("_", " ").toUpperCase()}
            </span>
        )
    },
    {
        header: "REMARKS",
        accessor: "remarks",
        cell: (row) => (
            <span className="text-xs text-muted-foreground">{row.remarks || "—"}</span>
        )
    },
    {
        header: "",
        accessor: "_id",
        cell: (row) => (
            <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                    e.stopPropagation()
                    row.onEdit?.(row)
                }}
            >
                Edit
            </Button>
        )
    }
]
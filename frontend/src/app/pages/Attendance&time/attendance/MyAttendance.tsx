import { DataTable } from "@/app/components/DataTable/DataTable"
import { PageHeader } from "@/app/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HugeiconsIcon } from "@hugeicons/react"
import { Refresh01Icon } from "@hugeicons/core-free-icons"
import { AttendanceColumns } from "./attendance.column"
import { useMyAttendance } from "./attendance.hooks"
import { CheckInOut } from "./CheckInOut"
import { Spinner } from "@/components/ui/spinner"
import { LoadingPage } from "@/app/components/LoadingPage"
import { Pagination } from "@/app/components/Pagination"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react"


function MyAttendance() {
    const {
        attendance, loading, error, refetch,
        total, page, setPage, limit,
        summary, setFilters
    } = useMyAttendance()

    const [tempFilters, setTempFilters] = useState({ from: '', to: '' })

    const applyFilters = () => {
        setFilters(tempFilters)
    }

    const clearFilters = () => {
        const empty = { from: '', to: '' }
        setTempFilters(empty)
        setFilters(empty)
    }

    const tableData = attendance.map((atn, index) => ({
        _id: atn._id,
        enr: (page - 1) * limit + index + 1,
        employeeName: "",
        employeeCode: "",
        date: atn.date,
        timeIn: atn.timeIn,
        timeOut: atn.timeOut,
        totalHours: atn.totalHours,
        regularHours: atn.regularHours,
        overtimeHours: atn.overtimeHours,
        status: atn.status,
        remarks: atn.remarks
    }))

    if (error) return (
        <div className="flex justify-center items-center h-screen text-muted-foreground">
            <p>{error}</p>
        </div>
    )

    return (
        <div className="space-y-6">
            <PageHeader
                title="My Attendance"
                description="View your personal attendance history and summary"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <CheckInOut onSuccess={refetch} />
                </div>
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Worked</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.totalHoursWorked || 0}h</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Overtime</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.totalOvertimeHours || 0}h</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Present Days</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.presentDays || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Absent/Half Days</CardTitle>
                            <XCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{(summary.absentDays || 0) + (summary.halfDays || 0)}</div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 items-end bg-muted/30 p-4 rounded-lg">
                <div className="space-y-2">
                    <Label className="text-xs">From Date</Label>
                    <Input
                        type="date"
                        value={tempFilters.from}
                        onChange={(e) => setTempFilters(p => ({ ...p, from: e.target.value }))}
                        className="w-40"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">To Date</Label>
                    <Input
                        type="date"
                        value={tempFilters.to}
                        onChange={(e) => setTempFilters(p => ({ ...p, to: e.target.value }))}
                        className="w-40"
                    />
                </div>
                <Button onClick={applyFilters}>Apply</Button>
                <Button variant="outline" onClick={clearFilters}>Clear</Button>
                <div className="flex-1" />
                <Button variant="ghost" onClick={refetch} disabled={loading}>
                    {loading ? <Spinner className="h-4 w-4 mr-2" /> : <HugeiconsIcon icon={Refresh01Icon} className="mr-2" />}
                    Refresh
                </Button>
            </div>

            {loading && attendance.length === 0 ? (
                <LoadingPage />
            ) : (
                <DataTable
                    columns={AttendanceColumns.filter(c => c.header !== "" && c.header !== "EMPLOYEE" && c.header !== "EMPLOYEE CODE")}
                    data={tableData}
                    emptyMessage="No attendance records found for the selected period."
                />
            )}

            <Pagination
                page={page}
                limit={limit}
                total={total}
                onPageChange={setPage}
            />
        </div>
    )
}

export default MyAttendance

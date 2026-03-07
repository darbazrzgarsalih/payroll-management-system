import { DataTable } from "@/app/components/DataTable/DataTable"
import { PageHeader } from "@/app/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HugeiconsIcon } from "@hugeicons/react"
import { Refresh01Icon, FileExportIcon, Upload01Icon } from "@hugeicons/core-free-icons"
import { AttendanceColumns, type AttendanceRow } from "./attendance.column"
import { useAttendances, useAttendanceActions, useImportAttendance } from "./attendance.hooks"
import { Spinner } from "@/components/ui/spinner"
import { LoadingPage } from "@/app/components/LoadingPage"
import { Pagination } from "@/app/components/Pagination"
import { useState, useEffect, useRef, useCallback } from "react"
import api from "@/app/services/api"
import {
    Popover, PopoverContent, PopoverTrigger
} from "@/components/ui/popover"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle
} from "@/components/ui/sheet"

const STATUS_OPTIONS = ["present", "absent", "late", "half_day", "on_leave"]

const statusColors: Record<string, string> = {
    present: "bg-green-100 text-green-700",
    absent: "bg-red-100 text-red-700",
    late: "bg-orange-100 text-orange-700",
    half_day: "bg-yellow-100 text-yellow-700",
    on_leave: "bg-blue-100 text-blue-700",
}



function EditAttendanceDrawer({
    row,
    open,
    onClose,
    onSave,
    saving
}: {
    row: AttendanceRow | null
    open: boolean
    onClose: () => void
    onSave: (id: string, data: any) => void
    saving: boolean
}) {
    const [form, setForm] = useState({
        status: '',
        timeIn: '',
        timeOut: '',
        remarks: ''
    })

    const toLocalISO = (dateStr: string) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            const formatter = new Intl.DateTimeFormat('en-CA', {
                timeZone: 'Asia/Baghdad',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
            const parts = formatter.formatToParts(date);
            const p: Record<string, string> = {};
            parts.forEach(part => p[part.type] = part.value);
            return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
        } catch {
            return '';
        }
    };

    useEffect(() => {
        if (row) {
            setForm({
                status: row.status || '',
                timeIn: toLocalISO(row.timeIn),
                timeOut: toLocalISO(row.timeOut),
                remarks: row.remarks || ''
            })
        }
    }, [row])

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent className="w-[400px] overflow-y-auto p-4">
                <SheetHeader>
                    <SheetTitle>Edit Attendance</SheetTitle>
                    <SheetDescription>Edit attendance informations below.</SheetDescription>
                </SheetHeader>

                {row && (
                    <div className="mt-6 space-y-4">
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Employee</p>
                            <p className="font-medium">{row.employeeName}</p>
                            <p className="text-xs text-muted-foreground">{row.date}</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs">Status</Label>
                            <Select value={form.status} onValueChange={(v) => setForm(p => ({ ...p, status: v }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map(s => (
                                        <SelectItem key={s} value={s}>
                                            <span className={`text-xs px-2 py-0.5 rounded font-semibold ${statusColors[s]}`}>
                                                {s.replace("_", " ").toUpperCase()}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs">Time In</Label>
                            <Input
                                type="datetime-local"
                                value={form.timeIn}
                                onChange={(e) => setForm(p => ({ ...p, timeIn: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs">Time Out</Label>
                            <Input
                                type="datetime-local"
                                value={form.timeOut}
                                onChange={(e) => setForm(p => ({ ...p, timeOut: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs">Remarks</Label>
                            <Input
                                placeholder="Optional remarks"
                                value={form.remarks}
                                onChange={(e) => setForm(p => ({ ...p, remarks: e.target.value }))}
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button
                                className="flex-1"
                                onClick={() => onSave(row._id, form)}
                                disabled={saving}
                            >
                                {saving ? <Spinner className="h-4 w-4" /> : "Save Changes"}
                            </Button>
                            <Button className="flex-1" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}



function Attendance() {
    const {
        attendances, loading, error, refetch,
        total, page, setPage, limit,
        filters, setFilters
    } = useAttendances()

    const { updateAttendance, actionLoading } = useAttendanceActions(refetch)

    const [search, setSearch] = useState('')
    const [filtersOpen, setFiltersOpen] = useState(false)
    const [tempFilters, setTempFilters] = useState({ status: '', from: '', to: '' })
    const [editRow, setEditRow] = useState<AttendanceRow | null>(null)
    const [editOpen, setEditOpen] = useState(false)
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const { importData, loading: importLoading } = useImportAttendance({ refetch })

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) await importData(file)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }


    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current)
        searchTimeout.current = setTimeout(() => {
            setFilters(prev => ({ ...prev, search }))
        }, 500)
        return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current) }
    }, [search])

    const applyFilters = () => {
        setFilters(prev => ({ ...prev, ...tempFilters }))
        setFiltersOpen(false)
    }

    const clearFilters = () => {
        const empty = { status: '', from: '', to: '' }
        setTempFilters(empty)
        setFilters(prev => ({ ...prev, ...empty }))
        setFiltersOpen(false)
    }

    const hasActiveFilters = filters.status || filters.from || filters.to

    const handleExport = useCallback(async () => {
        try {
            const params = new URLSearchParams()
            if (filters.search) params.append('search', filters.search)
            if (filters.status) params.append('status', filters.status)
            if (filters.from) params.append('from', filters.from)
            if (filters.to) params.append('to', filters.to)
            const res = await api.get(`/attendances/export?${params.toString()}`, { responseType: 'blob' })
            const url = URL.createObjectURL(res.data)
            const a = document.createElement('a')
            a.href = url; a.download = `attendance-${Date.now()}.csv`; a.click()
            URL.revokeObjectURL(url)
        } catch { }
    }, [filters])

    const tableData: AttendanceRow[] = attendances.map((atn, index) => ({
        _id: atn._id,
        enr: (page - 1) * limit + index + 1,
        employeeName: atn.employeeID
            ? [atn.employeeID.personalInfo?.firstName, atn.employeeID.personalInfo?.middleName, atn.employeeID.personalInfo?.lastName].filter(Boolean).join(' ')
            : '—',
        employeeCode: atn.employeeID?.employeeCode || '—',
        date: atn.date,
        timeIn: atn.timeIn,
        timeOut: atn.timeOut,
        totalHours: atn.totalHours,
        regularHours: atn.regularHours,
        overtimeHours: atn.overtimeHours,
        status: atn.status,
        remarks: atn.remarks,
        onEdit: (row) => {
            setEditRow(row)
            setEditOpen(true)
        }
    }))

    if (loading && attendances.length === 0) {
        return <LoadingPage />
    }

    if (error) return (
        <div className="flex justify-center items-center h-screen text-muted-foreground">
            <p>{error}</p>
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <PageHeader
                    title="Attendance"
                    description={`${total} ${total === 1 ? "record" : "records"}`}
                />
            </div>

            <div className="flex w-full justify-end gap-2">
                <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
                <Button className="flex items-center gap-2" onClick={() => fileInputRef.current?.click()} variant="outline" disabled={importLoading}>
                    Import CSV
                    {importLoading ? <Spinner className="w-4 h-4 ml-2" /> : <HugeiconsIcon icon={Upload01Icon} />}
                </Button>
                <Button className="flex items-center gap-2" onClick={handleExport} variant="outline">
                    Export CSV
                    <HugeiconsIcon icon={FileExportIcon} />
                </Button>
                <Button className="flex items-center gap-2" onClick={refetch} variant="outline" disabled={loading}>
                    {loading ? <Spinner className="h-4 w-4" /> : <HugeiconsIcon icon={Refresh01Icon} />}
                    Refresh
                </Button>
            </div>


            <div className="flex gap-4">
                <Input
                    placeholder="Search by employee name or code..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1"
                />

                <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="relative">
                            Select filters
                            {hasActiveFilters && (
                                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 space-y-4" align="end">
                        <p className="font-semibold text-sm">Filter Attendance</p>

                        <div className="space-y-2">
                            <Label className="text-xs">Status</Label>
                            <Select
                                value={tempFilters.status}
                                onValueChange={(v) => setTempFilters(p => ({ ...p, status: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map(s => (
                                        <SelectItem key={s} value={s}>
                                            {s.replace("_", " ").toUpperCase()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs">From Date</Label>
                            <Input
                                type="date"
                                value={tempFilters.from}
                                onChange={(e) => setTempFilters(p => ({ ...p, from: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs">To Date</Label>
                            <Input
                                type="date"
                                value={tempFilters.to}
                                onChange={(e) => setTempFilters(p => ({ ...p, to: e.target.value }))}
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button className="flex-1" onClick={applyFilters}>Apply</Button>
                            <Button className="flex-1" variant="outline" onClick={clearFilters}>Clear</Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-40 text-muted-foreground">
                    <Spinner className="h-5 w-5" />
                </div>
            ) : (
                <DataTable
                    columns={AttendanceColumns}
                    data={tableData}
                    emptyMessage="Once there are attendances to show, you can view them here"
                />
            )}

            <Pagination
                page={page}
                limit={limit}
                total={total}
                onPageChange={setPage}
            />

            <EditAttendanceDrawer
                row={editRow}
                open={editOpen}
                onClose={() => setEditOpen(false)}
                onSave={async (id, data) => {
                    await updateAttendance(id, data)
                    setEditOpen(false)
                }}
                saving={actionLoading === "update"}
            />
        </div>
    )
}

export default Attendance
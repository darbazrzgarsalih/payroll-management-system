import api from "@/app/services/api"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export type Attendance = {
    _id: string
    employeeID: any
    date: string
    timeIn: string
    timeOut: string
    totalHours: number
    regularHours: number
    overtimeHours: number
    status: string
    remarks: string
}

export type AttendanceFilters = {
    search: string
    status: string
    from: string
    to: string
}

export function useAttendances() {
    const [attendances, setAttendances] = useState<Attendance[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<null | string>(null)
    const [page, setPage] = useState<number>(1)
    const [limit] = useState<number>(15)
    const [total, setTotal] = useState<number>(0)
    const [filters, setFilters] = useState<AttendanceFilters>({
        search: '', status: '', from: '', to: ''
    })

    const fetchAttendances = async () => {
        setLoading(true)
        setError(null)
        try {
            const params: Record<string, any> = { page, limit }
            if (filters.search) params.search = filters.search
            if (filters.status) params.status = filters.status
            if (filters.from) params.from = filters.from
            if (filters.to) params.to = filters.to

            const res = await api.get('/attendances/report', { params })
            setAttendances(res.data.attendances)
            setTotal(res.data.total)
        } catch (error: any) {
            setError(error?.response?.data?.message || "Could not fetch attendances")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { setPage(1) }, [filters])
    useEffect(() => { fetchAttendances() }, [page, filters])

    return {
        attendances, loading, error,
        refetch: fetchAttendances,
        total, page, setPage, limit,
        filters, setFilters
    }
}

export function useAttendanceActions(refetch: () => void) {
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const manualCheckIn = async (employeeID: string, date: string, timeIn: string, remarks?: string) => {
        setActionLoading("checkin")
        try {
            await api.post('/attendances/checkin', { employeeID, date, timeIn, remarks })
            toast.success("Check-in recorded successfully")
            refetch()
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Could not check in")
        } finally {
            setActionLoading(null)
        }
    }

    const updateAttendance = async (id: string, data: Partial<Attendance>) => {
        setActionLoading("update")
        try {
            await api.put(`/attendances/${id}`, data)
            toast.success("Attendance updated successfully")
            refetch()
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Could not update attendance")
        } finally {
            setActionLoading(null)
        }
    }

    return { manualCheckIn, updateAttendance, actionLoading }
}

export function useMyAttendance() {
    const [attendance, setAttendance] = useState<Attendance[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<null | string>(null)
    const [page, setPage] = useState<number>(1)
    const [limit] = useState<number>(30)
    const [total, setTotal] = useState<number>(0)
    const [summary, setSummary] = useState<any>({})
    const [filters, setFilters] = useState({ from: '', to: '' })

    const fetchMyAttendance = async () => {
        setLoading(true)
        setError(null)
        try {
            const params: any = { page, limit }
            if (filters.from) params.from = filters.from
            if (filters.to) params.to = filters.to

            const res = await api.get('/attendances/my', { params })
            setAttendance(res.data.attendance)
            setTotal(res.data.total)
            setSummary(res.data.summary)
        } catch (error: any) {
            setError(error?.response?.data?.message || "Could not fetch your attendance")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchMyAttendance() }, [page, filters])

    return {
        attendance, loading, error,
        refetch: fetchMyAttendance,
        total, page, setPage, limit,
        summary, filters, setFilters
    }
}

export function useCheckInOut(onSuccess?: () => void, initialRecord?: Attendance | null) {
    const [loading, setLoading] = useState<boolean>(false)
    const [todayRecord, setTodayRecord] = useState<Attendance | null>(initialRecord || null)

    useEffect(() => {
        if (initialRecord !== undefined) {
            setTodayRecord(initialRecord)
        }
    }, [initialRecord])

    const fetchTodayStatus = async () => {
        if (initialRecord !== undefined) return
        setLoading(true)
        try {
            const res = await api.get('/attendances/my', { params: { limit: 1 } })
            const lastRecord = res.data.attendance[0]
            if (lastRecord) {
                const recordDate = new Date(lastRecord.date)
                const today = new Date()

                const sameDay =
                    recordDate.getFullYear() === today.getFullYear() &&
                    recordDate.getMonth() === today.getMonth() &&
                    recordDate.getDate() === today.getDate()

                if (sameDay) {
                    setTodayRecord(lastRecord)
                } else {
                    setTodayRecord(null)
                }
            } else {
                setTodayRecord(null)
            }
        } catch (error) {
            console.error("Could not fetch today's status", error)
        } finally {
            setLoading(false)
        }
    }

    const checkIn = async (remarks?: string) => {
        setLoading(true)
        try {
            const res = await api.post('/attendances/checkin', { remarks })
            toast.success("Checked in successfully")
            if (res.data.attendance) {
                setTodayRecord(res.data.attendance)
            } else {
                await fetchTodayStatus()
            }
            onSuccess?.()
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Could not check in")
        } finally {
            setLoading(false)
        }
    }

    const checkOut = async (remarks?: string) => {
        setLoading(true)
        try {
            await api.post('/attendances/checkout', { remarks })
            toast.success("Checked out successfully")
            
            
            await fetchTodayStatus()
            onSuccess?.()
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Could not check out")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchTodayStatus() }, [])

    return { checkIn, checkOut, loading, todayRecord, refetchStatus: fetchTodayStatus }
}

export function useImportAttendance({ refetch }: { refetch: () => void }) {
    const [loading, setLoading] = useState(false)

    const importData = async (file: File) => {
        setLoading(true)
        const formData = new FormData()
        formData.append('csv', file)

        try {
            const res = await api.post('/attendances/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            if (res.data.success) {
                toast.success(res.data.message || "Import completed successfully")
                refetch()
            } else {
                toast.warning(`Import completed with ${res.data.errors?.length} errors.`)
            }
            return true
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to import attendance")
            return false
        } finally {
            setLoading(false)
        }
    }

    return { importData, loading }
}
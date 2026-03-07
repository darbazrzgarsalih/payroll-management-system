import api from "@/app/services/api"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { downloadCSV } from "@/app/utils/export"

export type Leave = {
    _id?: string
    id?: string
    enr?: number
    employeeName: string
    leaveType: string
    startDate: string
    endDate: string
    totalDays: string | number
    reason?: string
    status: string
}

export type LeaveForm = {
    employeeID: string
    leaveTypeID: string
    startDate: string
    endDate: string
    reason: string
}

export function useLeaves() {
    const [page, setPage] = useState<number>(1)
    const [limit] = useState<number>(10)
    const [total, setTotal] = useState<number>(0)
    const [leaves, setLeaves] = useState<Leave[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [status, setStatus] = useState<string>("")
    const [search, setSearch] = useState<string>("")
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [exportLoading, setExportLoading] = useState<boolean>(false)

    const fetchLeaves = async () => {
        setLoading(true)
        setError(null)

        try {
            const res = await api.get('/leaves', {
                params: {
                    page, limit,
                    status: status && status !== "all_status" ? status : undefined,
                    name: search ? search.trim() : undefined
                }
            })
            setLeaves(res.data.leaves)
            setTotal(res.data.total)
        } catch (error: any) {
            setError(error?.response?.data?.message || "Could not fetch leaves")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLeaves()
    }, [page, status, search])

    useEffect(() => {
        const handler = setTimeout(() => {
            setSearch(searchTerm)
            setPage(1)
        }, 400)

        return () => clearTimeout(handler)
    }, [searchTerm])

    const exportData = async () => {
        setExportLoading(true)
        try {
            const res = await api.get('/leaves', {
                params: {
                    limit: 10000,
                    status: status && status !== "all_status" ? status : undefined,
                    name: search ? search.trim() : undefined
                }
            })
            const allLeaves = res.data.leaves
            const headers = ["Employee Name", "Leave Type", "Start Date", "End Date", "Total Days", "Reason", "Status"]
            const keys = ["employeeName", "leaveType", "startDate", "endDate", "totalDays", "reason", "status"]
            downloadCSV(allLeaves, `leaves_export_${new Date().getTime()}.csv`, headers, keys)
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to export leaves")
        } finally {
            setExportLoading(false)
        }
    }

    return {
        leaves,
        loading,
        error,
        refetch: fetchLeaves,
        page,
        total,
        limit,
        setPage,
        search: searchTerm,
        setSearch: setSearchTerm,
        status,
        setStatus,
        actionLoading,
        exportData,
        exportLoading
    }
}

export function useApplyLeave() {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [submitted, setSubmitted] = useState<boolean>(false)
    const [open, setOpen] = useState<boolean>(false)

    const [form, setForm] = useState<LeaveForm>({
        employeeID: "",
        leaveTypeID: "",
        startDate: "",
        endDate: "",
        reason: ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setForm(prev => ({
            ...prev,
            [name]: value,
        }))
    }

    const validateForm = (): boolean => {
        const requiredFields = ['employeeID', 'leaveTypeID', 'startDate', 'endDate'] as const
        return requiredFields.every(field => form[field].trim() !== '')
    }

    const resetForm = () => {
        setForm({
            employeeID: "",
            leaveTypeID: "",
            startDate: "",
            endDate: "",
            reason: ""
        })
        setSubmitted(false)
        setError(null)
    }

    const applyLeave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitted(true)

        if (!validateForm()) {
            setError("Please fill in all required fields")
            return
        }

        setLoading(true)
        setError(null)

        try {
            await api.post('/leaves', {
                employeeID: form.employeeID,
                leaveTypeID: form.leaveTypeID,
                startDate: form.startDate,
                endDate: form.endDate,
                reason: form.reason || undefined
            })
            setOpen(false)
            resetForm()
            toast.success('Leave applied successfully!')
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to apply leave"
            setError(errorMessage)
            console.error("Application error:", errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return {
        loading,
        error,
        submitted,
        form,
        setForm,
        handleChange,
        applyLeave,
        handleSelectChange,
        open,
        setOpen,
        resetForm
    }
}

export function useApproveLeaves({ refetch }: { refetch: () => void }) {
    const [error, setError] = useState<null | string>(null)
    const [loadingApprove, setLoadingApprove] = useState<boolean>(false)

    const approveLeave = async (id: string) => {
        setLoadingApprove(true)
        setError(null)

        try {
            await api.patch(`/leaves/approve/${id}`)
            toast.success("Leave has been approved")
            refetch()
            return true
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Cannot approve leave")
            return false
        } finally {
            setLoadingApprove(false)
        }
    }

    return {
        error,
        loadingApprove,
        approveLeave
    }
}


export function useRejectLeaves({ refetch }: { refetch: () => void }) {
    const [error, setError] = useState<null | string>(null)
    const [loadingReject, setLoadingReject] = useState<boolean>(false)

    const rejectLeave = async (id: string) => {
        setLoadingReject(true)
        setError(null)

        try {
            await api.patch(`/leaves/reject/${id}`)
            toast.success("Leave has been rejectd")
            refetch()
            return true
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Cannot reject leave")
            return false
        } finally {
            setLoadingReject(false)
        }
    }

    return {
        error,
        loadingReject,
        rejectLeave
    }
}


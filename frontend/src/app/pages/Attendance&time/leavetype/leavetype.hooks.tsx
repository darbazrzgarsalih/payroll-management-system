import api from "@/app/services/api"
import React, { useEffect, useState } from "react"
import { toast } from "sonner"

export type LeaveType = {
    id?: string,
    enr: number,
    name: string,
    defaultDays: string,
    requiresApproval: boolean,
    status: string
}

export function useLeaveTypes() {
    const [page, setPage] = useState<number>(1)
    const [limit] = useState<number>(1)
    const [total, setTotal] = useState<number>(0)
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<null | string>(null)
    const [status, setStatus] = useState<string>("")
    const [search, setSearch] = useState<string>("")
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const fetchLeaveTypes = async () => {
        setLoading(true)
        setError(null)

        try {
            const res = await api.get('/leave-types', {
                params: {
                    page, limit,
                    status: status && status !== "all_status" ? status : undefined,
                    name: search ? search.trim() : undefined
                }
            })
            setLeaveTypes(res.data.leaveTypes)
            setTotal(res.data.total)
        } catch (error: any) {
            setError(error?.response?.data?.message || "Failed to fetch leave types")
        } finally {
            setLoading(false)
        }
    }

    const deactivateLeaveType = async (id: string) => {
        setActionLoading(id)
        setError(null)
        try {
            await api.patch(`/leave-types/deactivate/${id}`)
            toast.success("leave type deactivated")
            fetchLeaveTypes()
            return true
        } catch (err: any) {
            setError(err?.response?.data?.message || "Cannot deactivate leave type")
            return false
        } finally {
            setActionLoading(null)
        }
    }

    useEffect(() => {
        fetchLeaveTypes()
    }, [page, search, status])

    useEffect(() => {
        const handler = setTimeout(() => {
            setSearch(searchTerm)
            setPage(1)
        }, 400)

        return () => clearTimeout(handler)
    }, [searchTerm])

    return {
        leaveTypes,
        loading,
        error,
        refetch: fetchLeaveTypes,
        page,
        total,
        limit,
        setPage,
        search: searchTerm,
        setSearch: setSearchTerm,
        status,
        setStatus,
        deactivateLeaveType,
        actionLoading
    }
}

type LeavetypeForm = {
    name: string,
    defaultDays?: string,
}

export function useCreateLeavetypes() {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<null | string>(null)
    const [submitted, setSubmitted] = useState<boolean>(false)
    const [form, setForm] = useState<LeavetypeForm>({
        name: "",
        defaultDays: ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
        setError(null)
    }

    const createLeavetype = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSubmitted(false)

        try {
            await api.post('/leave-types', {
                name: form.name,
                defaultDays: form.defaultDays
            })

            alert('leave type created')
        } catch (error: any) {
            
        } finally {
            setLoading(false)
        }
    }

    return {
        loading,
        error,
        submitted,
        form,
        handleChange,
        createLeavetype
    }
}


type LeaveTypeEditForm = {
    name: string,
    defaultDays?: string,
}

export function useEditLeaveTypes({ refetch }: { refetch: () => void }) {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [leaveTypeId, setLeaveTypeId] = useState<string | null>(null)
    const [open, setOpen] = useState<boolean>(false)
    const [initialForm, setInitialForm] = useState<LeaveTypeEditForm | null>(null)
    const [form, setForm] = useState<LeaveTypeEditForm>({
        name: "",
        defaultDays: "",
    })

    const openEdit = (leaveType: any) => {
        setLeaveTypeId(leaveType._id)
        const initialData = {
            name: leaveType.name ?? "",
            defaultDays: leaveType.defaultDays ?? "",
        }

        setForm(initialData)
        setInitialForm(initialData)
        setOpen(true)
    }

    const closeEdit = () => {
        setOpen(false)
        setLeaveTypeId(null)
        setInitialForm(null)
        setError(null)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const submitEdit = async () => {

        if (!leaveTypeId) return

        if (initialForm && JSON.stringify(form) === JSON.stringify(initialForm)) {
            toast.info("No update data provided")
            return
        }
        setLoading(true)
        setError(null)

        const payload = {
            'name': form.name,
            'defaultDays': form.defaultDays,
        }

        try {
            await api.put(`leave-types/update/${leaveTypeId}`, payload)
            toast.success("Leave Type has been updated")
            refetch()
            closeEdit()
        } catch (err: any) {
            setError(err?.response?.data?.message || "Cannot edit Leave Type")
        } finally {
            setLoading(false)
        }
    }

    return {
        open,
        loading,
        error,
        form,
        openEdit,
        closeEdit,
        handleChange,
        submitEdit,
        setForm
    }
}

export function useApproveLeaves({ refetch }: { refetch: () => void }) {
    const [error, setError] = useState<null | string>(null)
    const [loading, setLoading] = useState<boolean>(false)

    const approveLeave = async (id: string) => {
        setLoading(true)
        setError(null)

        try {
            await api.patch(`/leaves/approve/${id}`)
            toast.success("Leave has been approved")
            refetch()
        } catch (error: any) {
            setError(error?.response?.data?.message || "Cannot approve leave")
        } finally {
            setLoading(false)
        }
    }

    return {
        error,
        loading,
        approveLeave
    }
}
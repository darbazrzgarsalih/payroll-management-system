import api from "@/app/services/api";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { downloadCSV } from "@/app/utils/export";

export type Overtime = {
    id?: string,
    enr: number
    payrollName: string
    employeeName: string,
    date: string,
    hours: number,
    rate: number,
    multiplier: number
    amount: number
    status: string,
}

export function useOvertimes() {
    const [page, setPage] = useState<number>(1)
    const [limit] = useState<number>(15)
    const [total, setTotal] = useState<number>(0)
    const [overtimes, setOvertimes] = useState<Overtime[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<null | string>(null)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [search, setSearch] = useState<string>("")
    const [status, setStatus] = useState<string>("")
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [exportLoading, setExportLoading] = useState<boolean>(false)
    const fetchOvertimes = async () => {
        setLoading(true)
        setError(null)

        try {
            const res = await api.get('/overtimes', {
                params: {
                    page, limit,
                    status: status && status !== "all_status" ? status : undefined,
                    name: search ? search.trim() : undefined,
                }
            })
            setOvertimes(res.data.overtimes)
            setTotal(res.data.total)
        } catch (error: any) {
            setError(error?.response?.data?.message || "Failed to fetch overtimes")
        } finally {
            setLoading(false)
        }
    }

    const voidOvertime = async (id: string) => {
        setActionLoading(id)
        setError(null)
        try {
            await api.patch(`/overtimes/void/${id}`)
            toast.success("Overtime has been voided")
            fetchOvertimes()
            return true
        } catch (error: any) {
            setError(error?.response?.data?.message || "Cannot void overtime")
            return false
        } finally {
            setActionLoading(null)
        }
    }

    useEffect(() => {
        fetchOvertimes()
    }, [page, search, status])

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
            const res = await api.get('/overtimes', {
                params: {
                    limit: 10000,
                    status: status && status !== "all_status" ? status : undefined,
                    name: search ? search.trim() : undefined,
                }
            })
            const allOvertimes = res.data.overtimes
            const headers = ["Payroll Run", "Employee Name", "Date", "Hours", "Rate", "Multiplier", "Amount", "Status"]
            const keys = ["payrollName", "employeeName", "date", "hours", "rate", "multiplier", "amount", "status"]
            downloadCSV(allOvertimes, `overtimes_export_${new Date().getTime()}.csv`, headers, keys)
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to export overtimes")
        } finally {
            setExportLoading(false)
        }
    }

    return {
        overtimes,
        loading,
        error,
        refetch: fetchOvertimes,
        limit,
        total,
        page,
        setPage,
        search: searchTerm,
        setSearch: setSearchTerm,
        status,
        setStatus,
        actionLoading,
        voidOvertime,
        exportData,
        exportLoading
    }
}

type OvertimeForm = {
    employeeID: string,
    payrollID: string
    date: string,
    hours: number,
    rate: number,
}


export function useCreateOvertimes() {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<null | string>(null)
    const [submitted, setSubmitted] = useState<boolean>(false)
    const [form, setForm] = useState<OvertimeForm>({
        employeeID: "",
        payrollID: "",
        date: "",
        hours: 0,
        rate: 0
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
        setError(null)
    }

    const createOvertime = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSubmitted(true)

        try {
            await api.post('/overtimes', {
                employeeID: form.employeeID,
                payrollID: form.payrollID,
                date: form.date,
                hours: form.hours,
                rate: form.rate
            })

            alert('overtime created')
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
        createOvertime,
    }
}


type OvertimeEditForm = {
    date: string,
    hours: number,
    rate: number,
}

export function useEditOvertimes({ refetch }: { refetch: () => void }) {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [overtimeId, setOvertimeId] = useState<string | null>(null)
    const [open, setOpen] = useState<boolean>(false)
    const [initialForm, setInitialForm] = useState<OvertimeEditForm | null>(null)
    const [form, setForm] = useState<OvertimeEditForm>({
        date: "",
        hours: 0,
        rate: 0,
    })

    const openEdit = (overtime: any) => {
        setOvertimeId(overtime._id)
        const initialData = {
            date: overtime.date ?? "",
            hours: overtime.hours ?? 0,
            rate: overtime.rate ?? 0,
        }

        setForm(initialData)
        setInitialForm(initialData)
        setOpen(true)
    }

    const closeEdit = () => {
        setOpen(false)
        setOvertimeId(null)
        setInitialForm(null)
        setError(null)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const submitEdit = async () => {

        if (!overtimeId) return

        if (initialForm && JSON.stringify(form) === JSON.stringify(initialForm)) {
            toast.info("No update data provided")
            return
        }
        setLoading(true)
        setError(null)

        const payload = {
            'date': form.date,
            'hours': form.hours,
            'rate': form.rate
        }

        try {
            await api.put(`/overtimes/update/${overtimeId}`, payload)
            toast.success("Overtime has been updated")
            refetch()
            closeEdit()
        } catch (err: any) {
            setError(err?.response?.data?.message || "Cannot edit Overtime")
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



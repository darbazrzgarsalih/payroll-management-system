import api from "@/app/services/api"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export type Deduction = {
    id?: string,
    enr: number
    name: string
    employeeName: string
    type: string
    startDate: string
    endDate: string
    totalAmount: number
    remainingAmount: number
    frequency: string
    status: string
}


export function useDeductions() {
    const [page, setPage] = useState<number>(1)
    const [limit] = useState<number>(15)
    const [total, setTotal] = useState<number>(0)
    const [deductions, setDeductions] = useState<Deduction[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [search, setSearch] = useState<string>("")
    const [status, setStatus] = useState<string>("")
    const [searchTerm, setSearchTerm] = useState<string>("")
    const fetchDeductions = async () => {
        setLoading(true)
        setError(null)

        try {
            const res = await api.get('/deductions', {
                params: {
                    page, limit,
                    status: status && status !== "all_status" ? status : undefined,
                    name: search ? search.trim() : undefined,
                }
            })
            setDeductions(res.data.deductions)
            setTotal(res.data.total)
        } catch (error: any) {
            setError(error?.response?.data?.message || "Could not fetch Deductions")
        } finally {
            setLoading(false)
        }
    }

    const voidDeduction = async (id: string) => {
        setActionLoading(id)
        setError(null)
        try {
            await api.patch(`/deductions/void/${id}`)
            toast.success("Deduction has been voided")
            fetchDeductions()
            return true
        } catch (error: any) {
            setError(error?.response?.data?.message || "Cannot void overtime")
            return false
        } finally {
            setActionLoading(null)
        }
    }

    useEffect(() => {
        fetchDeductions()
    }, [page, search, status])

    useEffect(() => {
        const handler = setTimeout(() => {
            setSearch(searchTerm)
            setPage(1)
        }, 400)
        return () => clearTimeout(handler)
    }, [searchTerm])

    return {
        deductions,
        loading,
        error,
        refetch: fetchDeductions,
        total,
        limit,
        page,
        setPage,
        actionLoading, 
        status,
        setStatus,
        search: searchTerm,
        setSearch: setSearchTerm,
        voidDeduction
    }
}

type DeductionForm = {
    employeeID: string,
    type: string,
    name: string,
    amount: number,
    frequency: string,
    startDate: string,
    endDate: string,
}

export function useCreateDeductions() {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<null | string>(null)
    const [submitted, setSubmitted] = useState<boolean>(false)
    const [form, setForm] = useState<DeductionForm>({
        employeeID: "",
        type: "",
        name: "",
        amount: 0,
        frequency: "",
        startDate: "",
        endDate: "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
        setError(null)
    }

    const createDeduction = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSubmitted(true)
        try {
            await api.post('/deductions', {
                employeeID: form.employeeID,
                type: form.type,
                name: form.name,
                amount: form.amount,
                frequency: form.frequency,
                startDate: form.startDate,
                endDate: form.endDate,
            })

            toast.success('Deduction has been created successfully')
        } catch (error) {
            
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
        createDeduction
    }
}

type DeductionEditForm = {
    type: string,
    name: string,
    amount: number,
    frequency: string,
    startDate: string,
    endDate: string,
}

export function useEditDeductions({ refetch }: { refetch: () => void }) {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [deductionId, setDeductionId] = useState<string | null>(null)
    const [open, setOpen] = useState<boolean>(false)
    const [initialForm, setInitialForm] = useState<DeductionEditForm | null>(null)
    const [form, setForm] = useState<DeductionEditForm>({
        type: "",
        name: "",
        amount: 0,
        frequency: "",
        startDate: "",
        endDate: "",
    })

    const openEdit = (deduction: any) => {
        setDeductionId(deduction._id)
        const initialData = {
            type: deduction.type ?? "",
            name: deduction.name ?? "",
            amount: deduction.amount ?? 0,
            frequency: deduction.frequency ?? "",
            startDate: deduction.startDate ?? "",
            endDate: deduction.endDate ?? "",
        }

        setForm(initialData)
        setInitialForm(initialData)
        setOpen(true)
    }

    const closeEdit = () => {
        setOpen(false)
        setDeductionId(null)
        setInitialForm(null)
        setError(null)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const submitEdit = async () => {

        if (!deductionId) return

        if (initialForm && JSON.stringify(form) === JSON.stringify(initialForm)) {
            toast.info("No update data provided")
            return
        }
        setLoading(true)
        setError(null)

        const payload = {
            'type': form.type,
            'name': form.name,
            'amount': form.amount,
            'frequency': form.frequency,
            'startDate': form.startDate,
            'endDate': form.endDate,
        }

        try {
            await api.put(`/deductions/update/${deductionId}`, payload)
            toast.success("Deduction has been updated")
            refetch()
            closeEdit()
        } catch (err: any) {
            setError(err?.response?.data?.message || "Cannot edit Deduction")
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



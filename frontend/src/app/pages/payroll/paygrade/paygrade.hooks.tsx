import api from "@/app/services/api"
import { useEffect, useState, useRef } from "react"
import { toast } from "sonner"

export type Paygrade = {
    id?: string,
    enr: number
    name: string,
    level: string,
    minSalary: number,
    maxSalary: number,
    currency: string,
    description: string
    status: string,
}

export function usePaygrades() {
    const [page, setPage] = useState<number>(1)
    const [limit] = useState<number>(15)
    const [total, setTotal] = useState<number>(0)
    const [paygrades, setPaygrades] = useState<Paygrade[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [status, setStatus] = useState<string>("")
    const [search, setSearch] = useState<string>("")
    const [searchTerm, setSearchTerm] = useState<string>("")
    const fetchPaygrades = async () => {
        setLoading(true)
        setError(null)

        try {
            const res = await api.get('/paygrades', {
                params: {
                    page, limit,
                    status: status && status !== "all_status" ? status : undefined,
                    name: search ? search.trim() : undefined,
                }
            })
            setPaygrades(res.data.paygrades)
            setTotal(res.data.total)
        } catch (error: any) {
            setError(error?.response?.data?.message || "Could not fetch Paygrades")
        } finally {
            setLoading(false)
        }
    }

    const deletePaygrade = async (id: string) => {
        setActionLoading(id)
        setError(null)
        try {
            await api.delete(`/paygrades/delete/${id}`)
            toast.success("Paygrade has been deleted")
            fetchPaygrades()
            return true
        } catch (error: any) {
            toast.error(error)
            return false
        } finally {
            setActionLoading(null)
        }
    }

    useEffect(() => {
        fetchPaygrades()
    }, [page, search, status])

    useEffect(() => {
        const handler = setTimeout(() => {
            setSearch(searchTerm)
            setPage(1)
        }, 400)
        return () => clearTimeout(handler)
    }, [searchTerm])

    return {
        paygrades,
        loading,
        error,
        refetch: fetchPaygrades,
        page,
        total,
        limit,
        setPage,
        actionLoading,
        deletePaygrade,
        status,
        setStatus,
        search: searchTerm,
        setSearch: setSearchTerm

    }
}


type PaygradeForm = {
    name: string,
    level: number,
    minSalary: number,
    maxSalary: number,
    currency: string
}

export function useCreatePaygrades() {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<null | string>(null)
    const [submitted, setSubmitted] = useState<boolean>(false)
    const [form, setForm] = useState<PaygradeForm>({
        name: "",
        level: 0,
        minSalary: 0,
        maxSalary: 0,
        currency: ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
        setError(null)
    }

    const createPaygrade = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSubmitted(true)
        try {
            await api.post('/paygrades', {
                name: form.name,
                level: form.level,
                minSalary: form.minSalary,
                maxSalary: form.maxSalary,
                currency: form.currency
            })

            toast.success("Paygrade has been created successfully")
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
        createPaygrade
    }
}

type PaygradeEditForm = {
    name: string,
    level: string,
    minSalary: number,
    maxSalary: number,
    currency: string
}

export function useEditPaygrades({ refetch }: { refetch: () => void }) {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [paygradeId, setPaygradeId] = useState<string | null>(null)
    const [open, setOpen] = useState<boolean>(false)
    const [initialForm, setInitialForm] = useState<PaygradeEditForm | null>(null)
    const [form, setForm] = useState<PaygradeEditForm>({
        name: "",
        level: "",
        minSalary: 0,
        maxSalary: 0,
        currency: ""
    })

    const openEdit = (paygrade: any) => {
        setPaygradeId(paygrade._id)
        const initialData = {
            name: paygrade.name ?? "",
            level: paygrade.level ?? "",
            minSalary: Number(paygrade.minSalary ?? 0),
            maxSalary: Number(paygrade.maxSalary ?? 0),
            currency: paygrade.currency ?? ""
        }

        setForm(initialData)
        setInitialForm(initialData)
        setOpen(true)
    }

    const closeEdit = () => {
        setOpen(false)
        setPaygradeId(null)
        setInitialForm(null)
        setError(null)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target

        if (name === 'minSalary' || name === 'maxSalary') {
            setForm(prev => ({
                ...prev,
                [name]: value === '' ? 0 : Number(value)
            }))
        } else {
            setForm(prev => ({ ...prev, [name]: value }))
        }
    }

    const submitEdit = async () => {


        if (!paygradeId) return

        if (initialForm && JSON.stringify(form) === JSON.stringify(initialForm)) {
            alert("NOOO")
            toast.info("No update dats provided")
            return
        }
        setLoading(true)
        setError(null)

        const payload = {
            'name': form.name,
            'level': form.level,
            'minSalary': form.minSalary,
            'maxSalary': form.maxSalary,
            'currency': form.currency
        }

        try {
            await api.put(`/paygrades/update/${paygradeId}`, payload)
            toast.success("Paygrade has been updated")
            refetch()
            closeEdit()
        } catch (err: any) {
            setError(err?.response?.data?.message || "Cannot edit Paygrade")
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



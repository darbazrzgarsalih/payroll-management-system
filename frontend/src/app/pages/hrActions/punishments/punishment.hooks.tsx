import api from "@/app/services/api"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export type Punishment = {
    id?: string
    enr: number
    name: string
    employeeName: string
    type: string
    frequency: string
    totalAmount: number
    remainingAmount: number
    startDate: string
    endDate: string
    status: string
}

export function usePunishments() {
    const [page, setPage] = useState<number>(1)
    const [limit] = useState<number>(15)
    const [total, setTotal] = useState<number>(0)
    const [punishments, setPunishments] = useState<Punishment[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<null | string>(null)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [search, setSearch] = useState<string>("")
    const [status, setStatus] = useState<string>("")
    const [searchTerm, setSearchTerm] = useState<string>("")

    const fetchPunishments = async () => {
        setLoading(true)
        setError(null)

        try {
            const res = await api.get('/punishments', {
                params: {
                    page, limit,
                    status: status && status !== "all_status" ? status : undefined,
                    name: search ? search.trim() : undefined,
                }
            })
            setPunishments(res.data.punishments)
            setTotal(res.data.total)
        } catch (error: any) {
            setError(error?.response?.data?.message || "Failed to fetch punishments")
        } finally {
            setLoading(false)
        }
    }

    const voidPunishment = async (id: string) => {
        setActionLoading(id)
        setError(null)
        try {
            await api.patch(`/punishments/void/${id}`)
            toast.success("Punishment has been voided")
            fetchPunishments()
            return true
        } catch (err: any) {
            setError(err?.response?.data?.message || "Cannot void punishment")
            return false
        } finally {
            setActionLoading(null)
        }
    }

    useEffect(() => {
        fetchPunishments()
    }, [page, search, status])

    useEffect(() => {
        const handler = setTimeout(() => {
            setSearch(searchTerm)
            setPage(1)
        }, 400)

        return () => clearTimeout(handler)
    }, [searchTerm])

    return {
        punishments,
        loading,
        error,
        refetch: fetchPunishments,
        page,
        total,
        limit,
        setPage,
        search: searchTerm,
        setSearch: setSearchTerm,
        status,
        setStatus,
        voidPunishment,
        actionLoading
    }
}

type PunishmentForm = {
    employeeID: string,
    name: string,
    type: string,
    amount: number,
    startDate: string,
    endDate: string
}

export function useCreatePunishments() {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<null | string>(null)
    const [submitted, setSubmitted] = useState<boolean>(false)
    const [form, setForm] = useState<PunishmentForm>({
        employeeID: "",
        name: "",
        type: "",
        amount: 0,
        startDate: "",
        endDate: ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const createPunishment = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSubmitted(true)

        try {

            await api.post('/punishments', {
                employeeID: form.employeeID,
                name: form.name,
                type: form.type,
                amount: form.amount,
                startDate: form.startDate,
                endDate: form.endDate
            })
            toast.success('Punishment has been created successfully')
            setForm({ employeeID: "", name: "", type: "", amount: 0, startDate: "", endDate: "" })
            setSubmitted(false)
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to create punishment')
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
        createPunishment
    }
}

type PunishmentEditForm = {
    name: string
    type: string
    frequency: string
    startDate: string
    endDate: string
}


export function useEditPunishments({ refetch }: { refetch: () => void }) {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [punishmentId, setPunishmentId] = useState<string | null>(null)
    const [open, setOpen] = useState<boolean>(false)
    const [initialForm, setInitialForm] = useState<PunishmentEditForm | null>(null)
    const [form, setForm] = useState<PunishmentEditForm>({
        name: "",
        type: "",
        frequency: "",
        startDate: "",
        endDate: "",
    })

    const openEdit = (punishment: any) => {
        setPunishmentId(punishment.id)
        const initialData = {
            name: form.name ?? "",
            type: form.type ?? "",
            frequency: form.frequency ?? "",
            startDate: form.startDate ?? "",
            endDate: form.endDate ?? "",
        }

        setForm(initialData)
        setOpen(true)
        setInitialForm(initialData)
    }

    const closeEdit = () => {
        setOpen(false)
        setError(null)
        setInitialForm(null)
        setPunishmentId(null)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const submitEdit = async () => {
        if (!punishmentId) return
        if (initialForm && JSON.stringify(form) === JSON.stringify(initialForm)) {
            toast.info("No update dats provided")
            return
        }
        setLoading(true)
        setError(null)

        const payload = {
            'name': form.name,
            'type': form.type,
            'frequency': form.frequency,
            'startDate': form.startDate,
            'endDate': form.endDate,
        }

        try {
            await api.put(`/punishments/update/${punishmentId}`, payload)
            toast.success("punishmenty updated")
            closeEdit()
            refetch()
        } catch (err: any) {
            setError(err?.response?.data?.message || "Cannot edit punishment")
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
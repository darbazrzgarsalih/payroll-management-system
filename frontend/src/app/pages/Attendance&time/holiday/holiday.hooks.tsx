import api from "@/app/services/api"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export type Holiday = {
    _id: string
    name: string
    date: string
    type: string
    isRecurring: boolean
    isPaid: boolean
    description?: string
    createdBy?: { username: string }
}


export function useHolidays() {
    const [page, setPage] = useState(1)
    const [limit] = useState(15)
    const [total, setTotal] = useState(0)
    const [holidays, setHolidays] = useState<Holiday[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [month, setMonth] = useState("")
    const [year, setYear] = useState(String(new Date().getFullYear()))

    const fetchHolidays = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await api.get("/holidays", {
                params: { page, limit, month: month || undefined, year: year || undefined }
            })
            setHolidays(res.data.holidays || [])
            setTotal(res.data.total || 0)
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to fetch holidays")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchHolidays() }, [page, month, year])

    return { holidays, loading, error, refetch: fetchHolidays, page, limit, total, setPage, month, setMonth, year, setYear }
}


type HolidayForm = {
    name: string; date: string; type: string; isRecurring: boolean; isPaid: boolean; description: string
}

const emptyForm: HolidayForm = { name: "", date: "", type: "public", isRecurring: false, isPaid: true, description: "" }

export function useCreateHoliday({ refetch }: { refetch: () => void }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [form, setForm] = useState<HolidayForm>(emptyForm)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        setForm(prev => ({ ...prev, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value }))
        setError(null)
    }

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await api.post("/holidays", form)
            toast.success("Holiday created")
            setForm(emptyForm)
            setOpen(false)
            refetch()
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Failed to create holiday"
            setError(msg)
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    return { open, setOpen, loading, error, form, handleChange, submit }
}


export function useEditHoliday({ refetch }: { refetch: () => void }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [id, setId] = useState<string | null>(null)
    const [form, setForm] = useState<HolidayForm>(emptyForm)

    const openEdit = (holiday: Holiday) => {
        setId(holiday._id)
        setForm({
            name: holiday.name,
            date: holiday.date?.split("T")[0] ?? "",
            type: holiday.type ?? "public",
            isRecurring: holiday.isRecurring ?? false,
            isPaid: holiday.isPaid ?? true,
            description: holiday.description ?? "",
        })
        setOpen(true)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        setForm(prev => ({ ...prev, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value }))
        setError(null)
    }

    const submit = async () => {
        if (!id) return
        setLoading(true)
        setError(null)
        try {
            await api.put(`/holidays/${id}`, form)
            toast.success("Holiday updated")
            setOpen(false)
            refetch()
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Failed to update holiday"
            setError(msg)
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    return { open, setOpen, loading, error, form, handleChange, submit, openEdit }
}


export function useDeleteHoliday({ refetch }: { refetch: () => void }) {
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const deleteHoliday = async (id: string) => {
        setLoadingId(id)
        try {
            await api.delete(`/holidays/${id}`)
            toast.success("Holiday deleted")
            refetch()
            return true
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to delete holiday")
            return false
        } finally {
            setLoadingId(null)
        }
    }

    return { deleteHoliday, loadingId }
}

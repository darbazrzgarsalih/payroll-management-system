import api from "@/app/services/api"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export type Position = {
    _id?: string
    id?: string
    enr?: number
    title: string
    department: string
    level: string
    description: string
    status: string
    createdBy?: string
    updatedBy?: string
}

export type PositionForm = {
    title: string
    departmentID: string
    level: string
    description: string
}

export function usePositions() {
    const [page, setPage] = useState<number>(1)
    const [limit] = useState<number>(15)
    const [total, setTotal] = useState<number>(0)
    const [positions, setPositions] = useState<Position[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [status, setStatus] = useState<string>("")
    const [search, setSearch] = useState<string>("")
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const fetchPositions = async () => {
        setLoading(true)
        setError(null)



        try {
            const res = await api.get('/positions', {
                params: { page, limit, status: (status && status !== "all_status") ? status : undefined, title: search || undefined }
            })
            setPositions(res.data.positions)
            setTotal(res.data.total)
        } catch (error: any) {
            setError(error?.response?.data?.message || "Could not fetch positions")
        } finally {
            setLoading(false)
        }
    }

    const deletePosition = async (id: any) => {
        setActionLoading(id)
        setError(null)
        try {
            await api.delete(`/positions/delete/${id}`)
            toast.success("Position has been deleted")
            fetchPositions()
            return true
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Cannot delete department")
            return false
        } finally {
            setActionLoading(null)
        }
    }

    useEffect(() => {
        fetchPositions()
        setPage(1)
    }, [page, status, search])

    return {
        positions,
        loading,
        error,
        refetch: fetchPositions,
        total,
        limit,
        page,
        setPage,
        status,
        setStatus,
        search,
        setSearch,
        deletePosition,
        actionLoading
    }
}

export function useCreatePosition() {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [submitted, setSubmitted] = useState<boolean>(false)
    const [open, setOpen] = useState<boolean>(false)

    const [form, setForm] = useState<PositionForm>({
        title: "",
        departmentID: "",
        level: "",
        description: ""
    })

    const [departments, setDepartments] = useState<{ _id: string; id?: string; name: string }[]>([])

    useEffect(() => {
        api.get('/departments').then(res => {
            setDepartments(res.data.departments || [])
        }).catch(() => {
            toast.error("Failed to fetch departments")
        })
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setForm(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const validateForm = (): boolean => {
        const requiredFields = ['title', 'departmentID', 'level'] as const
        return requiredFields.every(field => form[field] !== '')
    }

    const resetForm = () => {
        setForm({
            title: "",
            departmentID: "",
            level: "",
            description: ""
        })
        setSubmitted(false)
        setError(null)
    }

    const createPosition = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitted(true)

        if (!validateForm()) {
            setError("Please fill in all required fields")
            return
        }

        setLoading(true)
        setError(null)

        try {
            await api.post('/positions', {
                title: form.title,
                departmentID: form.departmentID,
                level: form.level,
                description: form.description || undefined
            })

            setOpen(false)
            resetForm()
            toast.success('Position has been created successfully')
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to create position"
            setError(errorMessage)
            console.error("Creation error:", errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return {
        createPosition,
        loading,
        error,
        setForm,
        form,
        handleChange,
        handleSelectChange,
        submitted,
        open,
        setOpen,
        resetForm,
        departments
    }
}

type PositionEditForm = {
    title: string,
    level: string,
    department: string,
    description: string,
    status: string
}

export function useEditPositions({ refetch }: { refetch: () => void }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [open, setOpen] = useState(false)
    const [positionId, setPositionId] = useState<string | null>(null)
    const [initialForm, setInitialForm] = useState<PositionEditForm | null>(null)
    const [departments, setDepartments] = useState<{ _id: string; id?: string; name: string }[]>([])

    const [form, setForm] = useState<PositionEditForm>({
        title: "",
        level: "",
        department: "",
        description: "",
        status: ""
    })

    useEffect(() => {
        if (open) {
            api.get('/departments').then(res => {
                setDepartments(res.data.departments || [])
            }).catch(() => {
                toast.error("Failed to fetch departments")
            })
        }
    }, [open])

    const openEdit = (position: any) => {
        setPositionId(position.id)
        const initialData = {
            title: position.title || "",
            level: position.level || "",
            department: position.department || "",
            description: position.description || "",
            status: position.status || ""
        }
        setForm(initialData)
        setInitialForm(initialData)
        setOpen(true)
    }

    const closeEdit = () => {
        setOpen(false)
        setPositionId(null)
        setInitialForm(null)
        setError(null)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setForm(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const submitEdit = async () => {
        if (!positionId) return
        if (initialForm && JSON.stringify(form) === JSON.stringify(initialForm)) {
            toast.info("No update data provided")
            return
        }
        setLoading(true)
        setError(null)

        const payload = {
            'title': form.title,
            'level': form.level,
            'department': form.department,
            'description': form.description,
            status: form.status
        }

        try {
            await api.put(`/positions/update/${positionId}`, payload)
            toast.success("Position updated successfully")
            refetch()
            closeEdit()
        } catch (err: any) {
            setError(err?.response?.data?.message || "Cannot edit position")
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
        handleSelectChange,
        submitEdit,
        setForm,
        departments
    }
}
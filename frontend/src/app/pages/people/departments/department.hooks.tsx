import api from "@/app/services/api"
import React, { useEffect, useState } from "react"
import { toast } from "sonner"

export type Department = {
    _id?: string
    id?: string
    name: string
    budget: string | number
    status: string
}

export type DepartmentForm = {
    name: string
    budget: string
}

export function useDepartments() {
    const [page, setPage] = useState<number>(1)
    const [limit] = useState<number>(10)
    const [total, setTotal] = useState<number>(0)
    const [departments, setDepartments] = useState<Department[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [status, setStatus] = useState<string>("")
    const [search, setSearch] = useState<string>("")
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const fetchDepartments = async () => {
        setLoading(true)
        setError(null)

        try {
            const res = await api.get('/departments', {
                params: { page, limit, search, status }
            })
            setDepartments(res.data.departments)
            setTotal(res.data.total)
        } catch (error: any) {
            setError(error?.response?.data?.message || "Could not fetch departments")
        } finally {
            setLoading(false)
        }
    }

    const deleteDepartment = async (id: string) => {
        setActionLoading(id)
        setError(null)
        try {
            await api.delete(`/departments/delete/${id}`)
            toast.success("Department deleted successfutly")
            fetchDepartments()
            return true
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Cannot delete department")
            return false
        } finally {
            setActionLoading(null)
        }
    }

    useEffect(() => {
        fetchDepartments()
    }, [page, search, status])

    return {
        departments,
        loading,
        error,
        refetch: fetchDepartments,
        page,
        limit,
        total,
        setPage,
        search,
        setSearch,
        status,
        setStatus,
        deleteDepartment,
        actionLoading
    }
}

export function useCreateDepartment() {
    const [submitted, setSubmitted] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [open, setOpen] = useState<boolean>(false)

    const [form, setForm] = useState<DepartmentForm>({
        name: "",
        budget: ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const validateForm = (): boolean => {
        const requiredFields = ['name', 'budget'] as const
        return requiredFields.every(field => form[field] !== '')
    }

    const resetForm = () => {
        setForm({
            name: "",
            budget: ""
        })
        setSubmitted(false)
        setError(null)
    }

    const createDepartment = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitted(true)

        if (!validateForm()) {
            setError("Please fill in all required fields")
            return
        }

        setLoading(true)
        setError(null)

        try {
            await api.post('/departments', {
                name: form.name,
                budget: parseFloat(form.budget)
            })

            setOpen(false)
            resetForm()
            toast.success('Department has been created successfully')
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to create department"
            setError(errorMessage)
            console.error("Creation error:", errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return {
        handleChange,
        createDepartment,
        submitted,
        form,
        loading,
        error,
        setForm,
        open,
        setOpen,
        resetForm
    }
}

export type DepartmentEditForm = {
    name: string
    budget: string
}

export function useEditDepartment({ refetch }: { refetch: () => void }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [open, setOpen] = useState(false)
    const [departmentId, setDepartmentId] = useState<string | null>(null)
    const [initialForm, setInitialForm] = useState<DepartmentEditForm | null>(null)

    const [form, setForm] = useState<DepartmentEditForm>({
        name: "",
        budget: ""
    })

    const openEdit = (department: any) => {
        setDepartmentId(department.id)
        const initialData = {
            name: department.name ?? "",
            budget: department.budget ?? ""
        }
        setForm(initialData)
        setInitialForm(initialData)
        setOpen(true)
    }

    const closeEdit = () => {
        setOpen(false)
        setDepartmentId(null)
        setInitialForm(null)
        setError(null)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const submitEdit = async () => {
        if (!departmentId) return
        if (initialForm && JSON.stringify(form) === JSON.stringify(initialForm)) {
            toast.info("No update dats provided")
            return
        }
        setLoading(true)
        setError(null)

        const payload = {
            'name': form.name,
            'budget': form.budget
        }

        try {
            await api.put(`/departments/update/${departmentId}`, payload)
            toast.success("Department UPDARTED")
            refetch()
            closeEdit()
        } catch (err: any) {
            setError(err?.response?.data?.message || "Cannot edit department")
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
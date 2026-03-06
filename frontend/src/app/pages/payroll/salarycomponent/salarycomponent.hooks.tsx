import api from "@/app/services/api"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export type SalaryComponent = {
    id?: string,
    enr: number
    name: string,
    description: string,
    type: string,
    category: string,
    effectiveFrom: string
    applicableFor: string
    status: string,
}

export function useSalaryComponents() {
    const [salaryComponents, setSalaryComponents] = useState<SalaryComponent[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [total, setTotal] = useState<number>(0)
    const [page, setPage] = useState<number>(1)
    const [limit] = useState<number>(15)
    const [status, setStatus] = useState<string>("")
    const [search, setSearch] = useState<string>("")
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const fetchSalaryComponents = async () => {
        setLoading(true)
        setError(null)

        try {
            const res = await api.get('/salary-components', {
                params: { page, limit,
                    status: status && status !== "all_status" ? status : undefined,
                    name: search ? search.trim() : undefined
                 }
            })
            setSalaryComponents(res.data.salaryComponents)
            setTotal(res.data.total)
        } catch (error: any) {
            setError(error?.response?.data?.message || "Could not fetch SalaryComponents")
        } finally {
            setLoading(false)
        }
    }

    const deactivateSalaryComponent = async (id: string) => {
        setActionLoading(id)
        setError(null)
        try {
            await api.patch(`/salary-components/deactivate/${id}`)
            toast.success("Salary component deactivated")
            fetchSalaryComponents()
            return true
        } catch (err: any) {
            setError(err?.response?.data?.message || "Cannot deactivate salary component")
            return false
        } finally {
            setActionLoading(null)
        }
    }

    useEffect(() => {
        fetchSalaryComponents()
    }, [page,  search, status])


    useEffect(() => {
        const handler = setTimeout(() => {
            setSearch(searchTerm)
            setPage(1)
        }, 400)

        return () => clearTimeout(handler)
    }, [searchTerm])

    return {
        salaryComponents,
        loading,
        error,
        refetch: fetchSalaryComponents,
        page,
        limit,
        total,
        setPage,
        search: searchTerm,
        setSearch: setSearchTerm,
        status,
        setStatus,
        deactivateSalaryComponent,
        actionLoading
    }
}

type SalaryComponentForm = {
    payGradeID: string,
    name: string,
    effectiveFrom: string
}

export function useCreateSalaryComponents() {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<null | string>(null)
    const [submitted, setSubmitted] = useState<boolean>(false)
    const [form, setForm] = useState<SalaryComponentForm>({
        payGradeID: "",
        name: "",
        effectiveFrom: ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
        setError(null)
    }

    const createSalaryComponent = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSubmitted(false)

        try {
            await api.post('/salary-components', {
                payGradeID: form.payGradeID,
                name: form.name,
                effectiveFrom: form.effectiveFrom
            })

            toast.success("Salary component has been created successfully")
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
        createSalaryComponent,
    }
}

type SalaryComponentEditForm = {
    name: string,
    description: string,
    type: string,
    category: string,
    effectiveFrom: string
    applicableFor: string
}

export function useEditSalaryComponents({ refetch }: { refetch: () => void }) {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<null | string>(null)
    const [salaryComponentId, setSalaryComponentId] = useState<string | null>(null)
    const [open, setOpen] = useState<boolean>(false)
    const [initialForm, setInitialForm] = useState<SalaryComponentEditForm | null>(null)
    const [form, setForm] = useState<SalaryComponentEditForm>({
        name: "",
        description: "",
        type: "",
        category: "",
        effectiveFrom: "",
        applicableFor: ""
    })

    const openEdit = (salarycomponent: any) => {
        setSalaryComponentId(salarycomponent.id)

        const initialData = {
            name: salarycomponent.name ?? "",
            description: salarycomponent.description ?? "",
            type: salarycomponent.type ?? "",
            category: salarycomponent.category ?? "",
            effectiveFrom: salarycomponent.effectiveFrom ?? "",
            applicableFor: salarycomponent.applicableFor ?? ""
        }

        setForm(initialData)
        setInitialForm(initialData)
        setOpen(true)
    }

    const closeEdit = () => {
        setOpen(false)
        setSalaryComponentId(null)
        setInitialForm(null)
        setError(null)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const submitEdit = async () => {
        if(!salaryComponentId) return
        if(initialForm && JSON.stringify(form) === JSON.stringify(initialForm)) {
            toast.info("No update data provided")
            return
        }

        setLoading(true)
        setError(null)

        const payload = {
            'name': form.name,
            'description': form.description,
            'type': form.type,
            'category': form.category,
            'effectiveFrom': form.effectiveFrom,
            'applicableFor': form.applicableFor,
        }

        try {
            await api.put(`/salary-components/update/${salaryComponentId}`, payload)
            toast.success("Salary comronent updated")
            refetch()
            closeEdit()
        } catch (err: any) {
            setError(err?.response?.data?.message || "Cannot edit salary component")
        }finally {
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
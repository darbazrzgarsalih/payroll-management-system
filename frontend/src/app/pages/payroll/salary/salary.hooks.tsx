import api from "@/app/services/api"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export type Salary = {
    id?: string,
    enr: number,
    employeeName: string
    salaryType: string
    amount: string
    currency: string
    effectiveDate: string
    endDate: string
    payGrade: string
    status: string,
    createdBy: string
}

export function useSalaries() {
    const [page, setPage] = useState<number>(1)
    const [limit] = useState<number>(1)
    const [total, setTotal] = useState<number>(0)
    const [salaries, setSalaries] = useState<Salary[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [search, setSearch] = useState<string>("")
    const [status, setStatus] = useState<string>("")
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const fetchSalaries = async () => {
        setLoading(true)
        setError(null)

        try {
            const res = await api.get('/salaries', {
                params: {
                    page, limit,
                    status: status && status !== "all_status" ? status : undefined,
                    employeeID: search ? search.trim() : undefined,
                }
            })
            setSalaries(res.data.salaries)
            setTotal(res.data.total)
        } catch (error: any) {
            setError(error?.response?.data?.message || "Could not fetch salaries")
        } finally {
            setLoading(false)
        }
    }

    const deleteSalary = async (id: string) => {
        setActionLoading(id)
        setError(null)
        try {
            await api.delete(`/salaries/delete/${id}`)
            toast.success("Salary has been deleted")
            fetchSalaries()
            return true
        } catch (error: any) {
            setError(error?.response?.data?.message || "Cannot void punishment")
            return false
        } finally {
            setActionLoading(null)
        }
    }



    useEffect(() => {
        fetchSalaries()
    }, [page, search, status])

    useEffect(() => {
        const handler = setTimeout(() => {
            setSearch(searchTerm)
            setPage(1)
        }, 400)
        return () => clearTimeout(handler)
    }, [searchTerm])

    return {
        salaries,
        loading,
        error,
        refetch: fetchSalaries,
        page,
        total,
        limit,
        setPage,
        status,
        setStatus,
        search: searchTerm,
        setSearch: setSearchTerm,
        actionLoading,
        deleteSalary
    }
}

type SalaryForm = {
    employeeID: string,
    salaryType: string,
    amount: number,
    currency: string,
    effectiveDate: string,
    payGradeID: string
}

export function useCreateSalaries() {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<null | string>(null)
    const [submitted, setSubmitted] = useState<boolean>(false)
    const [form, setForm] = useState<SalaryForm>({
        employeeID: "",
        salaryType: "",
        amount: 0,
        currency: "USD",
        effectiveDate: "",
        payGradeID: ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
        setError(null)
    }

    const createSalary = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSubmitted(false)

        try {
            await api.post('/salaries', {
                employeeID: form.employeeID,
                salaryType: form.salaryType,
                amount: form.amount,
                currency: "USD",
                effectiveDate: form.effectiveDate,
                payGradeID: form.payGradeID
            })

            toast.success("Salary has been created successfully")
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
        createSalary
    }
}


type SalaryEditForm = {
    salaryType: string
    amount: string
    effectiveDate: string
    endDate: string
}

export function useEditSalaries({ refetch }: { refetch: () => void }) {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [SalaryId, setSalaryId] = useState<string | null>(null)
    const [open, setOpen] = useState<boolean>(false)
    const [initialForm, setInitialForm] = useState<SalaryEditForm | null>(null)
    const [form, setForm] = useState<SalaryEditForm>({
        salaryType: "",
        amount: "",
        effectiveDate: "",
        endDate: "",
    })

    const openEdit = (Salary: any) => {
        setSalaryId(Salary.id)
        const initialData = {
            salaryType: form.salaryType ?? "",
            amount: form.amount ?? "",
            effectiveDate: form.effectiveDate ?? "",
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
        setSalaryId(null)
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
        if (!SalaryId) return
        if (initialForm && JSON.stringify(form) === JSON.stringify(initialForm)) {
            toast.info("No update dats provided")
            return
        }
        setLoading(true)
        setError(null)

        const payload = {
            'salaryType': form.salaryType,
            'amount': form.amount,
            'effectiveDate': form.effectiveDate,
            'endDate': form.endDate
        }

        try {
            await api.put(`/salaries/update/${SalaryId}`, payload)
            toast.success("Salary has been updated")
            closeEdit()
            refetch()
        } catch (err: any) {
            setError(err?.response?.data?.message || "Cannot edit Salary")
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
        setForm
    }
}
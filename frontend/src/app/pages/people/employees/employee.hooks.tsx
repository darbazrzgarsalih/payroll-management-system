import { useEffect, useState } from "react"
import api from "@/app/services/api"
import { toast } from "sonner"
import { downloadCSV } from "@/app/utils/export"

export type Employee = {
    id?: string
    enr: number
    employeeName: string
    employeeCode: string
    email: string
    avatar?: string
    gender: string
    phone: string
    department: string
    position: string
    status: string
    address: {
        country: string
        city: string
        street?: string
        state?: string
        zipCode?: string
    }
    dateOfBirth?: string
    hireDate?: string
    terminationDate?: string
    employmentType?: string
    workSchedule?: string
    departmentID?: string
    positionID?: string
    managerID?: string
}

export type EmployeeForm = {
    firstName: string
    middleName?: string
    lastName: string
    dateOfBirth: string
    phone: string
    email: string
    gender: string
    hireDate: string
    employeeCode?: string
    shiftId: string
    createAccount: boolean
    username?: string
    password?: string
    role?: string
    departmentID: string
    positionID: string
    city: string
    country: string
}

export function useEmployees() {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [page, setPage] = useState<number>(1)
    const [limit] = useState<number>(10)
    const [total, setTotal] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [status, setStatus] = useState<string>("")
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [search, setSearch] = useState<string>("")
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [exportLoading, setExportLoading] = useState<boolean>(false)

    useEffect(() => {
        const handler = setTimeout(() => {
            setSearch(searchTerm)
        }, 500)

        return () => clearTimeout(handler)
    }, [searchTerm])

    const fetchEmployees = async () => {
        setLoading(true)
        setError(null)

        try {
            const res = await api.get('/employees', {
                params: {
                    page,
                    limit,
                    status: (status && status !== "all_status") ? status : undefined,
                    search: search || undefined
                }
            })
            setEmployees(res.data.employees)
            setTotal(res.data.total)
        } catch (error: any) {
            setError(error?.response?.data?.message || "Could not fetch employees")
        } finally {
            setLoading(false)
        }
    }



    const terminateEmployee = async (id: string) => {
        setActionLoading(id)
        setError(null)

        try {
            await api.put(`/employees/terminate/${id}`)
            toast.success("Employee deactivated successfully")
            fetchEmployees()
            return true
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Cannot deactivate employee")
            return false
        } finally {
            setActionLoading(null)
        }
    }

    const deleteEmployee = async (id: string) => {
        setActionLoading(id)
        setError(null)

        try {
            await api.delete(`/employees/delete/${id}`)
            toast.success("Employee deleted successfully")
            fetchEmployees()
            return true
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Cannot delete employee")
            return false
        } finally {
            setActionLoading(null)
        }
    }


    useEffect(() => {
        fetchEmployees()
    }, [page, status, search])

    const exportData = async () => {
        setExportLoading(true)
        try {
            const res = await api.get('/employees', {
                params: {
                    limit: 10000,
                    status: (status && status !== "all_status") ? status : undefined,
                    search: search || undefined
                }
            })
            const allEmployees = res.data.employees
            const headers = ["ID", "Name", "Email", "Phone", "Gender", "Department", "Position", "Status"]
            const keys = ["employeeCode", "employeeName", "email", "phone", "gender", "department", "position", "status"]
            downloadCSV(allEmployees, `employees_export_${new Date().getTime()}.csv`, headers, keys)
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to export employees")
        } finally {
            setExportLoading(false)
        }
    }

    return {
        employees,
        loading,
        error,
        refetch: fetchEmployees,
        page,
        setPage,
        total,
        limit,
        status,
        setStatus,
        search: searchTerm,
        setSearch: setSearchTerm,
        terminateEmployee,
        deleteEmployee,
        actionLoading,
        exportData,
        exportLoading
    }
}

export const useCreateEmployee = () => {
    const [loading, setLoading] = useState<boolean>(false)
    const [submitted, setSubmitted] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [open, setOpen] = useState<boolean>(false)

    const [form, setForm] = useState<EmployeeForm>({
        employeeCode: "",
        firstName: "",
        middleName: "",
        lastName: "",
        dateOfBirth: "",
        phone: "",
        email: "",
        gender: "",
        hireDate: "",
        shiftId: "",
        createAccount: false,
        username: "",
        password: "",
        role: "",
        departmentID: "",
        positionID: "",
        city: "",
        country: "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAvatarFile(e.target.files[0])
        }
    }

    const handleSelectChange = (name: string, value: string) => {
        setForm(prev => ({
            ...prev,
            [name]: value,
        }))
    }

    const validateForm = (): boolean => {
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'gender'] as const
        return requiredFields.every(field => (form[field as keyof EmployeeForm] || "").toString().trim() !== '')
    }

    const resetForm = () => {
        setForm({
            employeeCode: "",
            firstName: "",
            middleName: "",
            lastName: "",
            dateOfBirth: "",
            phone: "",
            email: "",
            gender: "",
            hireDate: "",
            shiftId: "",
            createAccount: false,
            username: "",
            password: "",
            role: "",
            departmentID: "",
            positionID: "",
            city: "",
            country: "",
        })
        setAvatarFile(null)
        setSubmitted(false)
        setError(null)
    }

    const createEmployee = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitted(true)

        if (!validateForm()) {
            setError("Please fill in all required fields")
            return
        }

        setLoading(true)
        setError(null)

        try {
            const formData = new FormData()
            if (form.employeeCode) formData.append('employeeCode', form.employeeCode)
            if (form.firstName) formData.append('firstName', form.firstName)
            if (form.middleName) formData.append('middleName', form.middleName)
            if (form.lastName) formData.append('lastName', form.lastName)
            if (form.dateOfBirth) formData.append('dateOfBirth', form.dateOfBirth)
            if (form.gender) formData.append('gender', form.gender)
            if (form.phone) formData.append('phone', form.phone)
            if (form.email) formData.append('email', form.email)
            if (form.hireDate) formData.append('hireDate', form.hireDate)
            if (form.shiftId) formData.append('shiftId', form.shiftId)
            if (form.departmentID) formData.append('employmentInfo.departmentID', form.departmentID)
            if (form.positionID) formData.append('employmentInfo.positionID', form.positionID)
            if (form.city) formData.append('personalInfo.address.city', form.city)
            if (form.country) formData.append('personalInfo.address.country', form.country)

            // Note: form.createAccount is boolean, need to convert to string representation
            formData.append('createAccount', form.createAccount ? 'true' : 'false')

            if (form.createAccount) {
                if (form.username) formData.append('username', form.username)
                if (form.password) formData.append('password', form.password)
                if (form.role) formData.append('role', form.role)
            }
            if (avatarFile) formData.append('avatar', avatarFile)

            await api.post('/employees/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            setOpen(false)
            resetForm()
            toast.success("Employee has been created successfully")
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to create employee"
            setError(errorMessage)
            console.error("Creation error:", errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return {
        createEmployee,
        loading,
        error,
        handleChange,
        handleFileChange,
        avatarFile,
        setAvatarFile,
        form,
        setForm,
        submitted,
        open,
        setOpen,
        resetForm,
        handleSelectChange
    }
}




type EmployeeEditForm = {
    firstName: string
    middleName: string
    lastName: string
    email: string
    gender: string
    street?: string
    city: string
    country: string
    departmentID: string
    positionID: string
    status: string
    phone: string
    role: string
}

export function useEditEmployee({ refetch }: { refetch: () => void }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [open, setOpen] = useState(false)
    const [employeeId, setEmployeeId] = useState<string | null>(null)
    const [initialForm, setInitialForm] = useState<EmployeeEditForm | null>(null)

    const [form, setForm] = useState<EmployeeEditForm>({
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        gender: "",
        street: "",
        city: "",
        country: "",
        departmentID: "",
        positionID: "",
        status: "",
        phone: "",
        role: ""
    })

    const openEdit = (employee: any) => {
        setEmployeeId(employee.id)
        const initialData = {
            firstName: employee.firstName ?? "",
            middleName: employee.middleName ?? "",
            lastName: employee.lastName ?? "",
            email: employee.email ?? "",
            gender: employee.gender ?? "Male",
            street: employee.address?.street ?? "",
            city: employee.address?.city ?? "",
            country: employee.address?.country ?? "",
            departmentID: employee.departmentID ?? "",
            positionID: employee.positionID ?? "",
            status: employee.status ?? "active",
            phone: employee.phone ?? "",
            role: employee.role ?? "employee"
        }
        setForm(initialData)
        setInitialForm(initialData)
        setOpen(true)
    }

    const closeEdit = () => {
        setOpen(false)
        setEmployeeId(null)
        setInitialForm(null)
        setError(null)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAvatarFile(e.target.files[0])
        }
    }

    const submitEdit = async () => {
        if (!employeeId) return

        if (initialForm && JSON.stringify(form) === JSON.stringify(initialForm)) {
            toast.info("no update data provided")
            return
        }

        setLoading(true)
        setError(null)

        const formData = new FormData()
        if (form.firstName) formData.append('personalInfo.firstName', form.firstName)
        if (form.middleName) formData.append('personalInfo.middleName', form.middleName)
        if (form.lastName) formData.append('personalInfo.lastName', form.lastName)
        if (form.email) formData.append('personalInfo.email', form.email)
        if (form.gender) formData.append('personalInfo.gender', form.gender)
        if (form.phone) formData.append('personalInfo.phone', form.phone)
        if (form.street) formData.append('personalInfo.address.street', form.street)
        if (form.city) formData.append('personalInfo.address.city', form.city)
        if (form.country) formData.append('personalInfo.address.country', form.country)
        if (form.status) formData.append('employmentInfo.status', form.status)
        if (form.departmentID) formData.append('employmentInfo.departmentID', form.departmentID)
        if (form.positionID) formData.append('employmentInfo.positionID', form.positionID)
        if (form.role) formData.append('role', form.role)
        if (avatarFile) formData.append('avatar', avatarFile)

        try {
            await api.put(`/employees/update/${employeeId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            toast.success("Employee updated successfully")
            refetch()
            closeEdit()
        } catch (err: any) {
            setError(err?.response?.data?.message || "Cannot edit employee")
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
        handleFileChange,
        avatarFile,
        setAvatarFile,
        submitEdit,
        setForm
    }
}

export function useEmployee(id: string | undefined) {
    const [employee, setEmployee] = useState<any>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const fetchEmployee = async () => {
        if (!id) return
        setLoading(true)
        setError(null)
        try {
            const res = await api.get(`/employees/${id}`)
            setEmployee(res.data.employee)
        } catch (err: any) {
            setError(err?.response?.data?.message || "Could not fetch employee profile")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEmployee()
    }, [id])

    return { employee, loading, error, refetch: fetchEmployee }
}

export function useImportEmployees({ refetch }: { refetch: () => void }) {
    const [loading, setLoading] = useState(false)

    const importData = async (file: File) => {
        setLoading(true)
        const formData = new FormData()
        formData.append('csv', file)

        try {
            const res = await api.post('/employees/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            if (res.data.success) {
                toast.success(res.data.message || "Import completed successfully")
                refetch()
            } else {
                toast.warning(`Import completed with ${res.data.errors?.length} errors.`)
            }
            return true
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to import employees")
            return false
        } finally {
            setLoading(false)
        }
    }

    return { importData, loading }
}
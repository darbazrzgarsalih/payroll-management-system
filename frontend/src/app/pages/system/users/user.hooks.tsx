import api from "@/app/services/api"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export type User = {
    id?: string
    enr: number,
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    role: string,
    lastLogin: string,
    employeeName: string
    status: string
    avatar?: string
}

export function useUsers() {
    const [page, setPage] = useState<number>(1)
    const [limit] = useState<number>(15)
    const [total, setTotal] = useState<number>(0)
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [actionLoading, setActionLoading] = useState<null | string>(null)
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [search, setSearch] = useState<string>("")
    const [status, setStatus] = useState<string>("")


    const fetchUsers = async () => {
        setLoading(true)
        setError(null)

        try {
            const res = await api.get('/users', {
                params: {
                    page,
                    limit,
                    status: status && status !== "all_status" ? status : undefined,
                    username: search ? search.trim() : undefined
                }
            })
            setUsers(res.data.users)
            setTotal(res.data.total)
        } catch (error: any) {
            setError(error?.response?.data?.message || "Could not fetch Users")
        } finally {
            setLoading(false)
        }
    }

    const deleteUser = async (id: any) => {
        setError(null)
        setActionLoading(id)
        try {
            await api.delete(`/users/delete/${id}`)
            toast.success("User has been deleted")
            await fetchUsers()
            return true
        } catch (err: any) {
            setError(err?.response?.data?.message || "Cannot delete user")
            return false
        } finally {
            setActionLoading(null)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [page, search, status])

    useEffect(() => {
        const handler = setTimeout(() => {
            setSearch(searchTerm)
            setPage(1)
        }, 400)

        return () => clearTimeout(handler)
    }, [searchTerm])

    return {
        users,
        loading,
        error,
        refetch: fetchUsers,
        page,
        total,
        limit,
        setPage,
        search: searchTerm,
        setSearch: setSearchTerm,
        status,
        setStatus,
        deleteUser,
        actionLoading
    }
}

type UserForm = {
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    role: string
    password: string,
    employeeID: string
}

export function useCreateUsers() {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<null | string>(null)
    const [submitted, setSubmitted] = useState<boolean>(false)
    const [form, setForm] = useState<UserForm>({
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        role: "",
        password: "",
        employeeID: ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
        setError(null)
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
            [name]: value
        }))
        setError(null)
    }

    const createUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSubmitted(false)

        try {
            const formData = new FormData()
            formData.append('username', form.username)
            formData.append('firstName', form.firstName)
            formData.append('lastName', form.lastName)
            formData.append('email', form.email)
            formData.append('role', form.role)
            formData.append('password', form.password)
            if (form.employeeID && form.employeeID !== 'none') {
                formData.append('employeeID', form.employeeID)
            } else if (form.employeeID === 'none') {
                formData.append('employeeID', '')
            }
            if (avatarFile) formData.append('avatar', avatarFile)

            await api.post('/users/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            toast.success("User has been created successfully")
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
        handleSelectChange,
        handleFileChange,
        avatarFile,
        setAvatarFile,
        createUser
    }
}

type UserEditForm = {
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    role: string,
    avatar?: string,
    employeeID?: string,
}

export function useEditUsers({ refetch }: { refetch: () => void }) {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<null | string>(null)
    const [open, setOpen] = useState<boolean>(false)
    const [userId, setUserId] = useState<null | string>(null)
    const [initialForm, setInitialForm] = useState<UserEditForm | null>(null)

    const [form, setForm] = useState<UserEditForm>({
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        role: "",
        avatar: "",
        employeeID: "",
    })

    const openEdit = (user: any) => {
        setUserId(user.id)
        const initialData = {
            username: user.username ?? "",
            firstName: user.firstName ?? "",
            lastName: user.lastName ?? "",
            email: user.email ?? "",
            role: user.role ?? "",
            avatar: user.avatar ?? "",
            employeeID: user.employeeID ?? "",
        }
        setForm(initialData)
        setInitialForm(initialData)
        setOpen(true)
    }

    const closeEdit = () => {
        setOpen(false)
        setUserId(null)
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

    const handleSelectChange = (name: string, value: string) => {
        setForm(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const submitEdit = async () => {
        if (!userId) return
        if (initialForm && JSON.stringify(form) === JSON.stringify(initialForm)) {
            toast.info("No update dats provided")
            return
        }
        setLoading(true)
        setError(null)



        const formData = new FormData()
        formData.append('username', form.username)
        formData.append('firstName', form.firstName)
        formData.append('lastName', form.lastName)
        formData.append('email', form.email)
        formData.append('role', form.role)
        if (form.employeeID && form.employeeID !== 'none') {
            formData.append('employeeID', form.employeeID)
        } else if (form.employeeID === 'none') {
            formData.append('employeeID', '')
        }
        if (avatarFile) formData.append('avatar', avatarFile)

        try {
            await api.put(`/users/update/${userId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            toast.success("User updated")
            refetch()
            closeEdit()
        } catch (err: any) {
            setError(err?.response?.data?.message || "Cannot edit user")
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
        handleSelectChange,
        submitEdit,
        setForm
    }
}
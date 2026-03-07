import api from "@/app/services/api"
import React, { useEffect, useState } from "react"
import { toast } from "sonner"

export type Reward = {
    id?: string,
    enr: number,
    employeeName: string
    payrollName: string
    type: string
    amount: number
    reason: string
    paymentDate: string
    status: string
}

export function useRewards() {
    const [page, setPage] = useState<number>(1)
    const [limit] = useState<number>(15)
    const [total, setTotal] = useState<number>(0)
    const [rewards, setRewards] = useState<Reward[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<null | string>(null)
    const [search, setSearch] = useState<string>("")
    const [status, setStatus] = useState<string>("all")

    const fetchRewards = async () => {
        setLoading(true)
        setError(null)

        try {
            const res = await api.get('/rewards', {
                params: {
                    page,
                    limit,
                    search: search || undefined,
                    status: status === "all" ? undefined : status
                }
            })
            setRewards(res.data.rewards)
            setTotal(res.data.total)
        } catch (error: any) {
            setError(error?.response?.data?.message || "Failed to fetch Rewards")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRewards()
    }, [page, status])

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (page !== 1) setPage(1)
            else fetchRewards()
        }, 500)

        return () => clearTimeout(delayDebounceFn)
    }, [search])

    return {
        rewards,
        loading,
        error,
        refetch: fetchRewards,
        page,
        total,
        limit,
        setPage,
        search,
        setSearch,
        status,
        setStatus
    }
}


type RewardForm = {
    employeeID: string,
    payrollID: string
    amount: number,
    reason?: string,
    type?: string
}

export function useCreateRewards() {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<null | string>(null)
    const [submitted, setSubmitted] = useState<boolean>(false)
    const [form, setForm] = useState<RewardForm>({
        employeeID: "",
        payrollID: "",
        amount: 0,
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
        setError(null)
    }

    const createReward = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSubmitted(true)
        try {
            await api.post('/rewards', {
                employeeID: form.employeeID,
                payrollID: form.payrollID,
                amount: Number(form.amount || 0),
                reason: form.reason,
                type: form.type
            })

            toast.success('Reward has been created successfully')
            setForm({ employeeID: "", payrollID: "", amount: 0, reason: "", type: "" })
            setSubmitted(false)
            return true
        } catch (error: any) {
            setError(error?.response?.data?.message || "Could not create reward")
            return false
        } finally {
            setLoading(false)
        }
    }

    const handleSelectChange = (name: string, value: string) => {
        setForm(prev => ({
            ...prev,
            [name]: value,
        }))
    }

    return {
        loading,
        error,
        submitted,
        form,
        handleChange,
        createReward,
        handleSelectChange,
        setForm
    }
}


type BulkRewardForm = {
    employeeIDs: string[],
    payrollID: string,
    amount: number,
    reason?: string,
}

export function useBulkCreateRewards() {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<null | string>(null)
    const [submitted, setSubmitted] = useState<boolean>(false)
    const [form, setForm] = useState<BulkRewardForm>({
        employeeIDs: [],
        payrollID: "",
        amount: 0,
        reason: ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: any) => {
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const createBulkRewards = async () => {
        setLoading(true)
        setError(null)
        setSubmitted(true)

        try {
            await api.post('/rewards/bulk', {
                employeeIDs: form.employeeIDs,
                payrollID: form.payrollID,
                amount: Number(form.amount || 0),
                reason: form.reason
            })
            toast.success("Bulk rewards created successfully")
            setForm({ employeeIDs: [], payrollID: "", amount: 0, reason: "" })
            setSubmitted(false)
            return true
        } catch (error: any) {
            setError(error?.response?.data?.message || "Could not create bulk rewards")
            return false
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
        createBulkRewards
    }
}


type RewardEditForm = {
    type: string,
    amount: number,
    reason?: string
}

export function useEditRewards({ refetch }: { refetch: () => void }) {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<null | string>(null)
    const [rewardId, setRewardId] = useState<string | null>(null)
    const [open, setOpen] = useState<boolean>(false)
    const [initialForm, setInitialForm] = useState<RewardEditForm | null>(null)
    const [form, setForm] = useState<RewardEditForm>({
        type: "",
        amount: 0,
        reason: ""
    })

    const openEdit = (reward: any) => {
        setRewardId(reward.id)
        const initialData = {
            type: reward.type ?? "",
            amount: reward.amount ?? 0,
            reason: reward.reason ?? ""
        }

        setInitialForm(initialData)
        setForm(initialData)
        setOpen(true)
    }


    const closeEdit = () => {
        setOpen(false)
        setError(null)
        setInitialForm(null)
        setRewardId(null)
    }
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setForm(prev => ({
            ...prev,
            [name]: value,
        }))
    }

    const submitEdit = async () => {
        if (!rewardId) return
        if (initialForm && JSON.stringify(form) === JSON.stringify(initialForm)) {
            toast.info("No update data provided")
            return
        }

        setLoading(true)
        setError(null)

        const payload = {
            'type': form.type,
            'amount': form.amount,
            'reason': form.reason
        }

        try {
            await api.put(`/rewards/update/${rewardId}`, payload)
            toast.success("Reward updated")
            closeEdit()
            refetch()
        } catch (error: any) {
            setError(error?.response?.data?.message || "Cannot edit reward")
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
        setForm,
        handleSelectChange
    }
}
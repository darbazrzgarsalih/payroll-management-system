import api from "@/app/services/api"
import { useEffect, useState } from "react"

export type Payroll = {
    _id?: string,
    enr: number,
    startDate: string,
    endDate: string,
    payDate: string
    status: string,
}

export function usePayrolls() {
    const [payrolls, setPayrolls] = useState<Payroll[]>([])
    const [payrollDetails, setPayrollDetails] = useState<any>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const fetchPayrolls = async () => {
        setLoading(true)
        setError(null)

        try {
            const res = await api.get('/payrolls')
            setPayrolls(res.data.payrolls)
        } catch (error: any) {
            setError(error?.response?.data?.message || "Could not fetch Payrolls")
        } finally {
            setLoading(false)
        }
    }

    const getPayrollDetails = async (id: any) => { 
        setLoading(true)
        setError(null)
        try {
            const res = await api.get(`/payrolls/${id}/summary`) 
            setPayrollDetails(res.data.payroll)
        } catch (error: any) {
            setError(error?.response?.data?.message || "Could not fetch Payroll details")
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        fetchPayrolls()
    }, [])

    return {
        payrolls,
        loading,
        error,
        refetch: fetchPayrolls,
        getPayrollDetails,
        payrollDetails
    }
}

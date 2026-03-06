





//     payroll: any | null
//     items: any[]




//         payroll: any | null
//         items: any[]







//     const getPayrollDetails = async (id: string) => {




//                 payroll: res.data.payroll,
//                 items: res.data.items









//     const generateItems = async (id: string) => {










//     const approvePayroll = async (id: string) => {










//     const markAsPaid = async (id: string) => {










//     const rejectPayroll = async (id: string) => {
























import api from "@/app/services/api"
import { useState } from "react"
import { toast } from "sonner"

export function usePayrollDetails() {
    const [payrollDetails, setPayrollDetails] = useState<{
        payroll: any
        items: any[]
    } | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [actionLoading, setActionLoading] = useState<
        null | "generate" | "approve" | "pay" | "reject"
    >(null)

    const getPayrollDetails = async (id: string) => {
        setLoading(true)
        setError(null)
        try {
            const res = await api.get(`/payrolls/${id}/summary`)
            setPayrollDetails({
                payroll: res.data.payroll,
                items: res.data.items
            })
        } catch (error: any) {
            const msg = error?.response?.data?.message || "Could not fetch payroll details"
            setError(msg)
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    const generateItems = async (id: string) => {
        setActionLoading("generate")
        try {
            await api.post(`/payrolls/generate/${id}`)
            await getPayrollDetails(id)
            toast.success("Payroll items generated successfully")
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to generate payroll items")
        } finally {
            setActionLoading(null)
        }
    }

    const approvePayroll = async (id: string) => {
        setActionLoading("approve")
        try {
            await api.post(`/payrolls/approve/${id}`)
            await getPayrollDetails(id)
            toast.success("Payroll approved successfully")
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to approve payroll")
        } finally {
            setActionLoading(null)
        }
    }

    const markAsPaid = async (id: string) => {
        setActionLoading("pay")
        try {
            await api.post(`/payrolls/pay/${id}`)
            await getPayrollDetails(id)
            toast.success("Payroll marked as paid successfully")
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to mark payroll as paid")
        } finally {
            setActionLoading(null)
        }
    }

    const rejectPayroll = async (id: string) => {
        setActionLoading("reject")
        try {
            await api.post(`/payrolls/reject/${id}`)
            await getPayrollDetails(id)
            toast.warning("Payroll rejected successfully")
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to reject payroll")
        } finally {
            setActionLoading(null)
        }
    }

    return {
        payrollDetails,
        loading,
        error,
        actionLoading,
        getPayrollDetails,
        generateItems,
        approvePayroll,
        markAsPaid,
        rejectPayroll,
    }
}
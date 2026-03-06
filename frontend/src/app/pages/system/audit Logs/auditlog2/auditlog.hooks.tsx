import api from "@/app/services/api"
import { useEffect, useState } from "react"

export type AuditLog = {
    id?: string,
    enr: number,
    user: string,
    action: string,
    entity: string,
    entityID: string,
    OldValue: string,
    newValue: string,
    ipAddress: string
    createdAt: string
}

export function useAuditLogs() {
    const [page, setPage] = useState<number>(1)
    const [limit] = useState<number>(15)
    const [total, setTotal] = useState<number>(0)
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const fetchAuditLogs = async () => {
        setLoading(true)
        setError(null)

        try {
            const res = await api.get('/audit-logs', {
                params: { page, limit }
            })
            setAuditLogs(res.data.logs)
            setTotal(res.data.total)

        } catch (error: any) {
            setError(error?.response?.data?.message || "Could not fetch AuditLogs")
        }finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAuditLogs()
    },[page])

    return {
        auditLogs,
        loading,
        error,
        refetch: fetchAuditLogs,
        page,
        total,
        limit,
        setPage
    }
}
import api from "@/app/services/api"
import { useEffect, useState } from "react"

export type AuditLog = {
    id?: string
    enr: number
    user: string
    action: string
    entity: string
    entityID: string
    oldValue: string
    newValue: string
    ipAddress: string
    createdAt: string
}

export type AuditLogFilters = {
    search: string
    action: string
    entity: string
    from: string
    to: string
}

export function useAuditLogs() {
    const [page, setPage] = useState<number>(1)
    const [limit] = useState<number>(15)
    const [total, setTotal] = useState<number>(0)
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [filters, setFilters] = useState<AuditLogFilters>({
        search: '',
        action: '',
        entity: '',
        from: '',
        to: ''
    })

    const fetchAuditLogs = async () => {
        setLoading(true)
        setError(null)
        try {
            const params: Record<string, any> = { page, limit }
            if (filters.search) params.search = filters.search
            if (filters.action) params.action = filters.action
            if (filters.entity) params.entity = filters.entity
            if (filters.from) params.from = filters.from
            if (filters.to) params.to = filters.to

            const res = await api.get('/audit-logs', { params })
            setAuditLogs(res.data.logs)
            setTotal(res.data.total)
        } catch (error: any) {
            setError(error?.response?.data?.message || "Could not fetch AuditLogs")
        } finally {
            setLoading(false)
        }
    }

    
    useEffect(() => {
        setPage(1)
    }, [filters])

    useEffect(() => {
        fetchAuditLogs()
    }, [page, filters])

    return {
        auditLogs,
        loading,
        error,
        refetch: fetchAuditLogs,
        page,
        total,
        limit,
        setPage,
        filters,
        setFilters
    }
}

export function useAuditLog(id: string | null) {
    const [auditLog, setAuditLog] = useState<AuditLog | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!id) return
        const fetch = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await api.get(`/audit-logs/${id}`)
                setAuditLog(res.data.log)
            } catch (error: any) {
                setError(error?.response?.data?.message || "Could not fetch audit log")
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [id])

    return { auditLog, loading, error }
}
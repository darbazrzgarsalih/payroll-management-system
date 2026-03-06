import api from "@/app/services/api";
import { useState, useCallback } from "react";


export type Payslip = {
    id: string;
    enr: number;
    employeeName: string;
    payrollName: string;
    startDate: string;
    endDate: string;
    baseSalary: number;
    grossPay: number;
    netPay: number;
    status: "draft" | "approved" | "paid";
    deductions: { description: string; amount: number }[];
    rewards: { description: string; amount: number }[];
    overtimes: { description: string; amount: number }[];
    punishments: { description: string; amount: number }[];
    payDate: string;
    fileUrl?: string;
    ytdEarnings?: number;      
    ytdDeductions?: number;
    isAdjustment?: boolean;
    adjustmentReason?: string;
    adjustedPayslipID?: string;
    
    rawPayPeriod?: { startDate: string; endDate: string };
    rawDeductions?: { description: string; amount: number }[];
    rawRewards?: { description: string; amount: number }[];
    rawOvertimes?: { description: string; amount: number }[];
    rawPunishments?: { description: string; amount: number }[];
};

function mapPayslip(p: any): Payslip {
    
    const rawEnr = p.employeeID?.enr;
    const enrValue = (typeof rawEnr === "number" || typeof rawEnr === "string") ? rawEnr : 0;

    // Employee name: try personalInfo first, then top-level fields
    const firstName = p.employeeID?.personalInfo?.firstName ?? p.employeeID?.firstName;
    const lastName = p.employeeID?.personalInfo?.lastName ?? p.employeeID?.lastName;
    const employeeName = firstName && lastName ? `${firstName} ${lastName}` : "—";

    return {
        id: p._id,
        enr: enrValue as number,
        employeeName,
        payrollName: p.payrollID?.name ?? p.payrollID?.payrollCode ?? "—",
        startDate: p.payPeriod?.startDate
            ? new Date(p.payPeriod.startDate).toLocaleDateString()
            : "—",
        endDate: p.payPeriod?.endDate
            ? new Date(p.payPeriod.endDate).toLocaleDateString()
            : "—",
        baseSalary: p.baseSalary ?? 0,
        grossPay: p.grossPay ?? 0,
        netPay: p.netPay ?? 0,
        status: p.status ?? "draft",
        deductions: p.deductions ?? [],
        rewards: p.rewards ?? [],
        overtimes: p.overtimes ?? [],
        punishments: p.punishments ?? [],
        payDate: p.payDate ? new Date(p.payDate).toLocaleDateString() : "—",
        fileUrl: p.fileUrl ?? undefined,
        ytdEarnings: p.ytdEarnings ?? 0,
        ytdDeductions: p.ytdDeductions ?? 0,
        isAdjustment: p.isAdjustment ?? false,
        adjustmentReason: p.adjustmentReason ?? undefined,
        adjustedPayslipID: p.adjustedPayslipID ?? undefined,
        rawPayPeriod: p.payPeriod ?? undefined,
        rawDeductions: p.deductions ?? [],
        rawRewards: p.rewards ?? [],
        rawOvertimes: p.overtimes ?? [],
        rawPunishments: p.punishments ?? [],
    };
}

export type PayrollOption = {
    id: string;
    code: string;
    startDate: string;
    endDate: string;
    status: string;
};

export type AuditEntry = {
    id: string;
    user: string;
    action: string;
    oldValue: any;
    newValue: any;
    createdAt: string;
};

export type JobStatus = {
    status: "pending" | "running" | "done" | "failed";
    progress: number;
    total: number;
    message: string;
    error: string | null;
    result: { count: number } | null;
};


export function usePayslips() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [limit] = useState(15);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [payslips, setPayslips] = useState<Payslip[]>([]);

    const fetchPayslips = useCallback(
        async (params?: { search?: string; status?: string; month?: string; year?: string }) => {
            setLoading(true);
            setError(null);
            try {
                const queryParams = new URLSearchParams({
                    page: String(page),
                    limit: String(limit),
                    ...(params?.search && { search: params.search }),
                    ...(params?.status && { status: params.status }),
                    ...(params?.month && { month: params.month }),
                    ...(params?.year && { year: params.year }),
                });
                const res = await api.get(`/payslip?${queryParams.toString()}`);
                const data = res.data;
                setPayslips((data.payslips ?? []).map(mapPayslip));
                setTotal(data.total ?? 0);
                setTotalPages(data.totalPages ?? 1);
            } catch (err: any) {
                setError(err?.response?.data?.message ?? "Could not fetch payslips.");
            } finally {
                setLoading(false);
            }
        },
        [page, limit]
    );

    const generatePayslips = async (payrollID: string): Promise<{ jobId: string; total: number }> => {
        setError(null);
        const res = await api.post(`/payslip/generate/${payrollID}`);
        return res.data;
    };

    const pollJobStatus = async (jobId: string): Promise<JobStatus> => {
        const res = await api.get(`/payslip/job/${jobId}`);
        return res.data.job;
    };

    const updateStatus = async (id: string, status: "draft" | "approved" | "paid"): Promise<Payslip> => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.patch(`/payslip/${id}/status`, { status });
            const updated = mapPayslip(res.data.payslip);
            setPayslips((prev) => prev.map((p) => (p.id === id ? updated : p)));
            return updated;
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? "Could not update status.";
            setError(msg);
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    };

    const bulkUpdateStatus = async (ids: string[], status: "approved" | "paid"): Promise<{ updated: number; skipped: number }> => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.post(`/payslip/bulk-status`, { ids, status });
            setPayslips((prev) =>
                prev.map((p) => ids.includes(p.id) && p.status !== 'approved' && p.status !== 'paid' ? { ...p, status } : p)
            );
            return { updated: res.data.updated, skipped: res.data.skipped };
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? "Could not bulk update.";
            setError(msg);
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    };

    const createAdjustment = async (payload: {
        originalPayslipID: string;
        adjustmentReason: string;
        grossPay: number;
        netPay: number;
        deductions?: any[];
        rewards?: any[];
        overtimes?: any[];
        punishments?: any[];
    }): Promise<Payslip> => {
        setError(null);
        const res = await api.post(`/payslip/adjustment`, payload);
        const newPayslip = mapPayslip(res.data.payslip);
        setPayslips((prev) => [newPayslip, ...prev]);
        return newPayslip;
    };

    
    const fetchPayrollOptions = async (): Promise<PayrollOption[]> => {
        try {
            const res = await api.get(`/payslip/eligible-payrolls`);
            return (res.data.payrolls ?? []).map((p: any) => ({
                id: p._id,
                code: p.code ?? p.payrollCode,
                startDate: p.startDate ? new Date(p.startDate).toLocaleDateString() : "—",
                endDate: p.endDate ? new Date(p.endDate).toLocaleDateString() : "—",
                status: p.status,
            }));
        } catch {
            return [];
        }
    };

    const fetchPayslipAuditLog = async (payslipId: string): Promise<AuditEntry[]> => {
        try {
            const res = await api.get(`/audit-logs?entity=PaySlip&entityID=${payslipId}&limit=50`);
            return (res.data.logs ?? []).map((l: any) => ({
                id: l._id ?? l.id,
                user: l.userID?.username ?? l.user ?? "Unknown",
                action: l.action,
                oldValue: l.oldValue,
                newValue: l.newValue,
                createdAt: new Date(l.createdAt).toLocaleString(),
            }));
        } catch {
            return [];
        }
    };

    return {
        payslips,
        loading,
        error,
        page,
        setPage,
        limit,
        total,
        totalPages,
        fetchPayslips,
        generatePayslips,
        pollJobStatus,
        updateStatus,
        bulkUpdateStatus,
        createAdjustment,
        fetchPayrollOptions,
        fetchPayslipAuditLog,
        setPayslips,
    };
}
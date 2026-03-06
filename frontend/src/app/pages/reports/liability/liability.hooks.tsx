import { useState, useEffect } from 'react';
import api from '@/app/services/api';

export type LiabilityRow = {
    month: number;
    year: number;
    department: string;
    employeeCount: number;
    totalGrossPay: number;
    totalNetPay: number;
    totalDeductions: number;
    employerTaxes: number;
    totalLiability: number;
}

export function useLiabilityReport() {
    const [data, setData] = useState<LiabilityRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [year, setYear] = useState<string>(new Date().getFullYear().toString());

    const fetchReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/payrolls/liability-report', { params: { year } });
            if (res.data.success) {
                setData(res.data.report);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load report');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [year]);

    return {
        data,
        loading,
        error,
        year,
        setYear,
        refetch: fetchReport
    };
}

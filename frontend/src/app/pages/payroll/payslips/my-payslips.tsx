import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/app/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { FileDown, RefreshCw, CalendarDays, TrendingUp } from "lucide-react";
import { LoadingPage } from "@/app/components/LoadingPage";
import api from "@/app/services/api";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => String(CURRENT_YEAR - i));

const fmt = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val ?? 0);

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    paid: "default", approved: "secondary", draft: "outline",
};

type MyPayslip = {
    id: string;
    payrollName: string;
    startDate: string;
    endDate: string;
    payDate: string;
    baseSalary: number;
    grossPay: number;
    netPay: number;
    status: "draft" | "approved" | "paid";
    earnings: { description: string; amount: number }[];
    deductions: { description: string; amount: number }[];
    rewards: { description: string; amount: number }[];
    overtimes: { description: string; amount: number }[];
    punishments: { description: string; amount: number }[];
    ytdEarnings?: number;
    ytdDeductions?: number;
    fileUrl?: string;
};

function mapPayslip(p: any): MyPayslip {
    return {
        id: p._id,
        payrollName: p.payrollID?.name ?? p.payrollID?.payrollCode ?? "—",
        startDate: p.payPeriod?.startDate ? new Date(p.payPeriod.startDate).toLocaleDateString() : "—",
        endDate: p.payPeriod?.endDate ? new Date(p.payPeriod.endDate).toLocaleDateString() : "—",
        payDate: p.payDate ? new Date(p.payDate).toLocaleDateString() : "—",
        baseSalary: p.baseSalary ?? 0,
        grossPay: p.grossPay ?? 0,
        netPay: p.netPay ?? 0,
        status: p.status ?? "draft",
        earnings: p.earnings ?? [],
        deductions: p.deductions ?? [],
        rewards: p.rewards ?? [],
        overtimes: p.overtimes ?? [],
        punishments: p.punishments ?? [],
        ytdEarnings: p.ytdEarnings ?? 0,
        ytdDeductions: p.ytdDeductions ?? 0,
        fileUrl: p.fileUrl,
    };
}


function PayslipDetail({ payslip, open, onClose }: { payslip: MyPayslip | null; open: boolean; onClose: () => void }) {
    if (!payslip) return null;

    const Row = ({ label, value, bold, green }: { label: string; value: string; bold?: boolean; green?: boolean }) => (
        <div className={`flex justify-between py-1.5 text-sm ${bold ? "font-semibold" : ""} ${green ? "text-green-600 font-bold text-base" : ""}`}>
            <span className={green || bold ? "" : "text-muted-foreground"}>{label}</span>
            <span>{value}</span>
        </div>
    );

    const ItemList = ({ items }: { items: { description: string; amount: number }[] }) =>
        items?.length
            ? <>{items.map((item, i) => <Row key={i} label={`  ${item.description}`} value={fmt(item.amount)} />)}</>
            : <p className="text-sm text-muted-foreground py-0.5">None</p>;

    const BASE_URL = (import.meta as any).env.VITE_API_URL ?? "http://localhost:8000/api/v1";
    const downloadUrl = `${BASE_URL}/payslip/${payslip.id}/pdf`;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Payslip Detail</span>
                        <Badge variant={statusVariant[payslip.status] ?? "outline"}>
                            {payslip.status.charAt(0).toUpperCase() + payslip.status.slice(1)}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <div><span className="text-muted-foreground">Payroll: </span>{payslip.payrollName}</div>
                        <div><span className="text-muted-foreground">Pay Date: </span>{payslip.payDate}</div>
                        <div><span className="text-muted-foreground">Period: </span>{payslip.startDate} → {payslip.endDate}</div>
                    </div>

                    <Separator />

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Earnings</p>
                        <Row label="Base Salary" value={fmt(payslip.baseSalary)} />
                        {payslip.earnings.length > 0 && (
                            <ItemList items={payslip.earnings} />
                        )}
                        {payslip.rewards.length > 0 && (
                            <><p className="text-xs text-muted-foreground mt-1 mb-0.5">Rewards</p><ItemList items={payslip.rewards} /></>
                        )}
                        {payslip.overtimes.length > 0 && (
                            <><p className="text-xs text-muted-foreground mt-1 mb-0.5">Overtime</p><ItemList items={payslip.overtimes} /></>
                        )}
                    </div>

                    <Separator />

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Deductions</p>
                        <ItemList items={payslip.deductions} />
                        {payslip.punishments.length > 0 && (
                            <><p className="text-xs text-muted-foreground mt-1 mb-0.5">Penalties</p><ItemList items={payslip.punishments} /></>
                        )}
                    </div>

                    <Separator />

                    <div>
                        <Row label="Gross Pay" value={fmt(payslip.grossPay)} bold />
                        <Row label="Net Pay" value={fmt(payslip.netPay)} green />
                    </div>

                    { }
                    {(payslip.ytdEarnings ?? 0) > 0 && (
                        <>
                            <Separator />
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                                    <TrendingUp className="h-3.5 w-3.5" /> Year-to-Date
                                </p>
                                <Row label="YTD Gross Pay" value={fmt(payslip.ytdEarnings ?? 0)} />
                                <Row label="YTD Deductions" value={fmt(payslip.ytdDeductions ?? 0)} />
                                <Row label="YTD Net Pay" value={fmt((payslip.ytdEarnings ?? 0) - (payslip.ytdDeductions ?? 0))} bold />
                            </div>
                        </>
                    )}

                    <Separator />

                    <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                        <Button className="w-full" size="sm">
                            <FileDown className="h-4 w-4 mr-2" /> Download PDF
                        </Button>
                    </a>
                </div>
            </DialogContent>
        </Dialog>
    );
}


function MyPayslips() {
    const [payslips, setPayslips] = useState<MyPayslip[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [month, setMonth] = useState("all");
    const [year, setYear] = useState("all");
    const [selected, setSelected] = useState<MyPayslip | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ page: String(page), limit: "20" });
            if (month !== "all") params.append("month", String(MONTHS.indexOf(month) + 1));
            if (year !== "all") params.append("year", year);
            const res = await api.get(`/payslip/my?${params}`);
            setPayslips((res.data.payslips ?? []).map(mapPayslip));
            setTotal(res.data.total ?? 0);
            setTotalPages(res.data.totalPages ?? 1);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? "Could not load payslips.");
        } finally {
            setLoading(false);
        }
    }, [page, month, year]);

    useEffect(() => { load(); }, [load]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-3">
                <PageHeader title="My Payslips" description={`${total} payslip${total !== 1 ? "s" : ""} found`} />
                <Button variant="outline" size="sm" onClick={load} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
                </Button>
            </div>

            { }
            <div className="flex flex-wrap gap-3">
                <Select value={month} onValueChange={v => { setMonth(v); setPage(1); }}>
                    <SelectTrigger className="w-[150px]"><SelectValue placeholder="Month" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Months</SelectItem>
                        {MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={year} onValueChange={v => { setYear(v); setPage(1); }}>
                    <SelectTrigger className="w-[110px]"><SelectValue placeholder="Year" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            {error && (
                <div className="rounded-md bg-destructive/10 text-destructive text-sm px-4 py-3">{error}</div>
            )}

            {loading && payslips.length === 0 && (
                <LoadingPage />
            )}

            {!loading && payslips.length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                    <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Once there are payslips to show, you can view them here.</p>
                </div>
            )}

            <div className="grid gap-3">
                {payslips.map(p => (
                    <div
                        key={p.id}
                        onClick={() => setSelected(p)}
                        className="flex items-center justify-between rounded-lg border px-5 py-4 hover:bg-muted/40 cursor-pointer transition-colors"
                    >
                        <div className="space-y-0.5">
                            <p className="font-medium text-sm">{p.payrollName}</p>
                            <p className="text-xs text-muted-foreground">{p.startDate} – {p.endDate}</p>
                            <p className="text-xs text-muted-foreground">Pay Date: {p.payDate}</p>
                        </div>
                        <div className="text-right space-y-1">
                            <p className="font-semibold text-green-600 text-sm">{fmt(p.netPay)}</p>
                            <p className="text-xs text-muted-foreground">Gross: {fmt(p.grossPay)}</p>
                            <Badge variant={statusVariant[p.status] ?? "outline"} className="text-xs">
                                {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                            </Badge>
                        </div>
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Page {page} of {totalPages}</span>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                        <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
                    </div>
                </div>
            )}

            <PayslipDetail payslip={selected} open={!!selected} onClose={() => setSelected(null)} />
        </div>
    );
}

export default MyPayslips;

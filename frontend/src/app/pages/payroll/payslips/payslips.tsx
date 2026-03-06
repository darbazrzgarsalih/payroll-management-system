import { useEffect, useState, useCallback, useRef } from "react";
import { DataTable } from "@/app/components/DataTable/DataTable";
import { PageHeader } from "@/app/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Search, FileDown, RefreshCw, Zap, CheckCircle, DollarSign,
  Clock, AlertCircle, History, ChevronDown, ChevronUp,
} from "lucide-react";
import { PayslipColumns } from "./payslip.column";
import { usePayslips, type Payslip, type AuditEntry, type PayrollOption } from "./payslip.hooks";


const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => String(CURRENT_YEAR - i));
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

const fmt = (val: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val ?? 0);

const statusColor: Record<string, string> = {
  paid: "bg-green-100 text-green-800 border-green-200",
  approved: "bg-blue-100 text-blue-800 border-blue-200",
  draft: "bg-muted text-muted-foreground border",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusColor[status] ?? "bg-muted text-foreground border"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}


function AuditHistory({ payslipId, fetchFn }: { payslipId: string; fetchFn: (id: string) => Promise<AuditEntry[]> }) {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && logs.length === 0) {
      setLoading(true);
      setLogs(await fetchFn(payslipId));
      setLoading(false);
    }
  };

  const actionLabel = (action: string) =>
    action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div>
      <button
        onClick={toggle}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
      >
        <History className="h-3.5 w-3.5" />
        Status History
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {open && (
        <div className="mt-2 space-y-1.5 rounded-lg border bg-muted/20 p-3">
          {loading && <p className="text-xs text-muted-foreground animate-pulse">Loading history…</p>}
          {!loading && logs.length === 0 && (
            <p className="text-xs text-muted-foreground">No status changes recorded yet.</p>
          )}
          {logs.map((l) => (
            <div key={l.id} className="border-l-2 border-primary/40 pl-3 py-1">
              <div className="text-xs font-semibold text-foreground">{actionLabel(l.action)}</div>
              <div className="text-xs text-muted-foreground">
                by <span className="font-medium">{l.user}</span> · {l.createdAt}
              </div>
              {l.oldValue?.status && l.newValue?.status && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  <StatusBadge status={l.oldValue.status} /> {" → "}
                  <StatusBadge status={l.newValue.status} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function Row({ label, value, bold, green }: { label: string; value: string; bold?: boolean; green?: boolean }) {
  return (
    <div className={`flex justify-between py-1.5 text-sm ${bold ? "font-semibold" : ""} ${green ? "text-emerald-600 font-bold" : ""}`}>
      <span className={!green && !bold ? "text-muted-foreground" : ""}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function ItemList({ items }: { items: { description: string; amount: number }[] }) {
  if (!items?.length) return <p className="text-xs text-muted-foreground py-1 pl-2">None</p>;
  return (
    <>
      {items.map((item, i) => (
        <div key={i} className="flex justify-between py-1 text-sm pl-2">
          <span className="text-muted-foreground">{item.description}</span>
          <span>{fmt(item.amount)}</span>
        </div>
      ))}
    </>
  );
}


function PayslipDetailModal({
  payslip, open, onClose, onStatusChange, statusLoading,
  fetchAuditLog,
}: {
  payslip: Payslip | null; open: boolean; onClose: () => void;
  onStatusChange: (id: string, s: "draft" | "approved" | "paid") => Promise<void>;
  statusLoading: boolean;
  fetchAuditLog: (id: string) => Promise<AuditEntry[]>;
}) {
  if (!payslip) return null;
  const nextStatus = payslip.status === "draft" ? "approved" : payslip.status === "approved" ? "paid" : null;

  const pdfUrl = `${BASE_URL}/payslip/${payslip.id}/pdf`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-3 flex-wrap">
            <span className="text-base font-semibold">
              {payslip.employeeName}
            </span>
            <StatusBadge status={payslip.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-1">

          {}
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <div><span className="text-muted-foreground text-xs uppercase tracking-wide">Payroll</span><p className="font-medium">{payslip.payrollName}</p></div>
            <div><span className="text-muted-foreground text-xs uppercase tracking-wide">Pay Date</span><p className="font-medium">{payslip.payDate}</p></div>
            <div><span className="text-muted-foreground text-xs uppercase tracking-wide">Period</span><p className="font-medium">{payslip.startDate} – {payslip.endDate}</p></div>
          </div>

          <Separator />

          {}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Earnings</p>
            <Row label="Base Salary" value={fmt(payslip.baseSalary)} />
            {payslip.rewards.length > 0 && (
              <><p className="text-xs font-medium text-muted-foreground mt-2 mb-0.5">Rewards</p><ItemList items={payslip.rewards} /></>
            )}
            {payslip.overtimes.length > 0 && (
              <><p className="text-xs font-medium text-muted-foreground mt-2 mb-0.5">Overtime</p><ItemList items={payslip.overtimes} /></>
            )}
          </div>

          <Separator />

          {}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Deductions</p>
            <ItemList items={payslip.deductions} />
            {payslip.punishments.length > 0 && (
              <><p className="text-xs font-medium text-muted-foreground mt-2 mb-0.5">Penalties</p><ItemList items={payslip.punishments} /></>
            )}
          </div>

          <Separator />

          {}
          <div>
            <Row label="Gross Pay" value={fmt(payslip.grossPay)} bold />
            <Row label="Net Pay" value={fmt(payslip.netPay)} green />
          </div>

          {}
          {(payslip.ytdEarnings ?? 0) > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Year-to-Date Summary</p>
                <Row label="YTD Gross" value={fmt(payslip.ytdEarnings ?? 0)} />
                <Row label="YTD Deductions" value={fmt(payslip.ytdDeductions ?? 0)} />
                <Row label="YTD Net" value={fmt((payslip.ytdEarnings ?? 0) - (payslip.ytdDeductions ?? 0))} bold />
              </div>
            </>
          )}

          <Separator />

          {}
          <div className="space-y-2">
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
              <Button className="w-full" variant="outline" size="sm">
                <FileDown className="h-4 w-4 mr-2" /> Download PDF
              </Button>
            </a>

            {}
            <AuditHistory payslipId={payslip.id} fetchFn={fetchAuditLog} />
          </div>
        </div>

        <DialogFooter className="mt-4 gap-2 flex-wrap">
          {nextStatus && (
            <Button
              size="sm"
              disabled={statusLoading}
              onClick={() => onStatusChange(payslip.id, nextStatus as any)}
            >
              {nextStatus === "approved" ? <CheckCircle className="h-4 w-4 mr-2" /> : <DollarSign className="h-4 w-4 mr-2" />}
              {statusLoading ? "Updating…" : nextStatus === "approved" ? "Approve" : "Mark as Paid"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}




function GenerateDialog({
  open, onClose, onGenerate, fetchPayrolls,
}: {
  open: boolean; onClose: () => void;
  onGenerate: (payrollID: string) => Promise<{ jobId: string; total: number }>;
  fetchPayrolls: () => Promise<PayrollOption[]>;
}) {
  const [payrolls, setPayrolls] = useState<PayrollOption[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [localError, setLocalError] = useState("");
  const [isLoadingPayrolls, setIsLoadingPayrolls] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobState, setJobState] = useState<{ status: string; progress: number; total: number; message: string; error: string | null } | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (open) {
      setSelectedId(""); setLocalError(""); setJobId(null); setJobState(null);
      setIsLoadingPayrolls(true);
      fetchPayrolls().then((p) => { setPayrolls(p); setIsLoadingPayrolls(false); });
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [open]);

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    setIsPolling(false);
  };

  const handleGenerate = async () => {
    if (!selectedId) { setLocalError("Please select a payroll."); return; }
    setLocalError("");
    try {
      const res = await onGenerate(selectedId);
      setJobId(res.jobId);
      setJobState({ status: "pending", progress: 0, total: res.total, message: "Starting…", error: null });
      setIsPolling(true);

      pollRef.current = setInterval(async () => {
        try {
          const r = await fetch(`${BASE_URL}/payslip/job/${res.jobId}`, { credentials: "include" });
          const data = await r.json();
          const job = data.job;
          setJobState({
            status: job.status,
            progress: job.progress,
            total: job.total,
            message: job.message ?? "",
            error: job.error ?? null,
          });
          if (job.status === "done" || job.status === "failed") stopPolling();
        } catch { stopPolling(); }
      }, 1500);
    } catch (e: any) {
      setLocalError(e.message);
    }
  };

  const percent = jobState && jobState.total > 0
    ? Math.round((jobState.progress / jobState.total) * 100) : 0;
  const isDone = jobState?.status === "done";
  const isFailed = jobState?.status === "failed";

  return (
    <Dialog open={open} onOpenChange={() => { if (!isPolling) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Generate Payslips</DialogTitle></DialogHeader>

        <div className="space-y-4 mt-2">
          {!jobId ? (
            <>
              <p className="text-sm text-muted-foreground">
                Only payrolls in <strong>Paid</strong> status with no existing payslips are shown.
              </p>
              <Select value={selectedId} onValueChange={v => { setSelectedId(v); setLocalError(""); }}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingPayrolls ? "Loading payrolls…" : "Select a payroll"} />
                </SelectTrigger>
                <SelectContent>
                  {!isLoadingPayrolls && payrolls.length === 0 && (
                    <SelectItem value="__none" disabled>No eligible payrolls found</SelectItem>
                  )}
                  {payrolls.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex flex-col">
                        <span className="font-mono font-semibold">{p.code}</span>
                        <span className="text-xs text-muted-foreground">{p.startDate} – {p.endDate}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {localError && <p className="text-sm text-destructive">{localError}</p>}
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                {isDone && <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />}
                {isFailed && <AlertCircle className="h-4 w-4 text-destructive shrink-0" />}
                {!isDone && !isFailed && <Clock className="h-4 w-4 text-primary shrink-0 animate-pulse" />}
                <span>{jobState?.message}</span>
              </div>
              <Progress value={percent} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">
                {jobState?.progress ?? 0} / {jobState?.total ?? 0} payslips
              </p>
              {isDone && (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm px-3 py-2">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  Generation complete. Payslips are in draft status.
                </div>
              )}
              {isFailed && (
                <p className="text-sm text-destructive">{jobState?.error}</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          {!jobId ? (
            <>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleGenerate} disabled={!selectedId || isLoadingPayrolls}>
                <Zap className="h-4 w-4 mr-2" /> Generate
              </Button>
            </>
          ) : (
            <Button onClick={onClose} disabled={isPolling} variant={isDone ? "default" : "outline"}>
              {isDone ? "Done ✓" : isFailed ? "Close" : "Running…"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function Payslips() {
  const {
    payslips, loading, error, total, page, setPage, totalPages,
    fetchPayslips, generatePayslips, updateStatus, bulkUpdateStatus,
    fetchPayrollOptions, fetchPayslipAuditLog,
  } = usePayslips();

  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("all");
  const [year, setYear] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const [generateOpen, setGenerateOpen] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);


  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 5000);
  };

  const load = useCallback(() => {
    setSelectedIds(new Set());
    fetchPayslips({
      search: search || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      month: month !== "all" ? String(MONTHS.indexOf(month) + 1) : undefined,
      year: year !== "all" ? year : undefined,
    });
  }, [search, statusFilter, month, year, fetchPayslips]);

  useEffect(() => { load(); }, [load, page]);

  const handleStatusChange = async (id: string, newStatus: "draft" | "approved" | "paid") => {
    setStatusLoading(true);
    try {
      const updated = await updateStatus(id, newStatus);
      setSelectedPayslip(updated);
      showToast(`Payslip marked as ${newStatus}.`);
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleBulkAction = async (targetStatus: "approved" | "paid") => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      const r = await bulkUpdateStatus(Array.from(selectedIds), targetStatus);
      setSelectedIds(new Set());
      const msg = r.skipped > 0
        ? `${r.updated} updated, ${r.skipped} skipped (already locked).`
        : `${r.updated} payslips updated to ${targetStatus}.`;
      showToast(msg);
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setBulkLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const allSelected = payslips.length > 0 && selectedIds.size === payslips.length;
  const toggleAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(payslips.map((p) => p.id)));
  };

  // Build columns: prepend checkbox column
  const baseColumns = PayslipColumns((row: any) => {
    const full = payslips.find((p) => p.id === row.id) ?? null;
    setSelectedPayslip(full);
  });

  const columns = [
    {
      header: <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" />,
      accessor: "__select",
      className: "w-10",
      cell: (row: any) => (
        <Checkbox
          checked={selectedIds.has(row.id)}
          onCheckedChange={() => toggleSelect(row.id)}
          onClick={(e: any) => e.stopPropagation()}
          aria-label="Select row"
        />
      ),
    },
    ...baseColumns,
  ];

  return (
    <div className="space-y-5">
      {}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <PageHeader title="Payslips" description={`${total} total payslips`} />
        <div className="flex gap-2 flex-wrap items-center">
          {selectedIds.size > 0 && (
            <>
              <span className="text-xs text-muted-foreground">{selectedIds.size} selected</span>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction("approved")} disabled={bulkLoading}>
                <CheckCircle className="h-4 w-4 mr-1.5" /> Approve
              </Button>
              <Button variant="default" size="sm" onClick={() => handleBulkAction("paid")} disabled={bulkLoading}>
                <DollarSign className="h-4 w-4 mr-1.5" /> Mark Paid
              </Button>
              <div className="h-4 w-px bg-border mx-1" />
            </>
          )}
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setGenerateOpen(true)}>
            <Zap className="h-4 w-4 mr-1.5" /> Generate Payslips
          </Button>
        </div>
      </div>

      {}
      {toast && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${toast.type === "error"
          ? "bg-destructive/10 text-destructive border-destructive/20"
          : "bg-green-50 text-green-800 border-green-200"
          }`}>
          {toast.text}
        </div>
      )}

      {}
      <div className="flex flex-wrap gap-2.5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employee or payroll…"
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={month} onValueChange={(v) => { setMonth(v); setPage(1); }}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Month" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={year} onValueChange={(v) => { setYear(v); setPage(1); }}>
          <SelectTrigger className="w-[110px]"><SelectValue placeholder="Year" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {}
      {error && (
        <div className="rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {}
      <DataTable
        columns={columns as any}
        data={payslips}
        loading={loading}
        emptyMessage={loading ? "Loading..." : "Once there are payslips to show, you can view them here"}
      />

      {}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-1">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1 || loading} onClick={() => setPage(p => p - 1)}>← Prev</Button>
            <Button size="sm" variant="outline" disabled={page >= totalPages || loading} onClick={() => setPage(p => p + 1)}>Next →</Button>
          </div>
        </div>
      )}

      {}
      <PayslipDetailModal
        payslip={selectedPayslip}
        open={!!selectedPayslip}
        onClose={() => setSelectedPayslip(null)}
        onStatusChange={handleStatusChange}
        statusLoading={statusLoading}
        fetchAuditLog={fetchPayslipAuditLog}
      />

      <GenerateDialog
        open={generateOpen}
        onClose={() => { setGenerateOpen(false); load(); }}
        onGenerate={generatePayslips}
        fetchPayrolls={fetchPayrollOptions}
      />
    </div>
  );
}

export default Payslips;
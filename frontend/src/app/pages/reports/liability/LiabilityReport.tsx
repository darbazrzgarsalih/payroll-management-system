import { PageHeader } from "@/app/components/PageHeader";
import { DataTable } from "@/app/components/DataTable/DataTable";
import { liabilityColumns } from "./liability.column";
import { useLiabilityReport } from "./liability.hooks";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import { Refresh01Icon, FileExportIcon } from "@hugeicons/core-free-icons";

export default function LiabilityReport() {
    const { data, loading, error, year, setYear, refetch } = useLiabilityReport();

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

    const totalLiabilityAmount = data.reduce((acc, curr) => acc + (curr.totalLiability || 0), 0);
    const totalGross = data.reduce((acc, curr) => acc + (curr.totalGrossPay || 0), 0);

    const handleExport = () => {
        const header = ["Month", "Year", "Department", "Employees", "Gross Pay", "Deductions", "Net Pay", "Employer Taxes", "Total Liability"];
        const rows = data.map(r => [
            r.month, r.year, r.department, r.employeeCount,
            r.totalGrossPay, r.totalDeductions, r.totalNetPay,
            r.employerTaxes, r.totalLiability
        ]);
        const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');

        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
        a.download = `liability-report-${year}.csv`;
        a.click();
    };

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen text-muted-foreground">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <PageHeader
                    title="Monthly Liability Report"
                    description={`Employer Cost Summary for ${year}`}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col justify-center">
                    <p className="text-sm text-muted-foreground font-medium">Total Gross Payroll</p>
                    <p className="text-2xl font-bold text-card-foreground mt-2">${totalGross.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col justify-center">
                    <p className="text-sm text-muted-foreground font-medium">Total Employer Taxes</p>
                    <p className="text-2xl font-bold text-card-foreground mt-2">$0.00</p>
                </div>
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col justify-center">
                    <p className="text-sm text-muted-foreground font-medium">Total Company Liability</p>
                    <p className="text-2xl font-bold text-card-foreground mt-2">${totalLiabilityAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
            </div>

            <div className="flex w-full justify-between gap-2 items-center">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">Reporting Year:</span>
                    <Select value={year} onValueChange={setYear}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map(y => (
                                <SelectItem key={y} value={y}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex gap-2">
                    <Button className="flex items-center gap-2" onClick={handleExport} variant="outline" disabled={data.length === 0}>
                        Export CSV
                        <HugeiconsIcon icon={FileExportIcon} />
                    </Button>
                    <Button className="flex items-center gap-2" onClick={refetch} variant="outline">
                        Refresh
                        <HugeiconsIcon icon={Refresh01Icon} />
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-40 text-muted-foreground">
                    <Spinner className="h-5 w-5" />
                </div>
            ) : (
                <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                    <DataTable
                        columns={liabilityColumns}
                        data={data}
                        emptyMessage={`No payroll liability data found for ${year}.`}
                    />
                </div>
            )}
        </div>
    );
}

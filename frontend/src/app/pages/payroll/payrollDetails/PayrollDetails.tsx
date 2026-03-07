import { Spinner } from "@/components/ui/spinner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { usePayrollDetails } from "./payroll-details.hooks"
import { useSettings } from "../../system/settings/settings.hooks"
import { PageHeader } from "@/app/components/PageHeader"
import { Calendar, Users, DollarSign, FileText, Play, CheckCircle, Banknote, XCircle, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  processing: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700",
  paid: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  pending: "bg-yellow-100 text-yellow-700",
}

const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num || 0)
}

const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

function PayrollDetails() {
  const { id } = useParams<{ id: string }>()
  const {
    payrollDetails,
    loading,
    error,
    actionLoading,
    getPayrollDetails,
    generateItems,
    approvePayroll,
    markAsPaid,
    rejectPayroll,
  } = usePayrollDetails()
  const { settings } = useSettings()

  useEffect(() => {
    if (id) getPayrollDetails(id)
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Spinner className="h-5 w-5" />
    </div>
  )

  if (error || !payrollDetails) return (
    <div className="flex items-center justify-center h-screen text-muted-foreground">
      <p>{error || "No payroll data found"}</p>
    </div>
  )

  const { payroll, items } = payrollDetails
  const status = payroll.status

  const canGenerate = status === "draft"
  const canApprove = status === "processing"
  const canPay = status === "approved"
  const canReject = ["draft", "processing"].includes(status)

  return (
    <>
      <div className="space-y-6 print:hidden">

        { }
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <PageHeader
            title="Payroll Details"
            description={`Pay period: ${formatDate(payroll.payPeriod.startDate)} — ${formatDate(payroll.payPeriod.endDate)}`}
          />
          <div className="flex gap-2 flex-wrap pt-1">
            {canGenerate && (
              <Button onClick={() => generateItems(id!)} disabled={!!actionLoading} className="gap-2">
                {actionLoading === "generate" ? <Spinner className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                Generate Items
              </Button>
            )}
            {canApprove && (
              <Button onClick={() => approvePayroll(id!)} disabled={!!actionLoading} className="gap-2 bg-green-600 hover:bg-green-700">
                {actionLoading === "approve" ? <Spinner className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                Approve
              </Button>
            )}
            {canPay && (
              <Button onClick={() => markAsPaid(id!)} disabled={!!actionLoading} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                {actionLoading === "pay" ? <Spinner className="h-4 w-4" /> : <Banknote className="h-4 w-4" />}
                Mark as Paid
              </Button>
            )}
            {canReject && (
              <Button variant="destructive" onClick={() => rejectPayroll(id!)} disabled={!!actionLoading} className="gap-2">
                {actionLoading === "reject" ? <Spinner className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                Reject
              </Button>
            )}
            <Button variant="outline" onClick={() => window.print()} className="gap-2">
              <Printer className="h-4 w-4" /> Print
            </Button>
          </div>
        </div>

        { }
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Net Pay</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(payroll.totalNetPay)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Gross: {formatCurrency(payroll.totalGrossPay)} · Deductions: {formatCurrency(payroll.totalDeductions)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payroll.totalEmployees || items.length}</div>
              <p className="text-xs text-muted-foreground">in this payroll run</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pay Date</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">{formatDate(payroll.payPeriod.payDate)}</div>
              <p className="text-xs text-muted-foreground">scheduled pay date</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <span className={`text-xs px-2 py-1 rounded font-semibold ${statusColors[status] || "bg-gray-100 text-gray-700"}`}>
                {status.toUpperCase()}
              </span>
              <p className="text-xs text-muted-foreground mt-1">{payroll.payrollCode}</p>
            </CardContent>
          </Card>
        </div>

        { }
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Payroll Items</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Base Salary</TableHead>
                      <TableHead>Gross Pay</TableHead>
                      <TableHead>Rewards</TableHead>
                      <TableHead>Overtimes</TableHead>
                      <TableHead>Punishments</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Net Pay</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                          No payroll items yet — click "Generate Items" to create them
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item) => (
                        <TableRow key={item._id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{[item.employeeID?.personalInfo?.firstName, item.employeeID?.personalInfo?.middleName, item.employeeID?.personalInfo?.lastName].filter(Boolean).join(' ') || "N/A"}</span>
                              <span className="text-xs text-muted-foreground">{item.employeeID?.employeeCode || "N/A"}</span>
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(item.baseSalary)}</TableCell>
                          <TableCell>{formatCurrency(item.grossPay)}</TableCell>
                          <TableCell className="text-green-600">+{formatCurrency(item.totalRewards || 0)}</TableCell>
                          <TableCell className="text-blue-600">+{formatCurrency(item.totalOvertimes || 0)}</TableCell>
                          <TableCell className="text-orange-600">-{formatCurrency(item.totalPunishments || 0)}</TableCell>
                          <TableCell className="text-red-600">-{formatCurrency(item.totalDeductions)}</TableCell>
                          <TableCell className="font-bold">{formatCurrency(item.netPay)}</TableCell>
                          <TableCell>
                            <span className={`text-xs px-2 py-1 rounded font-semibold ${statusColors[item.status] || "bg-gray-100 text-gray-700"}`}>
                              {item.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Payroll Code</span>
                  <span className="font-medium">{payroll.payrollCode}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className={`text-xs px-2 py-1 rounded font-semibold ${statusColors[status]}`}>
                    {status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Period Start</span>
                  <span>{formatDate(payroll.payPeriod.startDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Period End</span>
                  <span>{formatDate(payroll.payPeriod.endDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pay Date</span>
                  <span>{formatDate(payroll.payPeriod.payDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Employees</span>
                  <span className="font-medium">{payroll.totalEmployees || items.length}</span>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Gross Pay</span>
                  <span className="font-medium">{formatCurrency(payroll.totalGrossPay)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Rewards</span>
                  <span className="font-medium text-green-500">+{formatCurrency(payroll.totalRewards || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Overtimes</span>
                  <span className="font-medium text-blue-500">+{formatCurrency(payroll.totalOvertimes || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Punishments</span>
                  <span className="font-medium text-orange-500">-{formatCurrency(payroll.totalPunishments || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Deductions</span>
                  <span className="font-medium text-red-500">{formatCurrency(payroll.totalDeductions)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold">Net Pay</span>
                  <span className="font-bold text-green-600">{formatCurrency(payroll.totalNetPay)}</span>
                </div>
              </div>

              {payroll.approvedBy && (
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Approved By</span>
                    <span className="text-sm">{payroll.approvedBy?.username}</span>
                  </div>
                  {payroll.approvedAt && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Approved At</span>
                      <span className="text-sm">{formatDate(payroll.approvedAt)}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="hidden print:fixed print:inset-0 print:block min-h-screen bg-white text-black font-sans antialiased w-full print:z-9999 print:p-0">
        <style dangerouslySetInnerHTML={{
          __html: `
          @media print {
            @page { 
              margin: 10mm; 
              size: portrait;
            }
            body { 
              background: white !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .print-section {
              page-break-inside: avoid;
            }
            /* Force full width on paper */
            .print-container {
               width: 100% !important;
               max-width: none !important;
               margin: 0 !important;
               padding: 0 !important;
            }
          }
        ` }} />

        <div className="print-container w-full px-8 py-10 space-y-12">
          <div className="flex justify-between items-center border-b-2 border-slate-200 pb-8">
            <div className="space-y-2">
              <h1 className="text-6xl font-black tracking-tighter text-black uppercase leading-none">
                {settings?.companyName || "High Tech"}
              </h1>
              {settings?.companyTitle && (
                <p className="text-xs font-black tracking-[0.5em] text-slate-400 uppercase">
                  {settings.companyTitle}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              {settings?.companyLogo ? (
                <img src={`http://localhost:8000/${settings.companyLogo}`} alt="Company Logo" className="h-24 w-24 object-contain" />
              ) : (
                <div className="h-24 w-24 bg-slate-900 flex items-center justify-center text-white text-4xl font-black">
                  {settings?.companyName?.[0] || 'H'}
                </div>
              )}
              <div className="h-2 w-32 bg-slate-900" />
            </div>
          </div>

          { }
          <div className="grid grid-cols-2 gap-x-20 gap-y-8 pt-4">
            <div className="space-y-2 border-l-2 border-slate-200 pl-6">
              <p className="text-slate-400 uppercase font-black text-[10px] tracking-[0.2em]">Payroll Reference</p>
              <p className="text-3xl font-black tracking-tight uppercase">{payroll.payrollCode}</p>
            </div>
            <div className="space-y-2 border-r-2 border-slate-200 pr-6 text-right">
              <p className="text-slate-400 uppercase font-black text-[10px] tracking-[0.2em]">Current Status</p>
              <p className="text-3xl font-black uppercase tracking-tight text-slate-800">{payroll.status}</p>
            </div>

            <div className="space-y-2 border-l-2 border-slate-200 pl-6">
              <p className="text-slate-400 uppercase font-black text-[10px] tracking-[0.2em]">Pay Period</p>
              <p className="font-black text-xl uppercase tracking-tighter">
                {formatDate(payroll.payPeriod.startDate)} <span className="text-slate-300 mx-2">—</span> {formatDate(payroll.payPeriod.endDate)}
              </p>
            </div>
            <div className="space-y-2 border-r-2 border-slate-200 pr-6 text-right">
              <p className="text-slate-400 uppercase font-black text-[10px] tracking-[0.2em]">Payment Date</p>
              <p className="font-black text-xl uppercase tracking-tighter">{formatDate(payroll.payPeriod.payDate)}</p>
            </div>
          </div>

          { }
          <div className="relative">
            <div className="absolute inset-0 bg-slate-50 -rotate-1 rounded-3xl -z-10" />
            <div className="grid grid-cols-5 gap-0 border-2 border-slate-200 bg-white rounded-2xl overflow-hidden">
              <div className="p-6 text-center border-r-2 border-slate-200">
                <p className="text-slate-400 uppercase font-black text-[10px] mb-3 tracking-[0.2em]">Total Gross</p>
                <p className="text-2xl font-black tracking-tighter">{formatCurrency(payroll.totalGrossPay)}</p>
              </div>
              <div className="p-6 text-center border-r-2 border-slate-200 bg-slate-50/50">
                <p className="text-slate-400 uppercase font-black text-[10px] mb-3 tracking-[0.2em]">Rewards</p>
                <p className="text-2xl font-black text-green-600 tracking-tighter">+{formatCurrency(payroll.totalRewards || 0)}</p>
              </div>
              <div className="p-6 text-center border-r-2 border-slate-200">
                <p className="text-slate-400 uppercase font-black text-[10px] mb-3 tracking-[0.2em]">Overtimes</p>
                <p className="text-2xl font-black text-blue-600 tracking-tighter">+{formatCurrency(payroll.totalOvertimes || 0)}</p>
              </div>
              <div className="p-6 text-center border-r-2 border-slate-200 bg-slate-50/50">
                <p className="text-slate-400 uppercase font-black text-[10px] mb-3 tracking-[0.2em]">Punishments</p>
                <p className="text-2xl font-black text-orange-600 tracking-tighter">-{formatCurrency(payroll.totalPunishments || 0)}</p>
              </div>
              <div className="p-6 text-center border-r-2 border-slate-200">
                <p className="text-slate-400 uppercase font-black text-[10px] mb-3 tracking-[0.2em]">Deductions</p>
                <p className="text-2xl font-black text-red-600 tracking-tighter">-{formatCurrency(payroll.totalDeductions)}</p>
              </div>
            </div>
            <div className="mt-4 bg-slate-900 p-8 text-center rounded-2xl">
              <p className="text-slate-400 uppercase font-black text-[10px] mb-3 tracking-[0.2em]">Net Payable</p>
              <p className="text-5xl font-black text-white tracking-tighter">
                {formatCurrency(payroll.totalNetPay)}
              </p>
            </div>
          </div>

          { }
          <div className="space-y-6 pt-10">
            <div className="flex items-center gap-6">
              <h3 className="text-2xl font-black uppercase tracking-tighter">Detailed breakdown</h3>
              <div className="flex-1 h-0.5 bg-slate-200" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{items.length} EMPLOYEES LISTED</p>
            </div>

            <div className="border-2 border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white uppercase text-[10px] font-extrabold tracking-[0.2em]">
                    <th className="p-5 border-r border-slate-700">Employee Details</th>
                    <th className="p-5 border-r border-slate-700">Base Salary</th>
                    <th className="p-5 border-r border-slate-700">Gross Amount</th>
                    <th className="p-5 border-r border-slate-700">Rewards</th>
                    <th className="p-5 border-r border-slate-700">Overtimes</th>
                    <th className="p-5 border-r border-slate-700">Punishments</th>
                    <th className="p-5 border-r border-slate-700">Deductions</th>
                    <th className="p-5 text-right">Net Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100">
                  {items.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-5 border-r-2 border-slate-100">
                        <div className="font-black text-lg text-black uppercase leading-none">{[item.employeeID?.personalInfo?.firstName, item.employeeID?.personalInfo?.middleName, item.employeeID?.personalInfo?.lastName].filter(Boolean).join(' ') || "N/A"}</div>
                        <div className="text-[10px] font-black text-slate-400 tracking-widest uppercase mt-1">{item.employeeID?.employeeCode || "N/A"}</div>
                      </td>
                      <td className="p-5 border-r-2 border-slate-100 font-bold text-slate-700 italic">{formatCurrency(item.baseSalary)}</td>
                      <td className="p-5 border-r-2 border-slate-100 font-bold text-black">{formatCurrency(item.grossPay)}</td>
                      <td className="p-5 border-r-2 border-slate-100 font-bold text-green-600">+{formatCurrency(item.totalRewards || 0)}</td>
                      <td className="p-5 border-r-2 border-slate-100 font-bold text-blue-600">+{formatCurrency(item.totalOvertimes || 0)}</td>
                      <td className="p-5 border-r-2 border-slate-100 font-bold text-orange-600">-{formatCurrency(item.totalPunishments || 0)}</td>
                      <td className="p-5 border-r-2 border-slate-100 font-black text-red-500">-{formatCurrency(item.totalDeductions)}</td>
                      <td className="p-5 text-right font-black text-2xl text-green-700 tracking-tighter italic">{formatCurrency(item.netPay)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          { }
          <div className="grow pt-20" />

          { }
          <div className="grid grid-cols-2 gap-24 pt-16 print-section">
            <div className="space-y-6">
              <div className="h-24 flex items-end justify-center border-b-2 border-slate-200">
                <p className="text-3xl font-serif italic text-slate-800 opacity-80">{payroll.createdBy?.username || "System Administrator"}</p>
              </div>
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] text-center">Prepared & Verified By</p>
            </div>
            <div className="space-y-6">
              <div className="h-24 flex items-end justify-center border-b-2 border-slate-200">
                {payroll.approvedBy?.username ? (
                  <p className="text-3xl font-serif italic text-black uppercase tracking-tighter underline underline-offset-8">{payroll.approvedBy.username}</p>
                ) : (
                  <div className="w-full h-px bg-slate-200 mb-2" />
                )}
              </div>
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] text-center">Authorized Signature</p>
            </div>
          </div>

          { }
          <div className="pt-20 space-y-8 border-t-2 border-slate-100 mt-20 opacity-30">
            <div className="flex justify-between items-start text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              <div className="space-y-1">
                <p>{settings?.companyName}</p>
                <p>{settings?.companyAddress?.street} {settings?.companyAddress?.city}</p>
                <p>{settings?.companyContact?.email} | {settings?.companyContact?.phone}</p>
              </div>
              <div className="text-right space-y-1">
                <p>Tax ID: {settings?.taxID}</p>
                <p>Reg: {settings?.registrationNumber}</p>
              </div>
            </div>
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              <p>Generated: {new Date().toLocaleString()}</p>
              <p>{settings?.companyContact?.website}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default PayrollDetails
import { DataTable } from "@/app/components/DataTable/DataTable"
import { PageHeader } from "@/app/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { PayrollColumns, type PayrollRow } from "./payroll.column"
import { Spinner } from "@/components/ui/spinner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Refresh01Icon, FileExportIcon } from "@hugeicons/core-free-icons"
import api from "@/app/services/api"
import { usePayrolls } from "./payroll.hooks"
import { LoadingPage } from "@/app/components/LoadingPage"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"


function Payrolls() {
  const { payrolls, loading, error, refetch } = usePayrolls()
  const [open, setOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [form, setForm] = useState({
    payrollCode: "",
    startDate: "",
    endDate: "",
    payDate: ""
  })

  const tableData: PayrollRow[] = payrolls.map((payroll, index) => ({
    _id: payroll._id,
    enr: index + 1,
    startDate: new Date(payroll.startDate).toLocaleDateString(),
    endDate: new Date(payroll.endDate).toLocaleDateString(),
    payDate: new Date(payroll.payDate).toLocaleDateString(),
    status: payroll.status
  }))

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.payrollCode || !form.startDate || !form.endDate || !form.payDate) {
      toast.error("Please fill all fields")
      return
    }

    setCreateLoading(true)
    try {
      await api.post('/payrolls/run', form)
      toast.success("Payroll run created successfully")
      setOpen(false)
      setForm({ payrollCode: "", startDate: "", endDate: "", payDate: "" })
      refetch()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create payroll run")
    } finally {
      setCreateLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }



  if (loading && payrolls.length === 0) {
    return (
      <LoadingPage />
    )
  }
  if (error) {
    return (
      <div className="flex w-full justify-center items-center">
        <p>{error}</p>
      </div>
    )
  }


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title="Payroll Runs"
          description={`${payrolls.length === 0 ? "" : ` ${payrolls.length === 1 ? `${payrolls.length} payroll` : `${payrolls.length} payrolls`}`} `} />

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              Run new Payroll
              <Plus className="ml-2 h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Run New Payroll</DialogTitle>
              <DialogDescription>
                Fill in the details below to start a new payroll run.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Payroll Code</Label>
                <Input
                  name="payrollCode"
                  placeholder="e.g. PAY-2024-MAR"
                  value={form.payrollCode}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    name="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Pay Date</Label>
                <Input
                  name="payDate"
                  type="date"
                  value={form.payDate}
                  onChange={handleChange}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createLoading}>
                  {createLoading ? <Spinner className="h-4 w-4 mr-2" /> : null}
                  Confirm & Run
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex w-full justify-end gap-2">
        <Button className="flex items-center gap-2 m-2" onClick={async () => {
          try {
            const res = await api.get('/payrolls/export', { responseType: 'blob' })
            const url = URL.createObjectURL(res.data)
            const a = document.createElement('a')
            a.href = url; a.download = `payroll-${Date.now()}.csv`; a.click()
            URL.revokeObjectURL(url)
          } catch { }
        }} variant={'outline'}>
          Export CSV
          <HugeiconsIcon icon={FileExportIcon} />
        </Button>
        <Button className="flex items-center gap-2 m-2" onClick={refetch} variant={'outline'} disabled={loading}>
          {loading ? <Spinner className="h-4 w-4" /> : <HugeiconsIcon icon={Refresh01Icon} />}
          Refresh
        </Button>
      </div>

      <div className="flex gap-4">
        <Input placeholder="Search..." />
        <Button variant={'outline'}>Filters</Button>
      </div>


      <DataTable
        columns={PayrollColumns}
        data={tableData}
        emptyMessage="Once there are payrolls to show you can view them here"
      />
    </div>
  )
}

export default Payrolls
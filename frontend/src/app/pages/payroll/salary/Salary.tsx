import { DataTable } from "@/app/components/DataTable/DataTable"
import { PageHeader } from "@/app/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SalaryColumns } from "./salary.column"
import { useEditSalaries, useSalaries } from "./salary.hooks"
import type { SalaryRow } from "./salary.column"
import { HugeiconsIcon } from "@hugeicons/react"
import { Refresh01Icon } from "@hugeicons/core-free-icons"
import { Pagination } from "@/app/components/Pagination"
import { CreateSalary, EditSalary } from "./salary.form"
import { Spinner } from "@/components/ui/spinner"
import { LoadingPage } from "@/app/components/LoadingPage"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConfirmDelete } from "@/app/components/DeleteConfirm"
import { useState } from "react"


function Salaries() {
  const { salaries, loading, error, refetch, page, total, limit, setPage, actionLoading, deleteSalary, search, setSearch, status, setStatus } = useSalaries()
  const edit = useEditSalaries({ refetch })

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean,
    type: 'delete' | null,
    id: string | null
  }>({ open: false, type: null, id: null })

  const handleConfirmAction = async () => {
    if (!confirmModal.id || !confirmModal.type) return


    let success = false
    success = await deleteSalary(confirmModal.id)


    if (success) {
      setConfirmModal({ open: false, type: null, id: null })
    }
  }


  const tableData: SalaryRow[] = salaries.map((salary, index) => ({
    id: salary.id,
    enr: (page - 1) * limit + index + 1,
    employeeName: salary.employeeName,
    amount: salary.amount,
    currency: salary.currency,
    effectiveDate: new Date(salary.effectiveDate).toLocaleDateString(),
    endDate: new Date(salary.endDate).toLocaleDateString(),
    payGrade: salary.payGrade,
    salaryType: salary.salaryType,
    status: salary.status,
    createdBy: salary.createdBy
  }))

  if (loading && salaries.length === 0) {
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
        <PageHeader title="Salaries"
          description={total === 0
            ? "No salaries add your first salary by clicking new button"
            : `${total} ${total === 1 ? "salary" : "salaries"}`}
        />
        <CreateSalary />
      </div>

      <div className="flex w-full justify-end">
        <Button className="flex items-center gap-2 m-2" onClick={refetch} variant={'outline'} disabled={loading}>
          {loading ? <Spinner className="h-4 w-4" /> : <HugeiconsIcon icon={Refresh01Icon} />}
          Refresh
        </Button>
      </div>

      <div className="flex gap-4">
        <Input placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={status || "all_status"}
          onValueChange={(value) => {
            setPage(1)
            setStatus(value === "all_status" ? "" : value)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a status"></SelectValue>
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectItem value="all_status">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <EditSalary
        open={edit.open}
        form={edit.form}
        loading={edit.loading}
        error={edit.error}
        onChange={edit.handleChange}
        onSelectChange={edit.handleSelectChange}
        onSubmit={edit.submitEdit}
        onClose={edit.closeEdit}
      />

      <DataTable
        columns={SalaryColumns({
          onEdit: edit.openEdit,
          onDelete: (id) => setConfirmModal({ type: 'delete', open: true, id })
        })}
        data={tableData}
        emptyMessage={loading ? "Loading..." : "Once there are salaries to show, you can view them here"}
      />

      <div>
        <Pagination
          page={page}
          total={total}
          limit={limit}
          onPageChange={setPage}
        />
      </div>

      <ConfirmDelete
        open={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, type: null, id: null })}
        onConfirm={handleConfirmAction}
        loading={!!actionLoading}
        buttonText={"Yes, delete"}
        title={confirmModal.type === 'delete' ? "Delete Salary" : `delete ""`}
        description={confirmModal.type === 'delete'
          ? "Are you sure you want to delete this salary? This action cannot be undone."
          : `Are you sure you want to "" this ""?`}

      />
    </div>
  )
}

export default Salaries
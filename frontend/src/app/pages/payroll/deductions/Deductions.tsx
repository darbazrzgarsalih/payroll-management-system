import { DataTable } from "@/app/components/DataTable/DataTable";
import { PageHeader } from "@/app/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeductionColumn, type DeductionRow } from "./deduction.column";
import { useDeductions, useEditDeductions } from "./deduction.hooks";
import { LoadingPage } from "@/app/components/LoadingPage";
import { HugeiconsIcon } from "@hugeicons/react";
import { Refresh01Icon } from "@hugeicons/core-free-icons";
import { CreateDeduction, EditDeduction } from "./deduction.form";
import { Pagination } from "@/app/components/Pagination";
import { ConfirmDelete } from "@/app/components/DeleteConfirm";
import { useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";



export default function Deduction() {
  const { deductions, loading, error, refetch, total, limit, page, setPage, status, setStatus, search, setSearch, actionLoading, voidDeduction } = useDeductions()
  const edit = useEditDeductions({ refetch })

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean,
    type: 'void' | null,
    id: string | null
  }>({ open: false, type: null, id: null })

  const handleConfirmAction = async () => {
    if (!confirmModal.id || !confirmModal.type) return


    let success = false
    success = await voidDeduction(confirmModal.id)


    if (success) {
      setConfirmModal({ open: false, type: null, id: null })
    }
  }


  const tableData: DeductionRow[] = deductions.map((deduction, index) => ({
    _id: deduction.id,
    enr: index + 1,
    name: deduction.name,
    employeeName: deduction.employeeName,
    type: deduction.type,
    startDate: deduction.startDate,
    endDate: deduction.endDate,
    totalAmount: deduction.totalAmount,
    remainingAmount: deduction.remainingAmount,
    frequency: deduction.frequency,
    status: deduction.status
  }))

  if (loading && deductions.length === 0) {
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
        <PageHeader title="Deduction"
          description={total === 0
            ? "No deductions add your first deduction by clicking new button"
            : `${total} ${total === 1 ? "deduction" : "deductions"}`}
        />

        <CreateDeduction />
      </div>

      <div className="flex w-full justify-end">
        <Button className="flex items-center gap-2 m-2" onClick={refetch} variant={'outline'}>
          Refresh
          <HugeiconsIcon icon={Refresh01Icon} />
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search..."
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
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="voided">Voided</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={DeductionColumn({
          onEdit: edit.openEdit,
          onVoid: (id) => setConfirmModal({ open: true, type: 'void', id })
        })}
        data={tableData}
        emptyMessage={loading ? "Loading..." : "Once there are deductions to show you can view them here"}
      />

      <EditDeduction
        open={edit.open}
        form={edit.form}
        loading={edit.loading}
        error={edit.error}
        onChange={edit.handleChange}
        onSubmit={edit.submitEdit}
        onClose={edit.closeEdit}
      />

      <div>
        <Pagination
          page={page}
          limit={limit}
          total={total}
          onPageChange={setPage}
        />
      </div>

      <ConfirmDelete
        open={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, type: null, id: null })}
        onConfirm={handleConfirmAction}
        loading={!!actionLoading}
        buttonText={"Yes, void"}
        title={confirmModal.type === 'void' ? "Void Deduction" : `void ""`}
        description={confirmModal.type === 'void'
          ? "Are you sure you want to void this deduction? This action cannot be undone."
          : `Are you sure you want to "" this ""?`}

      />
    </div>
  )
}

import { DataTable } from "@/app/components/DataTable/DataTable"
import { PageHeader } from "@/app/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { LoadingPage } from "@/app/components/LoadingPage"
import { Refresh01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useShifts, useDeactivateShift, useEditshifts } from "./shift.hooks"
import { ShiftColumns, type ShiftRow } from "./shift.column"
import { CreateShift, EditShift } from "./shift.form"
import { useState } from "react"
import { ConfirmDelete } from "@/app/components/DeleteConfirm"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination } from "@/app/components/Pagination"

function Shift() {
  const {
    shifts,
    loading,
    error,
    refetch,
    page,
    total,
    limit,
    setPage,
    status,
    setStatus
  } = useShifts()

  const edit = useEditshifts({ refetch })
  const deactivate = useDeactivateShift({ refetch })

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean
    id: string | null
  }>({ open: false, id: null })

  const handleConfirmDeactivate = async () => {
    if (!confirmModal.id) return

    const success = await deactivate.deactivateShift(confirmModal.id)
    if (success) {
      setConfirmModal({ open: false, id: null })
    }
  }

  const tableData: ShiftRow[] = shifts.map((shift, index) => ({
    _id: shift._id,
    enr: (page - 1) * limit + index + 1,
    name: shift.name,
    code: shift.code,
    startTime: shift.startTime,
    endTime: shift.endTime,
    breakMinutes: shift.breakMinutes,
    gracePeriodMinutes: shift.gracePeriodMinutes,
    overtimeThresholdMinutes: shift.overtimeThresholdMinutes,
    status: shift.status
  }))

  if (loading && shifts.length === 0) {
    return (
      <LoadingPage />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          title="Shifts"
          description={
            total === 0
              ? "No shifts added yet."
              : `${total} ${total === 1 ? "shift" : "shifts"}`
          }
        />
        <CreateShift
        />
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="flex w-full justify-end">
        <Button className="flex items-center gap-2 m-2" onClick={refetch} variant="outline" disabled={loading}>
          {loading ? <Spinner className="h-4 w-4" /> : <HugeiconsIcon icon={Refresh01Icon} />}
          Refresh
        </Button>
      </div>

      <div className="flex gap-4 justify-end">
        <Select
          value={status || "all_status"}
          onValueChange={(value) => {
            setPage(1)
            setStatus(value === "all_status" ? "" : value)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
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

      <DataTable
        columns={ShiftColumns({
          onEdit: edit.openEdit,
          onDeactivate: (id) => setConfirmModal({ open: true, id })
        })}
        data={tableData}
        emptyMessage={loading ? "Loading..." : "Once there are shifts to show, you can view them here"}
      />

      <EditShift
        open={edit.open}
        form={edit.form}
        loading={edit.loading}
        error={edit.error}
        onChange={edit.handleChange}
        onSubmit={edit.submitEdit}
        onClose={edit.closeEdit}
      />

      {total > 0 && (
        <Pagination
          page={page}
          total={total}
          limit={limit}
          onPageChange={setPage}
        />
      )}

      <ConfirmDelete
        open={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, id: null })}
        onConfirm={handleConfirmDeactivate}
        loading={!!deactivate.loadingId}
        buttonText="Yes, Deactivate"
        title="Deactivate Shift"
        description="Are you sure you want to deactivate this shift?"
      />
    </div>
  )
}

export default Shift
import { DataTable } from "@/app/components/DataTable/DataTable"
import { PageHeader } from "@/app/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { leaveColumns } from "./leave.column"
import { useApproveLeaves, useLeaves, useRejectLeaves } from "./leave.hooks"
import { LoadingPage } from "@/app/components/LoadingPage"
import { Spinner } from "@/components/ui/spinner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Refresh01Icon, FileExportIcon } from "@hugeicons/core-free-icons"
import { Pagination } from "@/app/components/Pagination"
import { ApplyLeave } from "./leave.form"
import { mapLeavesToRows } from "./leave.mapper"
import { useState } from "react"
import { ConfirmDelete } from "@/app/components/DeleteConfirm"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function Leaves() {
  const { leaves, loading, error, refetch, limit, page, total, setPage, status, setStatus, search, setSearch, exportData, exportLoading } = useLeaves()
  const { approveLeave, loadingApprove } = useApproveLeaves({ refetch })
  const { rejectLeave, loadingReject } = useRejectLeaves({ refetch })

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean,
    type: 'approve' | 'reject' | null,
    id: string | null
  }>({ open: false, type: null, id: null })

  const handleConfirmAction = async () => {
    if (!confirmModal.id || !confirmModal.type) return

    let success = false
    switch (confirmModal.type) {
      case 'approve':
        success = await approveLeave(confirmModal.id)
        break
      case 'reject':
        success = await rejectLeave(confirmModal.id)
        break
    }

    if (success) {
      setConfirmModal({ open: false, type: null, id: null })
    }
  }

  const tableData = mapLeavesToRows(leaves, page, limit)

  if (loading && leaves.length === 0) {
    return (
      <LoadingPage />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          title="Leaves"
          description={total === 0
            ? "No leaves add your first leave by clicking new button"
            : `${total} ${total === 1 ? "leave" : "leaves"}`}
        />
        <ApplyLeave />
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="flex w-full justify-end gap-2">
        <Button
          className="flex items-center gap-2 m-2"
          onClick={exportData}
          variant="outline"
          disabled={exportLoading}
        >
          {exportLoading ? <Spinner className="h-4 w-4" /> : "Export CSV"}
          {!exportLoading && <HugeiconsIcon icon={FileExportIcon} />}
        </Button>
        <Button
          className="flex items-center gap-2 m-2"
          onClick={refetch}
          variant="outline"
          disabled={loading}
        >
          {loading ? <Spinner className="h-4 w-4" /> : "Refresh"}
          {!loading && <HugeiconsIcon icon={Refresh01Icon} />}
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setPage(1)
            setSearch(e.target.value)
          }}
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
              <SelectItem value="pending">pending</SelectItem>
              <SelectItem value="approved">approved</SelectItem>
              <SelectItem value="rejected">rejected</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={leaveColumns({
          onApprove: (id) => setConfirmModal({ open: true, type: 'approve', id }),
          onReject: (id) => setConfirmModal({ open: true, type: 'reject', id })
        })}
        data={tableData}
        emptyMessage={loading ? "Loading..." : "Once there are leave requests to show, you can view them here"}
      />

      {total > 0 && (
        <Pagination
          page={page}
          limit={limit}
          total={total}
          onPageChange={setPage}
        />
      )}

      <ConfirmDelete
        open={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, type: null, id: null })}
        onConfirm={handleConfirmAction}
        loading={loadingApprove || loadingReject}
        buttonText={
          confirmModal.type === 'approve'
            ? "Yes, Approve"
            : "Yes, Reject"
        }
        title={
          confirmModal.type === 'approve'
            ? "Approve Leave"
            : "Reject Leave"
        }
        description={
          confirmModal.type === 'approve'
            ? "Are you sure you want to approve this leave? This action cannot be undone."
            : "Are you sure you want to reject this leave? This action cannot be undone."
        }
      />
    </div>
  )
}

export default Leaves
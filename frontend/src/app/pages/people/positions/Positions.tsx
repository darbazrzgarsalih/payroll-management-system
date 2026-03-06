import { DataTable } from "@/app/components/DataTable/DataTable"
import { PageHeader } from "@/app/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { positionColumns } from "./position.column"
import { useEditPositions, usePositions } from "./position.hooks"
import { HugeiconsIcon } from "@hugeicons/react"
import { Refresh01Icon } from "@hugeicons/core-free-icons"
import { Spinner } from "@/components/ui/spinner"
import { LoadingPage } from "@/app/components/LoadingPage"
import { Pagination } from "@/app/components/Pagination"
import { CreatePosition, EditPosition } from "./position.form"
import { mapPositionsToRows } from "./position.mapper"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { ConfirmDelete } from "@/app/components/DeleteConfirm"

function Positions() {
  const { positions, loading, error, refetch, page, total, limit, setPage, status, setStatus, search, setSearch, deletePosition, actionLoading } = usePositions()
  const edit = useEditPositions({ refetch })
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean,
    type: 'delete' | null,
    id: string | null
  }>({ open: false, type: null, id: null })

  const handleConfirmAction = async () => {
    if (!confirmModal.id || !confirmModal.type) return


    let success = false
    success = await deletePosition(confirmModal.id)


    if (success) {
      setConfirmModal({ open: false, type: null, id: null })
    }
  }

  const tableData = mapPositionsToRows(positions, page, limit)

  if (loading && positions.length === 0) {
    return (
      <LoadingPage />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center">
          <PageHeader
            title="Positions"
            description={total === 0
              ? "No positions add your first position by clicking new button"
              : `${total} ${total === 1 ? "position" : "positions"}`}
          />
          <CreatePosition />
        </div>

        {error && (
          <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm my-4">
            {error}
          </div>
        )}

        <div className="flex w-full justify-end">
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
            placeholder="Search positions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_status">All status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <EditPosition
          open={edit.open}
          form={edit.form}
          loading={edit.loading}
          error={edit.error}
          onChange={edit.handleChange}
          onSelectChange={edit.handleSelectChange}
          onSubmit={edit.submitEdit}
          onClose={edit.closeEdit}
          departments={edit.departments}
        />

        <div className="mt-5">
          <DataTable
            columns={positionColumns({
              onEdit: edit.openEdit,
              onDelete: (id) => setConfirmModal({ open: true, type: 'delete', id })
            })}
            data={tableData}
            emptyMessage={loading ? "Loading..." : "Once there are positions to show, you can view them here"}
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
            onClose={() => setConfirmModal({ open: false, type: null, id: null })}
            onConfirm={handleConfirmAction}
            loading={!!actionLoading}
            buttonText={"Delete"}
            title={confirmModal.type === 'delete' ? "Delete Position" : `Delete ""`}
            description={confirmModal.type === 'delete'
              ? "Are you sure you want to delete this position? This action cannot be undone."
              : `Are you sure you want to "" this ""?`}
          />
        </div>
      </div>
    </div>
  )
}

export default Positions
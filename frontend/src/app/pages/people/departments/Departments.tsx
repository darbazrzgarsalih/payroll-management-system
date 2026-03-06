import { DataTable } from "@/app/components/DataTable/DataTable"
import { PageHeader } from "@/app/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { departmentColumns } from "./department.column"
import { useDepartments, useEditDepartment } from "./department.hooks"
import { Spinner } from "@/components/ui/spinner"
import { LoadingPage } from "@/app/components/LoadingPage"
import { HugeiconsIcon } from "@hugeicons/react"
import { Refresh01Icon } from "@hugeicons/core-free-icons"
import { Pagination } from "@/app/components/Pagination"
import { CreateDepartment, EditDepartment } from "./department.form"
import { mapDepartmentsToRows } from "./department.mappers"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { ConfirmDelete } from "@/app/components/DeleteConfirm"

function Departments() {
  const { departments, loading, error, refetch, page, limit, total, setPage, search, setSearch, status, setStatus, deleteDepartment, actionLoading } = useDepartments()
  const edit = useEditDepartment({ refetch })
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean,
    type: 'delete' | null,
    id: string | null
  }>({ open: false, type: null, id: null })

  const handleConfirmAction = async () => {
    if (!confirmModal.id || !confirmModal.type) return


    let success = false
    success = await deleteDepartment(confirmModal.id)


    if (success) {
      setConfirmModal({ open: false, type: null, id: null })
    }
  }

  const tableData = mapDepartmentsToRows(departments, page, limit)

  if (loading && departments.length === 0) {
    return (
      <LoadingPage />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          title="Departments"
          description={total === 0
            ? "No departments add your first department by clicking new button"
            : `${total} ${total === 1 ? "department" : "departments"}`}
        />
        <CreateDepartment />
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="flex w-full justify-end">
        <Button
          className="flex items-center gap-2"
          onClick={refetch}
          variant="outline"
          disabled={loading}
        >
          {loading ? <Spinner className="h-4 w-4" /> : "Refresh"}
          <HugeiconsIcon icon={Refresh01Icon} />
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search department..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />

        <Select value={status} onValueChange={(value) => {
          setStatus(value)
          setPage(1)
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Select a status"></SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Button variant={'outline'} onClick={() => {
          setSearch("")
          setStatus("")
        }}>
          Clear all filters
        </Button>
      </div>

      <EditDepartment
        open={edit.open}
        form={edit.form}
        loading={edit.loading}
        error={edit.error}
        onChange={edit.handleChange}
        onSubmit={edit.submitEdit}
        onClose={edit.closeEdit}
      />

      <DataTable
        columns={departmentColumns({
          onEdit: edit.openEdit,
          onDelete: (id) => setConfirmModal({ open: true, type: 'delete', id })
        })}
        data={tableData}
        emptyMessage={loading ? "Loading..." : "Once there are departments to show, you can view them here"}
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
        title={confirmModal.type === 'delete' ? "Delete Department" : `Delete ""`}
        description={confirmModal.type === 'delete'
          ? "Are you sure you want to delete this department? This action cannot be undone."
          : `Are you sure you want to "" this ""?`}
      />
    </div>
  )
}

export default Departments
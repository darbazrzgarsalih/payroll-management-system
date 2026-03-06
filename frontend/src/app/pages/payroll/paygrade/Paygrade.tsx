import { DataTable } from "@/app/components/DataTable/DataTable"
import { PageHeader } from "@/app/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PaygradeColumns } from "./paygrade.column"
import type { PaygradeRow } from "./paygrade.column"
import { HugeiconsIcon } from "@hugeicons/react"
import { Refresh01Icon } from "@hugeicons/core-free-icons"
import { useEditPaygrades, usePaygrades } from "./paygrade.hooks"
import { LoadingPage } from "@/app/components/LoadingPage"
import { Pagination } from "@/app/components/Pagination"
import { CreatePaygrade, EditPaygrade } from "./paygrade.form"
import { useState } from "react"
import { ConfirmDelete } from "@/app/components/DeleteConfirm"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function Paygrades() {
  const { paygrades, loading, error, refetch, page, total, limit, setPage, actionLoading, status, setStatus, setSearch, search, deletePaygrade } = usePaygrades()
  const edit = useEditPaygrades({ refetch })

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean,
    type: 'delete' | null,
    id: string | null
  }>({ open: false, type: null, id: null })

  const handleConfirmAction = async () => {
    if (!confirmModal.id || !confirmModal.type) return


    let success = false
    success = await deletePaygrade(confirmModal.id)


    if (success) {
      setConfirmModal({ open: false, type: null, id: null })
    }
  }

  const tableData: PaygradeRow[] = paygrades.map((paygrade, index) => ({
    id: paygrade.id,
    enr: (page - 1) * limit + index + 1,
    name: paygrade.name,
    level: paygrade.level,
    minSalary: paygrade.minSalary,
    maxSalary: paygrade.maxSalary,
    currency: paygrade.currency,
    description: paygrade.description,
    status: paygrade.status
  }))

  if (loading && paygrades.length === 0) {
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
        <PageHeader title="Paygrades"
          description={total === 0
            ? "No paygrades add your first paygrade by clicking new button"
            : `${total} ${total === 1 ? "paygrade" : "paygrades"}`}

        />
        <CreatePaygrade />
      </div>

      <div className="flex w-full justify-end">
        <Button className="flex items-center gap-2 m-2" onClick={refetch} variant={'outline'}>
          Refresh
          <HugeiconsIcon icon={Refresh01Icon} />
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

      <EditPaygrade
        open={edit.open}
        form={edit.form}
        loading={edit.loading}
        error={edit.error}
        onChange={edit.handleChange}
        onSubmit={edit.submitEdit}
        onClose={edit.closeEdit}
      />

      <DataTable
        columns={PaygradeColumns({
          onEdit: edit.openEdit,
          onDelete: (id) => setConfirmModal({ open: true, type: 'delete', id })
        })}
        data={tableData}
        emptyMessage={loading ? "Loading..." : "Once there are paygrades to show, you can view them here"}
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
        buttonText={"Yes, delete"}
        title={confirmModal.type === 'delete' ? "Delete Paygrade" : `delete ""`}
        description={confirmModal.type === 'delete'
          ? "Are you sure you want to delete this paygrade? This action cannot be undone."
          : `Are you sure you want to "" this ""?`}

      />
    </div>
  )
}

export default Paygrades
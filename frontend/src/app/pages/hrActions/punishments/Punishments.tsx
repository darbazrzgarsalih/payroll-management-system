import { DataTable } from "@/app/components/DataTable/DataTable"
import { PageHeader } from "@/app/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PunishmentColumns, type PunishmentRow } from "./punishment.column"
import { useEditPunishments, usePunishments } from "./punishment.hooks"
import { LoadingPage } from "@/app/components/LoadingPage"
import { Refresh01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Pagination } from "@/app/components/Pagination"
import { CreatePunishment, EditPunishment } from "./punishment.form"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConfirmDelete } from "@/app/components/DeleteConfirm"
import { useState } from "react"


function Punishments() {
  const {
    punishments,
    loading,
    error,
    refetch,
    page,
    total,
    limit,
    status,
    setStatus,
    search,
    setSearch,
    actionLoading,
    voidPunishment,
    setPage
  }
    = usePunishments()
  const edit = useEditPunishments({ refetch })

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean,
    type: 'void' | null,
    id: string | null
  }>({ open: false, type: null, id: null })

  const handleConfirmAction = async () => {
    if (!confirmModal.id || !confirmModal.type) return


    let success = false
    success = await voidPunishment(confirmModal.id)


    if (success) {
      setConfirmModal({ open: false, type: null, id: null })
    }
  }


  const tableData: PunishmentRow[] = punishments.map((punishment, index) => ({
    id: punishment.id,
    enr: (page - 1) * limit + index + 1,
    name: punishment.name,
    employeeName: punishment.employeeName,
    type: punishment.type,
    frequency: punishment.frequency,
    totalAmount: punishment.totalAmount,
    remainingAmount: punishment.remainingAmount,
    startDate: new Date(punishment.startDate).toLocaleDateString(),
    endDate: new Date(punishment.endDate).toLocaleDateString(),
    status: punishment.status
  }))
  if (loading && punishments.length === 0) {
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
        <PageHeader title="Punishments"
          description={total === 0
            ? "No punishments add your first punishment by clicking new button"
            : `${total} ${total === 1 ? "punishment" : "punishments"}`}
        />
        <CreatePunishment />
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
              <SelectItem value="voided">Voided</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <EditPunishment
        open={edit.open}
        form={edit.form}
        loading={edit.loading}
        error={edit.error}
        onChange={edit.handleChange}
        onSubmit={edit.submitEdit}
        onClose={edit.closeEdit}
      />

      <DataTable
        columns={PunishmentColumns({
          onEdit: edit.openEdit,
          onDelete: (id) => setConfirmModal({ open: true, type: 'void', id })
        })}
        data={tableData}
        emptyMessage={loading ? "Loading..." : "Once there are punishments to show you can view them here"}
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
        buttonText={"Void"}
        title={confirmModal.type === 'void' ? "Void Punishment" : `void ""`}
        description={confirmModal.type === 'void'
          ? "Are you sure you want to void this punishment? This action cannot be undone."
          : `Are you sure you want to "" this ""?`}

      />
    </div>

  )
}

export default Punishments
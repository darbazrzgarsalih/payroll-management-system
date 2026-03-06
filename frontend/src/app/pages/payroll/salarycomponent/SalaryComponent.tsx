import { DataTable } from "@/app/components/DataTable/DataTable"
import { PageHeader } from "@/app/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SalaryComponentColumns, type SalaryComponentRow } from "./salarycomponent.column"
import { useEditSalaryComponents, useSalaryComponents } from "./salarycomponent.hooks"
import { Spinner } from "@/components/ui/spinner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Refresh01Icon } from "@hugeicons/core-free-icons"
import { CreateSalaryComponent, EditSalaryComponent } from "./salarycomponent.form"
import { Pagination } from "@/app/components/Pagination"
import { Select, SelectContent, SelectGroup, SelectItem, SelectValue } from "@/components/ui/select"
import { SelectTrigger } from "@radix-ui/react-select"
import { useState } from "react"
import { ConfirmDelete } from "@/app/components/DeleteConfirm"



function SalaryComponents() {
  const { salaryComponents, loading, error, refetch, total, limit, page, setPage, status, setStatus, search, setSearch, actionLoading, deactivateSalaryComponent } = useSalaryComponents()
  const edit = useEditSalaryComponents({ refetch })

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean,
    type: 'deactivate' | null,
    id: string | null
  }>({ open: false, type: null, id: null })

  const handleConfirmAction = async () => {
    if (!confirmModal.id || !confirmModal.type) return


    let success = false
    success = await deactivateSalaryComponent(confirmModal.id)


    if (success) {
      setConfirmModal({ open: false, type: null, id: null })
    }
  }


  const tableData: SalaryComponentRow[] = salaryComponents.map((salarycomp, index) => ({
    id: (salarycomp as any)._id ?? salarycomp.id,
    enr: index + 1,
    name: salarycomp.name,
    description: salarycomp.description ?? "No desc",
    type: salarycomp.type ?? "Not provided",
    category: salarycomp.category ?? "Not provided",
    effectiveFrom: salarycomp.effectiveFrom ?? "Not provided",
    applicableFor: salarycomp.applicableFor ?? "Not provided",
    status: salarycomp.status
  }))

  if (loading) {
    return (
      <div className="flex text-muted-foreground gap-4 justify-center items-center h-screen">
        <Spinner className="h-5 w-5" />
      </div>
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
        <PageHeader title="Salary Components"
          description={total === 0
            ? "No salary components add your first salary component by clicking new button"
            : `${total} ${total === 1 ? "salary component" : "salary components"}`}
        />
        <CreateSalaryComponent />
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <EditSalaryComponent
        open={edit.open}
        form={edit.form}
        loading={edit.loading}
        error={edit.error}
        onChange={edit.handleChange}
        onSubmit={edit.submitEdit}
        onClose={edit.closeEdit}
      />

      <DataTable
        columns={SalaryComponentColumns({
          onEdit: edit.openEdit,
          onDeactivate: (id) => setConfirmModal({ type: 'deactivate', open: true, id })
        })}
        data={tableData}
        emptyMessage={loading ? "Loading..." : "Once there are salary components to show, you can view them here"}
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
        buttonText={"Yes, Deactivate"}
        title={confirmModal.type === 'deactivate' ? "Deactivate Salary Component" : `deactivate ""`}
        description={confirmModal.type === 'deactivate'
          ? "Are you sure you want to deactivate this salary component? This action cannot be undone."
          : `Are you sure you want to "" this ""?`}

      />
    </div>
  )
}

export default SalaryComponents
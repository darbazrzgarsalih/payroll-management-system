import { PageHeader } from "@/app/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/app/components/DataTable/DataTable"
import { employeeColumns } from "./employee.column"
import { useEditEmployee, useEmployees, useImportEmployees } from "./employee.hooks"
import { Spinner } from "@/components/ui/spinner"
import { LoadingPage } from "@/app/components/LoadingPage"
import { HugeiconsIcon } from "@hugeicons/react"
import { Refresh01Icon, Upload01Icon, FileExportIcon } from "@hugeicons/core-free-icons"

import { Pagination } from "@/app/components/Pagination"
import { TextItem } from "@/app/utils/ItemMappers"
import { CreateEmployee, EditEmployee } from "./employee.form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ConfirmDelete } from "@/app/components/DeleteConfirm"
import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import api from "@/app/services/api"


function Employee() {
  const navigate = useNavigate()
  const {
    employees,
    loading,
    refetch,
    page,
    limit,
    total,
    setPage,
    status,
    setStatus,
    search,
    setSearch,
    deleteEmployee,
    terminateEmployee,
    actionLoading,
    exportData,
    exportLoading,
  } = useEmployees()


  const edit = useEditEmployee({ refetch })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { importData, loading: importLoading } = useImportEmployees({ refetch })

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await importData(file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }


  const [departments, setDepartments] = useState<{ value: string; label: string }[]>([])
  const [positions, setPositions] = useState<{ value: string; label: string }[]>([])
  useEffect(() => {
    api.get('/departments').then(r => {
      const depts = r.data?.departments || []
      setDepartments(depts.map((d: any) => ({ value: d._id || d.id, label: d.name })))
    }).catch(() => { })
    api.get('/positions').then(r => {
      const pos = r.data?.positions || []
      setPositions(pos.map((p: any) => ({ value: p._id || p.id, label: p.title || p.name })))
    }).catch(() => { })
  }, [])

  const handleEditSelectChange = (name: string, value: string) => {
    edit.setForm((prev: any) => ({ ...prev, [name]: value }))
  }

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: 'delete' | 'terminate' | null;
    id: string | null;
  }>({ open: false, type: null, id: null })

  const handleConfirmAction = async () => {
    if (!confirmModal.id || !confirmModal.type) return

    let success = false
    if (confirmModal.type === 'delete') {
      success = await deleteEmployee(confirmModal.id)
    } else {
      success = await terminateEmployee(confirmModal.id)
    }

    if (success) {
      setConfirmModal({ open: false, type: null, id: null })
    }
  }

  const tableData = employees.map((emp, index) => ({
    id: emp.id,
    enr: (page - 1) * limit + index + 1,
    employeeName: TextItem(emp.employeeName ?? "No name"),
    email: TextItem(emp.email ?? "No email"),
    department: TextItem(emp.department ?? "No department"),
    position: TextItem(emp.position ?? "No position"),
    shift: TextItem(emp.shift ?? "No shift"),
    gender: TextItem(emp.gender ?? "Not provided"),
    address: TextItem((emp.address?.country || "") + "," + (emp.address?.city || "")),
    status: TextItem(emp.status ?? "No status"),
    avatar: emp.avatar
  }))

  if (loading) {
    return <LoadingPage />
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center">
          <PageHeader title="Employees"
            description={`${total === 0 ? "" : ` ${total === 1 ? `${total} employee` : `${total} employees`}`} `} />
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportData} disabled={exportLoading}>
              {exportLoading ? <Spinner className="w-4 h-4 mr-2" /> : <HugeiconsIcon icon={FileExportIcon} className="w-4 h-4 mr-2" />}
              Export CSV
            </Button>
            <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={importLoading}>
              {importLoading ? <Spinner className="w-4 h-4 mr-2" /> : <HugeiconsIcon icon={Upload01Icon} className="w-4 h-4 mr-2" />}
              Import CSV
            </Button>
            <CreateEmployee />
          </div>
        </div>


        <div className="flex w-full justify-end">
          <Button className="flex items-center gap-2 m-2" onClick={refetch} variant={'outline'}>
            Refresh
            <HugeiconsIcon icon={Refresh01Icon} />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4 items-center w-full">
            <Input
              placeholder="Search by name, email or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_status">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-start">
            <Button variant="outline" size="sm" onClick={() => {
              setSearch("")
              setStatus("")
            }}>Clear Filters</Button>
          </div>
        </div>

        <EditEmployee
          open={edit.open}
          form={{ ...edit.form, _departments: departments, _positions: positions }}
          loading={edit.loading}
          error={edit.error}
          onChange={edit.handleChange}
          onSelectChange={handleEditSelectChange}
          onSubmit={edit.submitEdit}
          onClose={edit.closeEdit}
          onFileChange={edit.handleFileChange}
          avatarFile={edit.avatarFile}
        />


        <div className="mt-5">
          <DataTable
            columns={employeeColumns({
              onEdit: edit.openEdit,
              onDelete: (id) => setConfirmModal({ open: true, type: 'delete', id }),
              onTerminate: (id) => setConfirmModal({ open: true, type: 'terminate', id }),
              onView: (id) => navigate(`/app/employees/${id}/profile`)
            })}
            data={tableData}
            emptyMessage={`${loading ? <Spinner /> : "Once there are employees to show, you can view them here"} `}
          />


          <Pagination
            page={page}
            total={total}
            limit={limit}
            onPageChange={setPage}
          />

          <ConfirmDelete
            open={confirmModal.open}
            onClose={() => setConfirmModal({ open: false, type: null, id: null })}
            onConfirm={handleConfirmAction}
            loading={!!actionLoading}
            buttonText={"Delete"}
            title={confirmModal.type === 'delete' ? "Delete Employee" : "Deactivate Employee"}
            description={confirmModal.type === 'delete'
              ? "Are you sure you want to delete this employee? This action cannot be undone."
              : "Are you sure you want to deactivate this employee?"}
          />
        </div>
      </div>
    </div>
  )
}

export default Employee
import { DataTable } from "@/app/components/DataTable/DataTable"
import { PageHeader } from "@/app/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserColumns, type UserRow } from "./user.column"
import { useEditUsers, useUsers } from "./user.hooks"
import { HugeiconsIcon } from "@hugeicons/react"
import { Refresh01Icon } from "@hugeicons/core-free-icons"
import { Pagination } from "@/app/components/Pagination"
import { CreateUser, EditUser } from "./user.form"
import { LoadingPage } from "@/app/components/LoadingPage"
import { useState } from "react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConfirmDelete } from "@/app/components/DeleteConfirm"

function Users() {
  const {
    users,
    loading,
    error,
    refetch,
    page,
    total,
    limit,
    setPage,
    status,
    setSearch,
    search,
    setStatus,
    actionLoading,
    deleteUser
  }
    = useUsers()

  const edit = useEditUsers({ refetch })

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean,
    type: 'delete' | null,
    id: string | null
  }>({ open: false, type: null, id: null })

  const handleConfirmAction = async () => {
    if (!confirmModal.id || !confirmModal.type) return


    let success = false
    success = await deleteUser(confirmModal.id)


    if (success) {
      setConfirmModal({ open: false, type: null, id: null })
    }
  }

  const tableData: UserRow[] = users.map((user, index) => ({
    id: user.id,
    enr: (page - 1) * limit + index + 1,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    employeeName: user.role === 'employee' ? user.employeeName : "Not an employee",
    lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Not logged in",
    status: user.status,
    avatar: user.avatar
  }))

  if (loading && users.length === 0) {
    return (
      <LoadingPage />
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center w-full">
        <p>{error}</p>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title="Users"
          description={total === 0
            ? "No users add your first user by clicking new button"
            : `${total} ${total === 1 ? "user" : "users"}`}
        />

        <CreateUser />
      </div>

      <div className="flex w-full justify-end">
        <Button
          className="flex items-center gap-2 m-2"
          onClick={refetch}
          variant={'outline'}
          disabled={loading}
        >
          {loading ? (
            <HugeiconsIcon icon={Refresh01Icon} className="animate-spin" />
          ) : (
            <>
              Refresh
              <HugeiconsIcon icon={Refresh01Icon} />
            </>
          )}
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

      <EditUser
        open={edit.open}
        form={edit.form}
        loading={edit.loading}
        error={edit.error}
        onChange={edit.handleChange}
        onSelectChange={edit.handleSelectChange}
        onSubmit={edit.submitEdit}
        onClose={edit.closeEdit}
        onFileChange={edit.handleFileChange}
        avatarFile={edit.avatarFile}
      />

      <DataTable
        columns={UserColumns({
          onEdit: edit.openEdit,
          onDelete: (id) => setConfirmModal({ open: true, type: 'delete', id })
        })}
        data={tableData}
        emptyMessage="Once there are users to show, you can view them here"
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
        buttonText={"Delete"}
        title={confirmModal.type === 'delete' ? "Delete User" : `Delete ""`}
        description={confirmModal.type === 'delete'
          ? "Are you sure you want to delete this user? This action cannot be undone."
          : `Are you sure you want to "" this ""?`}
      />
    </div>
  )
}

export default Users
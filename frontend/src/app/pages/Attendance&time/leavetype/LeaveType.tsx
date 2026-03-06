import { DataTable } from "@/app/components/DataTable/DataTable"
import { PageHeader } from "@/app/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LeaveTypeColumns, type LeaveTypeRow } from "./leavetype.column"
import { useEditLeaveTypes, useLeaveTypes } from "./leavetype.hooks"
import { LoadingPage } from "@/app/components/LoadingPage"
import { Refresh01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Pagination } from "@/app/components/Pagination"
import { CreateLeavetype, EditLeaveType } from "./leavetype.form"
import { useState } from "react"
import { ConfirmDelete } from "@/app/components/DeleteConfirm"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


function LeaveTypes() {
    const { leaveTypes, loading, refetch, page,
        total,
        limit,
        actionLoading,
        search,
        setSearch,
        status,
        setStatus,
        deactivateLeaveType,
        setPage } = useLeaveTypes()
    const edit = useEditLeaveTypes({ refetch })

    const [confirmModal, setConfirmModal] = useState<{
        open: boolean,
        type: 'deactivate' | null,
        id: string | null
    }>({ open: false, type: null, id: null })

    const handleConfirmAction = async () => {
        if (!confirmModal.id || !confirmModal.type) return


        let success = false
        success = await deactivateLeaveType(confirmModal.id)


        if (success) {
            setConfirmModal({ open: false, type: null, id: null })
        }
    }

    const tableData: LeaveTypeRow[] = leaveTypes.map((leaveType, index) => ({
        id: leaveType.id,
        enr: (page - 1) * limit + index + 1,
        name: leaveType.name,
        defaultDays: leaveType.defaultDays,
        status: leaveType.status
    }))

    if (loading && leaveTypes.length === 0) return <LoadingPage />
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <PageHeader title="Leave Types"
                    description={total === 0
                        ? "No leave types add your first leave type by clicking new button"
                        : `${total} ${total === 1 ? "leave type" : "leave types"}`}
                />
                <CreateLeavetype />
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

            <DataTable
                columns={LeaveTypeColumns({
                    onEdit: edit.openEdit,
                    onDeactivate: (id) => setConfirmModal({ open: true, type: 'deactivate', id })
                })}
                data={tableData}
                emptyMessage="Once there are leave types to show, you can view them here"
            />

            <EditLeaveType
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
                title={confirmModal.type === 'deactivate' ? "Deactivate Leave Type" : `deactivate ""`}
                description={confirmModal.type === 'deactivate'
                    ? "Are you sure you want to deactivate this leave type? This action cannot be undone."
                    : `Are you sure you want to "" this ""?`}

            />
        </div>
    )
}

export default LeaveTypes

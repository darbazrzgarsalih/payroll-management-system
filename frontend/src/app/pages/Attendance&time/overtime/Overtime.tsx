import { DataTable } from "@/app/components/DataTable/DataTable"
import { Pagination } from "@/app/components/Pagination"
import { OvertimeColumns } from "./overtime.column"
import { Spinner } from "@/components/ui/spinner"
import { LoadingPage } from "@/app/components/LoadingPage"
import { useEditOvertimes, useOvertimes } from "./overtime.hooks"
import { PageHeader } from "@/app/components/PageHeader"
import { CreateOvertime, EditOvertime } from "./overtime.form"
import { useState } from "react"
import { ConfirmDelete } from "@/app/components/DeleteConfirm"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { FileExportIcon, Refresh01Icon } from "@hugeicons/core-free-icons"
import { Input } from "@/components/ui/input"

function Overtimes() {
    const {
        overtimes,
        loading,
        page,
        limit,
        total,
        setPage,
        refetch,
        voidOvertime,
        actionLoading,
        status,
        setStatus,
        search,
        setSearch,
        exportData,
        exportLoading
    } = useOvertimes()

    const edit = useEditOvertimes({ refetch })

    const [confirmModal, setConfirmModal] = useState<{
        open: boolean,
        type: 'void' | null,
        id: string | null
    }>({ open: false, type: null, id: null })

    const handleConfirmAction = async () => {
        if (!confirmModal.id || !confirmModal.type) return


        let success = false
        success = await voidOvertime(confirmModal.id)


        if (success) {
            setConfirmModal({ open: false, type: null, id: null })
        }
    }

    const tableData = overtimes.map((ovt, index) => ({
        _id: ovt.id,
        enr: (page - 1) * limit + index + 1,
        payrollName: ovt.payrollName,
        employeeName: ovt.employeeName,
        date: ovt.date,
        hours: ovt.hours,
        rate: ovt.rate,
        multiplier: ovt.multiplier,
        amount: ovt.amount,
        status: ovt.status
    }))

    if (loading && overtimes.length === 0) return <LoadingPage />

    return (
        <div>
            <div className="w-full flex justify-between items-center">
                <PageHeader
                    title="Overtimes"
                    description={total === 0
                        ? "No overtimes add your first overtime by clicking new button"
                        : `${total} ${total === 1 ? "overtime" : "overtimes"}`}
                />
                <div className="flex gap-2">
                    <Button variant="outline" onClick={exportData} disabled={exportLoading}>
                        {exportLoading ? <Spinner className="w-4 h-4 mr-2" /> : <HugeiconsIcon icon={FileExportIcon} className="w-4 h-4 mr-2" />}
                        Export CSV
                    </Button>
                    <CreateOvertime />
                </div>
            </div>

            <div className="flex w-full justify-between mt-4 mb-4">
                <div className="flex gap-4">
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
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="voided">Voided</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Input
                        placeholder="Search employee..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-xs"
                    />
                </div>
                <div className="flex justify-end">
                    <Button
                        className="flex items-center gap-2"
                        onClick={refetch}
                        variant="outline"
                        disabled={loading}
                    >
                        {loading ? <Spinner className="h-4 w-4" /> : "Refresh"}
                        {!loading && <HugeiconsIcon icon={Refresh01Icon} />}
                    </Button>
                </div>
            </div>


            <DataTable columns={OvertimeColumns({
                onEdit: edit.openEdit,
                onVoid: (id) => setConfirmModal({ open: true, type: 'void', id })
            })}
                data={tableData}
                emptyMessage="Once there are overtimes to show, you can view them here"
            />

            <EditOvertime
                open={edit.open}
                form={edit.form}
                loading={edit.loading}
                error={edit.error}
                onChange={edit.handleChange}
                onSubmit={edit.submitEdit}
                onClose={edit.closeEdit}
            />

            <Pagination
                page={page}
                limit={limit}
                total={total}
                onPageChange={setPage}
            />

            <ConfirmDelete
                open={confirmModal.open}
                onClose={() => setConfirmModal({ open: false, type: null, id: null })}
                onConfirm={handleConfirmAction}
                loading={!!actionLoading}
                buttonText={"Yes, void"}
                title={confirmModal.type === 'void' ? "Void Overtime" : `void ""`}
                description={confirmModal.type === 'void'
                    ? "Are you sure you want to void this overtime? This action cannot be undone."
                    : `Are you sure you want to "" this ""?`}

            />
        </div>
    )
}

export default Overtimes

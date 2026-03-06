import { useState } from "react"
import { DataTable } from "@/app/components/DataTable/DataTable"
import { PageHeader } from "@/app/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { LoadingPage } from "@/app/components/LoadingPage"
import { ConfirmDelete } from "@/app/components/DeleteConfirm"
import { Pagination } from "@/app/components/Pagination"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
    Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { HugeiconsIcon } from "@hugeicons/react"
import { Refresh01Icon, Calendar01Icon } from "@hugeicons/core-free-icons"
import { useHolidays, useCreateHoliday, useEditHoliday, useDeleteHoliday } from "./holiday.hooks"
import { HolidayColumns } from "./holiday.column"

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 6 }, (_, i) => String(CURRENT_YEAR - 2 + i))

function HolidayForm({
    form,
    onChange,
    error,
}: {
    form: any
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
    error: string | null
}) {
    return (
        <div className="grid gap-4">
            {error && <p className="text-destructive text-sm">{error}</p>}
            <div className="grid gap-1.5">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" name="name" value={form.name} onChange={onChange} placeholder="e.g. New Year's Day" required />
            </div>
            <div className="grid gap-1.5">
                <Label htmlFor="date">Date *</Label>
                <Input id="date" name="date" type="date" value={form.date} onChange={onChange} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                    <Label htmlFor="type">Type</Label>
                    <select
                        id="type"
                        name="type"
                        value={form.type}
                        onChange={onChange}
                        className="border rounded-md px-3 py-2 text-sm bg-background"
                    >
                        <option value="public">Public</option>
                        <option value="company">Company</option>
                        <option value="optional">Optional</option>
                    </select>
                </div>
                <div className="flex flex-col gap-3 pt-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" name="isPaid" checked={form.isPaid} onChange={onChange} className="h-4 w-4" />
                        Paid Holiday
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" name="isRecurring" checked={form.isRecurring} onChange={onChange} className="h-4 w-4" />
                        Recurring Yearly
                    </label>
                </div>
            </div>
            <div className="grid gap-1.5">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" value={form.description} onChange={onChange} placeholder="Optional description" />
            </div>
        </div>
    )
}

function Holidays() {
    const { holidays, loading, error, refetch, page, limit, total, setPage, month, setMonth, year, setYear } = useHolidays()
    const create = useCreateHoliday({ refetch })
    const edit = useEditHoliday({ refetch })
    const del = useDeleteHoliday({ refetch })

    const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null })

    if (loading && holidays.length === 0) {
        return (
            <LoadingPage />
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <PageHeader
                    title="Holidays"
                    description={total === 0 ? "No holidays found." : `${total} ${total === 1 ? "holiday" : "holidays"}`}
                />
                <Button onClick={() => create.setOpen(true)} className="flex items-center gap-2">
                    <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4" />
                    Add Holiday
                </Button>
            </div>

            {error && <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">{error}</div>}

            <div className="flex flex-wrap gap-3 justify-end items-center">
                <Select value={month || "all"} onValueChange={v => { setPage(1); setMonth(v === "all" ? "" : String(MONTHS.indexOf(v) + 1)) }}>
                    <SelectTrigger className="w-36"><SelectValue placeholder="Month" /></SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="all">All Months</SelectItem>
                            {MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Select value={year} onValueChange={v => { setPage(1); setYear(v) }}>
                    <SelectTrigger className="w-28"><SelectValue placeholder="Year" /></SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Button variant="outline" onClick={refetch} className="flex items-center gap-2">
                    {loading ? <Spinner className="h-4 w-4" /> : <HugeiconsIcon icon={Refresh01Icon} />}
                    Refresh
                </Button>
            </div>
            <DataTable
                columns={HolidayColumns({
                    onEdit: edit.openEdit,
                    onDelete: (id) => setDeleteModal({ open: true, id }),
                })}
                data={holidays}
                emptyMessage="No holidays found"
            />

            {total > 0 && <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />}

            { }
            <Dialog open={create.open} onOpenChange={create.setOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Add Holiday</DialogTitle></DialogHeader>
                    <form onSubmit={create.submit}>
                        <HolidayForm form={create.form} onChange={create.handleChange} error={create.error} />
                        <DialogFooter className="mt-6">
                            <Button type="button" variant="outline" onClick={() => create.setOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={create.loading}>
                                {create.loading ? <Spinner className="h-4 w-4" /> : "Add Holiday"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            { }
            <Dialog open={edit.open} onOpenChange={edit.setOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Holiday</DialogTitle></DialogHeader>
                    <HolidayForm form={edit.form} onChange={edit.handleChange} error={edit.error} />
                    <DialogFooter className="mt-6">
                        <Button variant="outline" onClick={() => edit.setOpen(false)}>Cancel</Button>
                        <Button onClick={edit.submit} disabled={edit.loading}>
                            {edit.loading ? <Spinner className="h-4 w-4" /> : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            { }
            <ConfirmDelete
                open={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, id: null })}
                onConfirm={async () => {
                    if (deleteModal.id) {
                        const ok = await del.deleteHoliday(deleteModal.id)
                        if (ok) setDeleteModal({ open: false, id: null })
                    }
                }}
                loading={!!del.loadingId}
                title="Delete Holiday"
                description="Are you sure you want to delete this holiday? This cannot be undone."
                buttonText="Delete"
            />
        </div>
    )
}

export default Holidays

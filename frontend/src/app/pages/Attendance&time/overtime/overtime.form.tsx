import { FormField } from "@/app/components/form/FormField"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { Plus } from "lucide-react"
import { useCreateOvertimes, useEditOvertimes } from "./overtime.hooks"
import { SelectField } from "@/app/components/SelectField"
import { useEmployees } from "../../people/employees/employee.hooks"
import { usePayrolls } from "../../payroll/payrollRuns/payroll.hooks"

export const CreateOvertime = () => {
    const { loading, error, submitted, form, handleChange, createOvertime } = useCreateOvertimes()
    const { employees } = useEmployees()
    const { payrolls } = usePayrolls()

    const handleSelectChange = (name: string, value: string) => {
        handleChange({ target: { name, value } } as any)
    }

    return (
        <div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button>New <Plus /></Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Overtime</DialogTitle>
                        <DialogDescription>Who worked overtime today? Save it here!</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={createOvertime} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SelectField
                            label="Employee"
                            name="employeeID"
                            value={form.employeeID}
                            options={employees.map(e => ({
                                value: e.id || "",
                                label: e.employeeName,
                            }))}
                            onChange={handleSelectChange}
                            submitted={submitted}
                        />
                        <SelectField
                            label="Payroll"
                            name="payrollID"
                            value={form.payrollID}
                            options={payrolls.map(p => ({
                                value: p._id || "",
                                label: `${p.startDate} – ${p.endDate} (${p.status})`,
                            }))}
                            onChange={handleSelectChange}
                            submitted={submitted}
                        />
                        <FormField
                            label="Date"
                            name="date"
                            value={form.date}
                            placeholder="date"
                            onChange={handleChange}
                            submitted={submitted}
                            required
                            type="date"
                        />
                        <FormField
                            label="Hours"
                            name="hours"
                            value={form.hours}
                            placeholder="hours"
                            onChange={handleChange}
                            submitted={submitted}
                            required
                            type="number"
                        />
                        <FormField
                            label="Rate per hour"
                            name="rate"
                            value={form.rate}
                            placeholder="rate"
                            onChange={handleChange}
                            submitted={submitted}
                            required
                            type="number"
                        />
                        <DialogFooter className="col-span-2">
                            <DialogClose asChild>
                                <Button variant={'outline'}>Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={loading}>
                                {loading ? <Spinner /> : "Save"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}




export function EditOvertime({
    open,
    form,
    loading,
    error,
    onChange,
    onSubmit,
    onClose,
}: any) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Overtime</DialogTitle>
                    <DialogDescription>edit overtime informations below.</DialogDescription>
                </DialogHeader>
                <form
                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                    onSubmit={(e) => {
                        e.preventDefault()
                        onSubmit()
                    }}
                >
                    {error && <p>{error}</p>}


                    <FormField
                        name="date"
                        placeholder="date"
                        label="Date"
                        value={form.date}
                        onChange={onChange}
                        type="date"
                    />
                    <FormField
                        name="hours"
                        placeholder="hours"
                        label="Hours"
                        value={form.hours}
                        onChange={onChange}
                        type="number"
                    />
                    <FormField
                        name="rate"
                        placeholder="rate"
                        label="Rate"
                        value={form.rate}
                        onChange={onChange}
                        type="number"
                    />
                    <DialogFooter className="col-span-2">
                        <Button type="button" variant={'outline'} onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? <Spinner /> : "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
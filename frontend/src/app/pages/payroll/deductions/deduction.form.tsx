import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FormField } from "@/app/components/form/FormField"
import { Spinner } from "@/components/ui/spinner"
import { Plus } from "lucide-react"
import { useCreateDeductions, useDeductions } from "./deduction.hooks"
import { SelectField } from "@/app/components/SelectField"
import { useEmployees } from "../../people/employees/employee.hooks"

const DEDUCTION_TYPES = ["tax", "insurance", "loan", "advance", "penalty", "other"]
const FREQUENCIES = ["one_time", "monthly", "weekly", "bi_weekly"]

export const CreateDeduction = () => {
    const { refetch } = useDeductions()
    const { loading, error, submitted, handleChange, createDeduction, form } = useCreateDeductions()
    const { employees } = useEmployees()

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
                        <DialogTitle>New Deduction</DialogTitle>
                        <DialogDescription>Assign a new deduction to an employee.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={createDeduction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            label="Type"
                            name="type"
                            value={form.type}
                            options={DEDUCTION_TYPES.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
                            onChange={handleSelectChange}
                            submitted={submitted}
                        />
                        <FormField
                            label="Name"
                            name="name"
                            value={form.name}
                            placeholder="name"
                            onChange={handleChange}
                            required
                            submitted={submitted}
                        />
                        <FormField
                            label="Amount"
                            name="amount"
                            value={form.amount}
                            placeholder="amount"
                            onChange={handleChange}
                            required
                            submitted={submitted}
                        />
                        <SelectField
                            label="Frequency"
                            name="frequency"
                            value={form.frequency}
                            options={FREQUENCIES.map(f => ({ value: f, label: f.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase()) }))}
                            onChange={handleSelectChange}
                            submitted={submitted}
                        />
                        <FormField
                            label="Start Date"
                            name="startDate"
                            value={form.startDate}
                            placeholder="startDate"
                            onChange={handleChange}
                            required
                            submitted={submitted}
                            type="date"
                        />
                        <FormField
                            label="End Date"
                            name="endDate"
                            value={form.endDate}
                            placeholder="endDate"
                            onChange={handleChange}
                            required
                            submitted={submitted}
                            type="date"
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


export function EditDeduction({
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
                    <DialogTitle>Edit Deduction</DialogTitle>
                    <DialogDescription>edit deduction informations below.</DialogDescription>
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
                        name="name"
                        placeholder="name"
                        label="Name"
                        value={form.name}
                        onChange={onChange}
                    />
                    <FormField
                        name="type"
                        placeholder="type"
                        label="Type"
                        value={form.type}
                        onChange={onChange}
                    />
                    <FormField
                        name="amount"
                        placeholder="amount"
                        label="Amount"
                        value={form.amount}
                        onChange={onChange}
                    />
                    <FormField
                        name="startDate"
                        placeholder="start date"
                        label="Start Date"
                        value={form.startDate}
                        onChange={onChange}
                        type="date"
                    />
                    <FormField
                        name="endDate"
                        placeholder="end date"
                        label="End Date"
                        value={form.endDate}
                        onChange={onChange}
                        type="date"
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
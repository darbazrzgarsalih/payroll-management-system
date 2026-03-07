import { FormField } from "@/app/components/form/FormField"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { Plus } from "lucide-react"
import { useCreateSalaries } from "./salary.hooks"
import { SelectField } from "@/app/components/SelectField"
import { useEmployees } from "../../people/employees/employee.hooks"
import { usePaygrades } from "../paygrade/paygrade.hooks"

const SALARY_TYPES = ["monthly", "hourly", "daily", "weekly", "annual"]

export const CreateSalary = () => {
    const { loading, error, submitted, form, handleChange, createSalary } = useCreateSalaries()
    const { employees } = useEmployees()
    const { paygrades } = usePaygrades()

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
                        <DialogTitle>New Salary</DialogTitle>
                        <DialogDescription>Assign a salary structure to an employee.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={createSalary} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            label="Salary Type"
                            name="salaryType"
                            value={form.salaryType}
                            options={SALARY_TYPES.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
                            onChange={handleSelectChange}
                            submitted={submitted}
                        />
                        <FormField
                            label="Amount"
                            name="amount"
                            value={form.amount}
                            placeholder="amount"
                            onChange={handleChange}
                            submitted={submitted}
                        />

                        <FormField
                            label="Effective Date"
                            name="effectiveDate"
                            value={form.effectiveDate}
                            placeholder="effectiveDate"
                            onChange={handleChange}
                            submitted={submitted}
                            type="date"
                        />
                        <SelectField
                            label="Pay Grade"
                            name="payGradeID"
                            value={form.payGradeID}
                            options={paygrades.map(pg => ({ value: pg.id || (pg as any)._id, label: pg.name }))}
                            onChange={handleSelectChange}
                            submitted={submitted}
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


export function EditSalary({
    open,
    form,
    loading,
    error,
    onChange,
    onSelectChange,
    onSubmit,
    onClose
}: any) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="!max-w-3xl w-full">
                <DialogHeader>
                    <DialogTitle>Edit salary</DialogTitle>
                    <DialogDescription>edit salary informations below.</DialogDescription>
                </DialogHeader>
                <form
                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                    onSubmit={(e) => {
                        e.preventDefault()
                        onSubmit()
                    }}
                >
                    {error && <p className="col-span-2 text-destructive text-sm">{error}</p>}

                    <SelectField
                        label="Salary Type"
                        name="salaryType"
                        value={form.salaryType}
                        options={SALARY_TYPES.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
                        onChange={onSelectChange}
                    />

                    <FormField
                        name="amount"
                        placeholder="amount"
                        label="Amount"
                        value={form.amount}
                        onChange={onChange}
                    />
                    <FormField
                        name="effectiveDate"
                        placeholder="effective date"
                        label="Effective Date"
                        value={form.effectiveDate}
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
                        <Button type="submit" disabled={loading}>
                            {loading ? <Spinner className="h-4 w-4" /> : "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
import { useCreatePunishments } from "./punishment.hooks"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FormField } from "@/app/components/form/FormField"
import { Spinner } from "@/components/ui/spinner"
import { Plus } from "lucide-react"
import { SelectField } from "@/app/components/SelectField"
import { useEmployees } from "../../people/employees/employee.hooks"

const PUNISHMENT_TYPES = ["warning", "suspension", "demotion", "fine", "termination", "other"]

export const CreatePunishment = () => {
    const { loading, error, submitted, form, handleChange, createPunishment } = useCreatePunishments()
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
                        <DialogTitle>New Punishment</DialogTitle>
                        <DialogDescription>Apply a new penalty to an employee.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={createPunishment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <FormField
                            label="Name"
                            name="name"
                            value={form.name}
                            placeholder="name"
                            onChange={handleChange}
                            required
                            submitted={submitted}
                        />
                        <SelectField
                            label="Type"
                            name="type"
                            value={form.type}
                            options={PUNISHMENT_TYPES.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
                            onChange={handleSelectChange}
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
                            label="End Date (optional)"
                            name="endDate"
                            value={form.endDate}
                            placeholder="endDate"
                            onChange={handleChange}
                            submitted={submitted}
                            type="date"
                        />
                        <DialogFooter className="col-span-2">
                            <DialogClose asChild>
                                <Button variant={'outline'}>Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={loading}>
                                {loading ? <Spinner /> : "Create punishment"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}


export function EditPunishment({
    open,
    form,
    loading,
    error,
    onChange,
    onSubmit,
    onClose
}: any) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit punishment</DialogTitle>
                    <DialogDescription>edit punishment informations below.</DialogDescription>
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
                        label="name"
                        value={form.name}
                        onChange={onChange}
                    />
                    <FormField
                        name="type"
                        placeholder="type"
                        label="type"
                        value={form.type}
                        onChange={onChange}
                    />

                    <FormField
                        name="frequency"
                        placeholder="frequency"
                        label="frequency"
                        value={form.frequency}
                        onChange={onChange}
                    />

                    <FormField
                        name="startDate"
                        placeholder="startDate"
                        label="startDate"
                        value={form.startDate}
                        onChange={onChange}
                    />

                    <FormField
                        name="endDate"
                        placeholder="endDate"
                        label="endDate"
                        value={form.endDate}
                        onChange={onChange}
                    />

                    <DialogFooter className="col-span-2">
                        <Button type="button" variant={'outline'} onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Spinner /> : "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
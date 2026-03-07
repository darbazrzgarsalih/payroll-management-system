import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useCreateRewards, useBulkCreateRewards, useRewards } from "./reward.hooks"
import { Button } from "@/components/ui/button"
import { FormField } from "@/app/components/form/FormField"
import { Spinner } from "@/components/ui/spinner"
import { Plus } from "lucide-react"
import { SelectField } from "@/app/components/SelectField"
import { useEmployees } from "../../people/employees/employee.hooks"
import { usePayrolls } from "../../payroll/payrollRuns/payroll.hooks"

export const CreateReward = () => {
    const { refetch } = useRewards()
    const { loading, error, submitted, handleChange, createReward, form, handleSelectChange } = useCreateRewards()

    const { employees } = useEmployees()
    const { payrolls } = usePayrolls()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const success = await createReward(e)
        if (success) {
            refetch()
        }
    }

    return (
        <div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button>Create new Reward<Plus className="ml-2 h-4 w-4" /></Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Reward</DialogTitle>
                        <DialogDescription>Assign a new reward to an employee.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            label="Payroll Run"
                            name="payrollID"
                            value={form.payrollID}
                            options={payrolls.map((p: any) => ({
                                value: p._id || "",
                                label: `${p.startDate} - ${p.endDate}`,
                            }))}
                            onChange={handleSelectChange}
                            submitted={submitted}
                        />
                        <FormField
                            label="Amount"
                            name="amount"
                            type="number"
                            value={String(form.amount)}
                            placeholder="amount"
                            onChange={handleChange}
                            required
                            submitted={submitted}
                        />
                        <FormField
                            label="Type"
                            name="type"
                            value={form.type}
                            placeholder="e.g. bonus"
                            onChange={handleChange}
                        />
                        <FormField
                            label="Reason"
                            name="reason"
                            value={form.reason}
                            placeholder="Reason..."
                            onChange={handleChange}
                        />

                        {error && <p className="text-red-500 text-sm col-span-2">{error}</p>}

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

import { MultiSelectEmployees } from "../../../components/MultiSelectEmployees"

export const BulkCreateReward = () => {
    const { refetch } = useRewards()
    const { loading, error, submitted, form, handleSelectChange, handleChange, createBulkRewards } = useBulkCreateRewards()
    const { employees } = useEmployees()
    const { payrolls } = usePayrolls()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const success = await createBulkRewards()
        if (success) {
            refetch()
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">
                    Bulk creation
                    <Plus className="ml-2 h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Bulk Reward Creation</DialogTitle>
                    <DialogDescription>Assign the same reward to multiple employees at once.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <SelectField
                                label="Payroll Run"
                                name="payrollID"
                                value={form.payrollID}
                                options={payrolls.map((p: any) => ({
                                    value: p._id || "no-id",
                                    label: `${p.startDate} - ${p.endDate}`,
                                }))}
                                onChange={handleSelectChange}
                                submitted={submitted}
                            />
                            <FormField
                                label="Amount"
                                name="amount"
                                type="number"
                                value={String(form.amount)}
                                placeholder="Enter amount"
                                onChange={handleChange}
                                required
                                submitted={submitted}
                            />
                            <FormField
                                label="Reason"
                                name="reason"
                                value={form.reason}
                                placeholder="Enter reason"
                                onChange={handleChange}
                            />
                        </div>
                        <MultiSelectEmployees
                            label="Select Employees"
                            options={employees.map(e => ({
                                value: e.id || "no-id",
                                label: e.employeeName,
                            }))}
                            selectedValues={form.employeeIDs}
                            onChange={(values: string[]) => handleSelectChange('employeeIDs', values)}
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant={'outline'}>Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading || form.employeeIDs.length === 0}>
                            {loading ? <Spinner /> : "Create Rewards"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}


export function EditReward({
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
                    <DialogTitle>Edit Reward</DialogTitle>
                    <DialogDescription>edit reward informations below.</DialogDescription>
                </DialogHeader>
                <form
                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                    onSubmit={(e) => {
                        e.preventDefault()
                        onSubmit()
                    }}
                >
                    {error && <p className="text-red-500 text-sm col-span-2">{error}</p>}

                    <FormField
                        name="type"
                        placeholder="type"
                        label="Type"
                        value={form.type}
                        onChange={onChange}
                    />
                    <FormField
                        name="amount"
                        type="number"
                        placeholder="amount"
                        label="Amount"
                        value={String(form.amount)}
                        onChange={onChange}
                    />
                    <FormField
                        name="reason"
                        placeholder="reason"
                        label="Reason"
                        value={form.reason}
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
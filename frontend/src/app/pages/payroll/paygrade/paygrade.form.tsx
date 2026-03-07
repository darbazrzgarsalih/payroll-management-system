import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FormField } from "@/app/components/form/FormField"
import { Spinner } from "@/components/ui/spinner"
import { Plus } from "lucide-react"
import { useCreatePaygrades, useEditPaygrades, usePaygrades } from "./paygrade.hooks"

export const CreatePaygrade = () => {
    const { refetch } = usePaygrades()
    const { loading, error, submitted, handleChange, createPaygrade, form } = useCreatePaygrades()
    const isInvalid = (value: string) => submitted && !value

    return (
        <div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button>New <Plus /></Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New paygrade</DialogTitle>
                        <DialogDescription>Explict salaries by making opening paygrades.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={createPaygrade} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            label="level"
                            name="level"
                            value={form.level}
                            placeholder="eg. 1, 2"
                            onChange={handleChange}
                            required
                            submitted={submitted}
                        />
                        <FormField
                            label="minSalary"
                            name="minSalary"
                            value={form.minSalary}
                            placeholder="0"
                            onChange={handleChange}
                            type="number"
                            required
                            submitted={submitted}
                        />
                        <FormField
                            label="maxSalary"
                            name="maxSalary"
                            value={form.maxSalary}
                            placeholder="0"
                            onChange={handleChange}
                            type="number"
                            required
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

export function EditPaygrade({
    open,
    form,
    loading,
    error,
    onChange,
    onSubmit,
    onClose,
    refetch
}: any) {
    const edit = useEditPaygrades({ refetch })
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Paygrade</DialogTitle>
                    <DialogDescription>edit paygrade informations below.</DialogDescription>
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
                        name="level"
                        placeholder="level"
                        label="Level"
                        value={form.level}
                        onChange={onChange}
                    />
                    <FormField
                        name="minSalary"
                        placeholder="min salary"
                        label="Min Salary"
                        value={form.minSalary}
                        onChange={onChange}
                    />
                    <FormField
                        name="maxSalary"
                        placeholder="max salary"
                        label="Max Salary"
                        value={form.maxSalary}
                        onChange={onChange}
                    />
                    <FormField
                        name="currency"
                        placeholder="currency"
                        label="Currency"
                        value={form.currency}
                        onChange={onChange}
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
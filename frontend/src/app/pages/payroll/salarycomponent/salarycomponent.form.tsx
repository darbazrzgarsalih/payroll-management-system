import { FormField } from "@/app/components/form/FormField"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { Plus } from "lucide-react"
import { useCreateSalaryComponents } from "./salarycomponent.hooks"

export const CreateSalaryComponent = () => {
    const { loading, error, submitted, form, handleChange, createSalaryComponent } = useCreateSalaryComponents()
    const isInvalid = (value: string) => submitted && !value

    return (
        <div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button>New <Plus /></Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Leavetype</DialogTitle>
                        <DialogDescription>assign new leavetype for simplifying your work.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={createSalaryComponent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            label="Paygrade"
                            name="payGradeID"
                            value={form.payGradeID}
                            placeholder="pay grade"
                            onChange={handleChange}
                            required
                            submitted={submitted}
                        />
                        <FormField
                            label="Name"
                            name="name"
                            value={form.name}
                            placeholder="name"
                            onChange={handleChange}
                            submitted={submitted}
                        />
                        <FormField
                            label="Effective From"
                            name="effectiveFrom"
                            value={form.effectiveFrom}
                            placeholder="effectiveFrom"
                            onChange={handleChange}
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

export function EditSalaryComponent({
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
                    <DialogTitle>Edit Salary component</DialogTitle>
                    <DialogDescription>edit salary component informations below.</DialogDescription>
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
                        name="description"
                        placeholder="description"
                        label="Description"
                        value={form.description}
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
                        name="category"
                        placeholder="category"
                        label="Category"
                        value={form.category}
                        onChange={onChange}
                    />
                    <FormField
                        name="effectiveFrom"
                        placeholder="effectiveFrom"
                        label="effectiveFrom"
                        value={form.effectiveFrom}
                        onChange={onChange}
                    />
                    <FormField
                        name="applicableFor"
                        placeholder="applicable for"
                        label="Applicable For"
                        value={form.applicableFor}
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
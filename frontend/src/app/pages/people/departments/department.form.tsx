import { useCreateDepartment } from "./department.hooks"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { FormField } from "@/app/components/form/FormField"

export const CreateDepartment = () => {
    const {
        createDepartment,
        loading,
        error,
        setForm,
        form,
        handleChange,
        submitted,
        open,
        setOpen,
        resetForm
    } = useCreateDepartment()

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen)
            if (!isOpen) {
                resetForm()
            }
        }}>
            <DialogTrigger asChild>
                <Button>
                    New <Plus />
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold text-foreground/90">
                        Create New Department
                    </DialogTitle>
                    <DialogDescription>
                        Fill in the department details below
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={createDepartment} className="flex flex-col w-full gap-5  p-1">
                    <FormField
                        label="Department Name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Engineering, Sales, HR"
                        submitted={submitted}
                    />


                    <FormField
                        label="Budget"
                        name="budget"
                        type="number"
                        value={form.budget}
                        onChange={handleChange}
                        required
                        placeholder="e.g., 100000"
                        submitted={submitted}
                    />

                    <DialogFooter className="col-span-2 w-full">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={loading}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Spinner className="h-4 w-4" /> : "Create Department"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export function EditDepartment({
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
                    <DialogTitle>Edit department</DialogTitle>
                    <DialogDescription>edit department informations below.</DialogDescription>
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
                        name="managerID"
                        placeholder="manager id"
                        label="Manager ID"
                        value={form.managerID}
                        onChange={onChange}
                    />
                    <FormField
                        name="budget"
                        placeholder="budget"
                        label="Budget"
                        value={form.budget}
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
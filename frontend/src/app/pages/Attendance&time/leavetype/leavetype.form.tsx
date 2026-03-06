import { FormField } from "@/app/components/form/FormField"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { useCreateLeavetypes } from "./leavetype.hooks"
import { Plus } from "lucide-react"

export const CreateLeavetype = () => {
    const { loading, error, submitted, form, handleChange, createLeavetype } = useCreateLeavetypes()
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

                    <form onSubmit={createLeavetype} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            label="Default Days"
                            name="defaultDays"
                            value={form.defaultDays}
                            placeholder="defaultDays"
                            onChange={handleChange}
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


export function EditLeaveType({
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
                    <DialogTitle>Edit Leave Type</DialogTitle>
                    <DialogDescription>edit leave type informations below.</DialogDescription>
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
                        name="defaultDays"
                        placeholder="default days"
                        label="Default Days"
                        value={form.defaultDays}
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
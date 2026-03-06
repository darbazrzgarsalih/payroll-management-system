import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useCreatePosition } from "./position.hooks"
import { Button } from "@/components/ui/button"
import { FormField } from "@/app/components/form/FormField"
import { SelectField } from "@/app/components/SelectField"
import { Spinner } from "@/components/ui/spinner"
import { Plus } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export const CreatePosition = () => {
    const {
        createPosition,
        form,
        submitted,
        error,
        loading,
        handleChange,
        handleSelectChange,
        open,
        setOpen,
        resetForm,
        departments
    } = useCreatePosition()

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

            <DialogContent className="!max-w-3xl md:max-w-4xl w-full">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold text-foreground/90">
                        Create New Position
                    </DialogTitle>
                    <DialogDescription>
                        Fill in the position details below
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={createPosition} className="flex flex-col w-full gap-5  p-1">
                    <FormField
                        label="Title"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Senior Software Engineer"
                        submitted={submitted}

                    />

                    <FormField
                        label="Level"
                        name="level"
                        value={form.level}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Senior, Mid-Level, Junior"
                        submitted={submitted}

                    />

                    <SelectField
                        label="Department"
                        name="departmentID"
                        value={form.departmentID}
                        options={departments.map(d => ({
                            value: d._id || d.id || "",
                            label: d.name
                        }))}
                        onChange={handleSelectChange}
                        submitted={submitted}
                    />

                    <div className="w-full flex flex-col gap-2">
                        <Label htmlFor="description">
                            Description (Optional)
                        </Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Describe the position responsibilities and requirements..."
                            rows={3}
                            className="resize-none"
                        />
                    </div>

                    <DialogFooter className="w-full col-span-2">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={loading}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Spinner className="h-4 w-4" /> : "Create Position"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}


export function EditPosition({
    open,
    form,
    loading,
    error,
    onChange,
    onSelectChange,
    onSubmit,
    onClose,
    departments
}: any) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="!max-w-3xl w-full">
                <DialogHeader>
                    <DialogTitle>Edit position</DialogTitle>
                    <DialogDescription>edit position informations below.</DialogDescription>
                </DialogHeader>
                <form
                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                    onSubmit={(e) => {
                        e.preventDefault()
                        onSubmit()
                    }}
                >
                    {error && <p className="col-span-2 text-destructive text-sm">{error}</p>}

                    <FormField
                        name="title"
                        placeholder="title"
                        label="Title"
                        value={form.title}
                        onChange={onChange}
                    />
                    <FormField
                        name="level"
                        placeholder="level"
                        label="Level"
                        value={form.level}
                        onChange={onChange}
                    />
                    <SelectField
                        label="Department"
                        name="department"
                        value={form.department}
                        options={departments?.map((d: any) => ({
                            value: d._id || d.id || "",
                            label: d.name
                        })) || []}
                        onChange={onSelectChange}
                    />
                    <FormField
                        name="status"
                        placeholder="status"
                        label="status"
                        value={form.status}
                        onChange={onChange}
                    />
                    <div className="w-full flex flex-col gap-2 col-span-2">
                        <Label htmlFor="description">
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={form.description}
                            onChange={onChange as any}
                            placeholder="description"
                            rows={3}
                            className="resize-none"
                        />
                    </div>

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
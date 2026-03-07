import api from "@/app/services/api"
import { useEffect, useState } from "react"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useApplyLeave } from "./leave.hooks"
import { Button } from "@/components/ui/button"
import { Plus, ChevronDown } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { useEmployees } from "../../people/employees/employee.hooks"
import { SelectField } from "@/app/components/SelectField"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

export const ApplyLeave = () => {
    const { employees } = useEmployees()
    const [leaveTypes, setLeaveTypes] = useState<{ id?: string, _id?: string, name: string }[]>([])
    const {
        loading,
        error,
        submitted,
        form,
        setForm,
        handleChange,
        applyLeave,
        handleSelectChange,
        open,
        setOpen,
        resetForm
    } = useApplyLeave()

    useEffect(() => {
        const fetchLeaveTypes = async () => {
            try {
                const res = await api.get('/leave-types')
                setLeaveTypes(res.data.leaveTypes || [])
            } catch (err) {
                console.error("Failed to fetch leave types", err)
            }
        }
        if (open) fetchLeaveTypes()
    }, [open])

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
                        Apply Leave
                    </DialogTitle>
                    <DialogDescription>
                        Submit a leave request
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={applyLeave} className="flex flex-col w-full gap-5  p-1">
                    <div className="w-full">
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
                    </div>

                    <div className="w-full">
                        <SelectField
                            label="Leave Type"
                            name="leaveTypeID"
                            value={form.leaveTypeID}
                            options={leaveTypes.map(lt => ({
                                value: lt._id || lt.id || "",
                                label: lt.name,
                            }))}
                            onChange={handleSelectChange}
                            submitted={submitted}
                        />
                    </div>

                    <div className="w-full flex flex-col gap-2">
                        <Label>
                            Start Date <span className="text-destructive">*</span>
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <div className="relative w-full">
                                    <Input
                                        readOnly
                                        placeholder="Select start date"
                                        value={form.startDate}
                                        className="cursor-pointer"
                                    />
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={form.startDate ? new Date(form.startDate) : undefined}
                                    onSelect={(date) =>
                                        setForm(prev => ({
                                            ...prev,
                                            startDate: date ? date.toISOString().split("T")[0] : ""
                                        }))
                                    }
                                    captionLayout="dropdown"
                                    fromYear={2020}
                                    toYear={new Date().getFullYear() + 1}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="w-full flex flex-col gap-2">
                        <Label>
                            End Date <span className="text-destructive">*</span>
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <div className="relative w-full">
                                    <Input
                                        readOnly
                                        placeholder="Select end date"
                                        value={form.endDate}
                                        className="cursor-pointer"
                                    />
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={form.endDate ? new Date(form.endDate) : undefined}
                                    onSelect={(date) =>
                                        setForm(prev => ({
                                            ...prev,
                                            endDate: date ? date.toISOString().split("T")[0] : ""
                                        }))
                                    }
                                    captionLayout="dropdown"
                                    fromYear={2020}
                                    toYear={new Date().getFullYear() + 1}
                                    disabled={(date) => {
                                        if (!form.startDate) return false
                                        return date < new Date(form.startDate)
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="col-span-2 w-full flex flex-col gap-2">
                        <Label htmlFor="reason">
                            Reason (Optional)
                        </Label>
                        <Textarea
                            id="reason"
                            name="reason"
                            value={form.reason}
                            onChange={handleChange}
                            placeholder="Provide a reason for your leave request..."
                            rows={3}
                            className="resize-none"
                        />
                    </div>

                    <DialogFooter className="col-span-2">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={loading}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Spinner className="h-4 w-4" /> : "Apply Leave"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
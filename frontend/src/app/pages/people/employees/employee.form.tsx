import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateEmployee } from "./employee.hooks"
import { Spinner } from "@/components/ui/spinner"
import { ChevronDown, Plus } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FormField } from "@/app/components/form/FormField"
import { SelectField } from "@/app/components/SelectField"
import { useEffect, useState } from "react"
import api from "@/app/services/api"

export const CreateEmployee = () => {
    const {
        createEmployee,
        form,
        setForm,
        error,
        loading,
        handleChange,
        handleSelectChange,
        submitted,
        open,
        setOpen,
        resetForm,
        handleFileChange
    } = useCreateEmployee()

    const [shifts, setShifts] = useState<{ _id: string; name: string }[]>([])
    const [departments, setDepartments] = useState<{ value: string; label: string }[]>([])
    const [positions, setPositions] = useState<{ value: string; label: string }[]>([])
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

    const onAvatarSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFileChange(e)
        if (e.target.files && e.target.files[0]) {
            setAvatarPreview(URL.createObjectURL(e.target.files[0]))
        }
    }
    useEffect(() => {
        api.get('/shifts').then(r => setShifts(r.data?.shifts || [])).catch(() => { })
        api.get('/departments').then(r => {
            const depts = r.data?.departments || []
            setDepartments(depts.map((d: any) => ({ value: d._id || d.id, label: d.name })))
        }).catch(() => { })
        api.get('/positions').then(r => {
            const pos = r.data?.positions || []
            setPositions(pos.map((p: any) => ({ value: p._id || p.id, label: p.title || p.name })))
        }).catch(() => { })
    }, [])

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen)
            if (!isOpen) { resetForm() }
        }}>
            <DialogTrigger asChild>
                <Button>
                    New <Plus />
                </Button>
            </DialogTrigger>

            <DialogContent className="!max-w-9xl min-h-[50%] md:max-w-7xl w-full">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold text-foreground/90">
                        Create New Employee
                    </DialogTitle>
                    <DialogDescription>
                        Fill in the employee information below
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={createEmployee} className="grid grid-cols-1 mb-2 md:grid-cols-2 place-items-center gap-4 p-1">
                    <div className="col-span-1 md:col-span-2 flex flex-col items-center gap-2 mb-4 w-full justify-center">
                        <label htmlFor="avatar" className="cursor-pointer relative group flex items-center justify-center">
                            <div className="w-24 h-24 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs text-muted-foreground">Upload</span>
                                )}
                            </div>
                            <input id="avatar" type="file" className="hidden" accept="image/*" onChange={onAvatarSelected} />
                        </label>
                        <span className="text-xs text-muted-foreground">Profile Picture (Optional)</span>
                    </div>

                    <FormField
                        label="Employee Code (Optional)"
                        name="employeeCode"
                        value={form.employeeCode}
                        onChange={handleChange}
                        placeholder="EMP001"
                        submitted={submitted}
                    />

                    <FormField
                        label="First Name"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        required
                        placeholder="John"
                        submitted={submitted}
                    />

                    <SelectField
                        label="Shift"
                        name="shiftId"
                        value={form.shiftId}
                        options={shifts.map(s => ({ value: s._id, label: s.name }))}
                        onChange={handleSelectChange}
                        submitted={submitted}
                    />

                    <FormField
                        label="Middle Name (Optional)"
                        name="middleName"
                        value={form.middleName}
                        onChange={handleChange}
                        placeholder="Michael"
                        submitted={submitted}
                    />

                    <FormField
                        label="Last Name"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        required
                        placeholder="Doe"
                        submitted={submitted}
                    />

                    <FormField
                        label="Email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="john.doe@example.com"
                        submitted={submitted}
                    />

                    <FormField
                        label="Phone Number"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        placeholder="+1234567890"
                        submitted={submitted}
                    />

                    <SelectField
                        label="Gender"
                        name="gender"
                        value={form.gender ?? ""}
                        options={[
                            { value: "Male", label: "Male" },
                            { value: "Female", label: "Female" },
                            { value: "Other", label: "Other" },
                        ]}
                        onChange={handleSelectChange}
                        submitted={submitted}
                    />

                    <SelectField
                        label="Department"
                        name="departmentID"
                        value={form.departmentID}
                        options={departments}
                        onChange={handleSelectChange}
                        submitted={submitted}
                    />

                    <SelectField
                        label="Position"
                        name="positionID"
                        value={form.positionID}
                        options={positions}
                        onChange={handleSelectChange}
                        submitted={submitted}
                    />

                    <FormField
                        label="City"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="New York"
                        submitted={submitted}
                    />

                    <FormField
                        label="Country"
                        name="country"
                        value={form.country}
                        onChange={handleChange}
                        placeholder="USA"
                        submitted={submitted}
                    />

                    <div className="w-full flex flex-col gap-2">
                        <Label>Date of Birth</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <div className="relative w-full">
                                    <Input
                                        readOnly
                                        placeholder="Select date"
                                        value={form.dateOfBirth}
                                        className="cursor-pointer"
                                    />
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={form.dateOfBirth ? new Date(form.dateOfBirth) : undefined}
                                    onSelect={(date) =>
                                        setForm(prev => ({
                                            ...prev,
                                            dateOfBirth: date ? date.toISOString().split("T")[0] : ""
                                        }))
                                    }
                                    captionLayout="dropdown"
                                    fromYear={1950}
                                    toYear={new Date().getFullYear()}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="w-full flex flex-col gap-2">
                        <Label>Hire Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <div className="relative w-full">
                                    <Input
                                        readOnly
                                        placeholder="Select date"
                                        value={form.hireDate}
                                        className="cursor-pointer"
                                    />
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={form.hireDate ? new Date(form.hireDate) : undefined}
                                    onSelect={(date) =>
                                        setForm(prev => ({
                                            ...prev,
                                            hireDate: date ? date.toISOString().split("T")[0] : ""
                                        }))
                                    }
                                    captionLayout="dropdown"
                                    fromYear={2000}
                                    toYear={new Date().getFullYear() + 1}
                                />
                            </PopoverContent>
                        </Popover>
                        <div className="col-span-1 flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={form.createAccount}
                                onChange={(e) =>
                                    setForm(prev => ({ ...prev, createAccount: e.target.checked }))
                                }
                            />
                            <Label>Create System Account</Label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {form.createAccount && (
                                <>
                                    <FormField
                                        label="Username"
                                        name="username"
                                        value={form.username ?? ""}
                                        onChange={handleChange}
                                        required
                                        submitted={submitted}
                                    />

                                    <FormField
                                        label="Password"
                                        name="password"
                                        type="password"
                                        value={form.password ?? ""}
                                        onChange={handleChange}
                                        required
                                        submitted={submitted}
                                    />

                                    <SelectField
                                        label="Role"
                                        name="role"
                                        value={form.role ?? ""}
                                        options={[
                                            { value: "super_admin", label: "Super Admin" },
                                            { value: "admin", label: "Admin" },
                                            { value: "hr_manager", label: "HR Manager" },
                                            { value: "payroll_manager", label: "Payroll Manager" },
                                            { value: "overtime_manager", label: "Overtime Manager" },
                                            { value: "punishment_manager", label: "Punishment Manager" },
                                            { value: "employee", label: "Employee" }
                                        ]}
                                        onChange={handleSelectChange}
                                        submitted={submitted}
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="w-full col-span-2">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={loading}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Spinner className="h-4 w-4" /> : "Create Employee"}
                        </Button>
                    </DialogFooter>


                </form>
            </DialogContent>
        </Dialog>
    )
}


export function EditEmployee({
    open,
    form,
    loading,
    error,
    onChange,
    onSubmit,
    onClose,
    onSelectChange,
    onFileChange,
    avatarFile
}: any) {

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="!max-w-9xl min-h-[50%] md:max-w-7xl w-full ">
                <div>
                    <DialogHeader>
                        <DialogTitle>Edit employee</DialogTitle>
                        <DialogDescription>edit employee informations below.</DialogDescription>
                    </DialogHeader>
                </div>
                <form
                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                    onSubmit={(e) => {
                        e.preventDefault()
                        onSubmit()
                    }}
                >
                    <div className="col-span-1 md:col-span-2 flex flex-col items-center gap-2 mb-2 w-full justify-center">
                        <label htmlFor="editAvatar" className="cursor-pointer relative group flex items-center justify-center">
                            <div className="w-24 h-24 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                                {avatarFile ? (
                                    <img src={URL.createObjectURL(avatarFile)} alt="Avatar Preview" className="w-full h-full object-cover" />
                                ) : form.avatar ? (
                                    <img src={`${(import.meta.env.VITE_BACKEND_URL?.replace('/api/v1', '') || 'http://localhost:8000')}/${form.avatar}`} alt="Current Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs text-muted-foreground">Upload</span>
                                )}
                            </div>
                            <input id="editAvatar" type="file" className="hidden" accept="image/*" onChange={onFileChange} />
                        </label>
                        <span className="text-xs text-muted-foreground">Change Picture</span>
                    </div>
                    {error && <p className="text-red-500 col-span-1 md:col-span-2">{error}</p>}

                    <FormField
                        name="firstName"
                        placeholder="first name"
                        label="First Name"
                        value={form.firstName}
                        onChange={onChange}
                    />
                    <FormField
                        name="middleName"
                        placeholder="middle name"
                        label="Middle Name"
                        value={form.middleName}
                        onChange={onChange}
                        required
                    />
                    <FormField
                        name="lastName"
                        placeholder="last name"
                        label="Last Name"
                        value={form.lastName}
                        onChange={onChange}
                        required
                    />
                    <FormField
                        name="email"
                        placeholder="email"
                        label="Email"
                        value={form.email}
                        onChange={onChange}
                        required
                    />
                    <FormField
                        name="phone"
                        placeholder="phone"
                        label="Phone"
                        value={form.phone}
                        onChange={onChange}
                        required
                    />
                    <SelectField
                        name="role"
                        label="Role"
                        value={form.role}
                        options={[
                            { value: "super_admin", label: "Super Admin" },
                            { value: "admin", label: "Admin" },
                            { value: "hr_manager", label: "HR Manager" },
                            { value: "payroll_manager", label: "Payroll Manager" },
                            { value: "overtime_manager", label: "Overtime Manager" },
                            { value: "punishment_manager", label: "Punishment Manager" },
                            { value: "employee", label: "Employee" },
                        ]}
                        onChange={onSelectChange ?? (() => { })}
                    />
                    <SelectField
                        name="gender"
                        label="Gender"
                        value={form.gender}
                        options={[
                            { value: "Male", label: "Male" },
                            { value: "Female", label: "Female" },
                            { value: "Other", label: "Other" },
                        ]}
                        onChange={onSelectChange ?? (() => { })}
                    />
                    <FormField
                        name="city"
                        placeholder="city"
                        label="City"
                        value={form.city}
                        onChange={onChange}
                        required
                    />
                    <FormField
                        name="country"
                        placeholder="country"
                        label="Country"
                        value={form.country}
                        onChange={onChange}
                        required
                    />
                    <SelectField
                        name="departmentID"
                        label="Department"
                        value={form.departmentID}
                        options={form._departments ?? []}
                        onChange={onSelectChange ?? (() => { })}
                    />
                    <SelectField
                        name="positionID"
                        label="Position"
                        value={form.positionID}
                        options={form._positions ?? []}
                        onChange={onSelectChange ?? (() => { })}
                    />
                    <SelectField
                        name="status"
                        label="Status"
                        value={form.status}
                        options={[
                            { value: "active", label: "Active" },
                            { value: "inactive", label: "Inactive" },
                            { value: "terminated", label: "Terminated" },
                            { value: "on_leave", label: "On Leave" },
                        ]}
                        onChange={onSelectChange ?? (() => { })}
                    />

                    <DialogFooter className="col-span-2">
                        <Button type="button" variant="outline" onClick={onClose}>
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
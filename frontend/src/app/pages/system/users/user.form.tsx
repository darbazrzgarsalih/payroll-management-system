import { FormField } from "@/app/components/form/FormField"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { Plus } from "lucide-react"
import { useCreateUsers } from "./user.hooks"
import { SelectField } from "@/app/components/SelectField"
import { useState } from "react"
import { useEmployees } from "../../people/employees/employee.hooks"

export const CreateUser = () => {
    const { loading, submitted, form, handleChange, handleFileChange, createUser, handleSelectChange: hookSelectChange } = useCreateUsers()
    const { employees } = useEmployees()
    const handleSelectChange = (name: string, value: string) => {
        hookSelectChange ? hookSelectChange(name, value) : handleChange({ target: { name, value } } as any)
    }

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const onAvatarSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFileChange(e)
        if (e.target.files && e.target.files[0]) {
            setAvatarPreview(URL.createObjectURL(e.target.files[0]))
        }
    }

    const roles = [
        { value: "super_admin", label: "Super Admin" },
        { value: "admin", label: "Admin" },
        { value: "hr_manager", label: "HR Manager" },
        { value: "payroll_manager", label: "Payroll Manager" },
        { value: "overtime_manager", label: "Overtime Manager" },
        { value: "punishment_manager", label: "Punishment Manager" },
        { value: "employee", label: "Employee" }
    ]

    return (
        <div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button>New <Plus /></Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl! w-full">
                    <DialogHeader>
                        <DialogTitle>New User</DialogTitle>
                        <DialogDescription>Create new user and let them access by role.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2 flex flex-col items-center gap-2 mb-4">
                            <label htmlFor="avatar" className="cursor-pointer relative group">
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
                            label="Username"
                            name="username"
                            value={form.username}
                            placeholder="username"
                            onChange={handleChange}
                            required
                            submitted={submitted}
                        />
                        <FormField
                            label="First Name"
                            name="firstName"
                            value={form.firstName}
                            placeholder="firstName"
                            onChange={handleChange}
                            submitted={submitted}
                        />
                        <FormField
                            label="Last Name"
                            name="lastName"
                            value={form.lastName}
                            placeholder="lastName"
                            onChange={handleChange}
                            submitted={submitted}
                        />
                        <FormField
                            label="Email"
                            name="email"
                            value={form.email}
                            placeholder="email"
                            onChange={handleChange}
                            submitted={submitted}
                        />
                        <SelectField
                            label="Employee"
                            name="employeeID"
                            value={form.employeeID}
                            options={[{ value: "none", label: "None (Admin only)" }, ...employees.map(e => ({
                                value: e.id || "unknown",
                                label: e.employeeName,
                            }))]}
                            onChange={handleSelectChange}
                            submitted={submitted}
                        />

                        <SelectField
                            label="Role"
                            name="role"
                            value={form.role}
                            options={roles}
                            onChange={handleSelectChange}
                            submitted={submitted}
                        />

                        <FormField
                            label="Password"
                            name="password"
                            value={form.password}
                            placeholder="password"
                            onChange={handleChange}
                            submitted={submitted}
                            type="password"
                        />
                        <DialogFooter className="col-span-2">
                            <DialogClose asChild>
                                <Button variant={'outline'}>Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={loading}>
                                {loading ? <Spinner className="h-4 w-4" /> : "Save"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}


export function EditUser({
    open,
    form,
    loading,
    error,
    onChange,
    onSelectChange,
    onSubmit,
    onClose,
    onFileChange,
    avatarFile
}: any) {
    const { employees } = useEmployees()
    const roles = [
        { value: "super_admin", label: "Super Admin" },
        { value: "admin", label: "Admin" },
        { value: "hr_manager", label: "HR Manager" },
        { value: "payroll_manager", label: "Payroll Manager" },
        { value: "overtime_manager", label: "Overtime Manager" },
        { value: "punishment_manager", label: "Punishment Manager" },
        { value: "employee", label: "Employee" }
    ]

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl! w-full">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>edit user informations below.</DialogDescription>
                </DialogHeader>
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
                                    <img src={`${import.meta.env.VITE_BACKEND_URL?.replace('/api/v1', '') || 'http://localhost:8000'}/${form.avatar}`} alt="Current Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs text-muted-foreground">Upload</span>
                                )}
                            </div>
                            <input id="editAvatar" type="file" className="hidden" accept="image/*" onChange={onFileChange} />
                        </label>
                        <span className="text-xs text-muted-foreground">Change Picture</span>
                    </div>

                    {error && <p className="text-destructive col-span-2 text-sm">{error}</p>}

                    <FormField
                        name="username"
                        placeholder="username"
                        label="username"
                        value={form.username}
                        onChange={onChange}
                    />

                    <FormField
                        name="firstName"
                        placeholder="firstName"
                        label="firstName"
                        value={form.firstName}
                        onChange={onChange}
                    />
                    <FormField
                        name="lastName"
                        placeholder="lastName"
                        label="lastName"
                        value={form.lastName}
                        onChange={onChange}
                    />
                    <FormField
                        name="email"
                        placeholder="email"
                        label="email"
                        value={form.email}
                        onChange={onChange}
                    />

                    <SelectField
                        name="role"
                        label="role"
                        value={form.role}
                        options={roles}
                        onChange={onSelectChange}
                    />
                    <SelectField
                        label="Employee Link"
                        name="employeeID"
                        value={form.employeeID}
                        options={[{ value: "none", label: "None (Admin only)" }, ...employees.map((e: any) => ({
                            value: e.id || "unknown",
                            label: e.employeeName,
                        }))]}
                        onChange={onSelectChange}
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
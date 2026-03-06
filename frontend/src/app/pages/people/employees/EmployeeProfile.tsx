import { useParams, useNavigate } from "react-router-dom"
import { useEmployee } from "./employee.hooks"
import { PageHeader } from "@/app/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    ArrowLeft01Icon, UserIcon, WorkHistoryIcon, Mail01Icon, CallIcon,
    Location01Icon, Calendar03Icon, UserGroupIcon, Briefcase01Icon, LicenseIcon,
    FolderAttachmentIcon, Upload01Icon, Download04Icon, Delete02Icon
} from "@hugeicons/core-free-icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DateItem } from "@/app/utils/ItemMappers"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useRef, useState } from "react"
import api from "@/app/services/api"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { ConfirmDelete } from "@/app/components/DeleteConfirm"


type Doc = {
    _id: string; name: string; type: string; fileUrl: string;
    fileSize?: number; mimeType?: string; description?: string;
    expiryDate?: string; isConfidential?: boolean;
    uploadedBy?: { username: string }; createdAt: string
}

function DocumentsTab({ employeeID }: { employeeID: string }) {
    const [docs, setDocs] = useState<Doc[]>([])
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null })
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const fileRef = useRef<HTMLInputElement>(null)
    const [form, setForm] = useState({ name: "", type: "other", description: "" })

    const fetchDocs = async () => {
        setLoading(true)
        try {
            const res = await api.get(`/documents/employee/${employeeID}`)
            setDocs(res.data.documents || [])
        } catch { } finally { setLoading(false) }
    }

    useEffect(() => { if (employeeID) fetchDocs() }, [employeeID])

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!fileRef.current?.files?.[0]) { toast.error("Please select a file"); return }
        if (!form.name.trim()) { toast.error("Please enter a document name"); return }

        const fd = new FormData()
        fd.append("file", fileRef.current.files[0])
        fd.append("employeeID", employeeID)
        fd.append("name", form.name)
        fd.append("type", form.type)
        fd.append("description", form.description)

        setUploading(true)
        try {
            await api.post("/documents", fd, { headers: { "Content-Type": "multipart/form-data" } })
            toast.success("Document uploaded")
            setForm({ name: "", type: "other", description: "" })
            if (fileRef.current) fileRef.current.value = ""
            fetchDocs()
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Upload failed")
        } finally { setUploading(false) }
    }

    const handleDownload = async (doc: Doc) => {
        try {
            const res = await api.get(`/documents/${doc._id}/download`, { responseType: "blob" })
            const url = URL.createObjectURL(res.data)
            const a = document.createElement("a")
            a.href = url; a.download = doc.name; a.click()
            URL.revokeObjectURL(url)
        } catch { toast.error("Download failed") }
    }

    const handleDelete = async () => {
        if (!deleteModal.id) return
        setDeletingId(deleteModal.id)
        try {
            await api.delete(`/documents/${deleteModal.id}`)
            toast.success("Document deleted")
            setDocs(prev => prev.filter(d => d._id !== deleteModal.id))
            setDeleteModal({ open: false, id: null })
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Delete failed")
        } finally { setDeletingId(null) }
    }

    const fmt = (bytes?: number) => bytes ? `${(bytes / 1024).toFixed(1)} KB` : ""

    return (
        <div className="space-y-6">
            { }
            <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                    <HugeiconsIcon icon={Upload01Icon} className="text-primary" />
                    <CardTitle>Upload Document</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpload} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                        <div className="grid gap-1">
                            <label className="text-xs font-medium text-muted-foreground">Name *</label>
                            <input
                                className="border rounded-md px-3 py-2 text-sm bg-background"
                                placeholder="e.g. Employment Contract"
                                value={form.name}
                                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-1">
                            <label className="text-xs font-medium text-muted-foreground">Type</label>
                            <select
                                className="border rounded-md px-3 py-2 text-sm bg-background"
                                value={form.type}
                                onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                            >
                                {["contract", "certificate", "id_proof", "tax_form", "policy", "other"].map(t => (
                                    <option key={t} value={t}>{t.replace("_", " ")}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-1">
                            <label className="text-xs font-medium text-muted-foreground">File *</label>
                            <input ref={fileRef} type="file" className="text-sm" />
                        </div>
                        <div className="sm:col-span-2 grid gap-1">
                            <label className="text-xs font-medium text-muted-foreground">Description</label>
                            <input
                                className="border rounded-md px-3 py-2 text-sm bg-background"
                                placeholder="Optional description"
                                value={form.description}
                                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            />
                        </div>
                        <Button type="submit" disabled={uploading}>
                            {uploading ? <Spinner className="h-4 w-4 mr-2" /> : null}
                            Upload
                        </Button>
                    </form>
                </CardContent>
            </Card>

            { }
            <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                    <HugeiconsIcon icon={FolderAttachmentIcon} className="text-primary" />
                    <CardTitle>Documents ({docs.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-6"><Spinner /></div>
                    ) : docs.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">No documents uploaded yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {docs.map(doc => (
                                <div key={doc._id} className="flex items-center justify-between border rounded-lg px-4 py-3 hover:bg-muted/40 transition-colors">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">{doc.name}</p>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <Badge variant="outline" className="text-xs capitalize">{doc.type.replace("_", " ")}</Badge>
                                            {doc.fileSize && <span className="text-xs text-muted-foreground">{fmt(doc.fileSize)}</span>}
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(doc.createdAt).toLocaleDateString("en-GB")}
                                            </span>
                                            {doc.uploadedBy && <span className="text-xs text-muted-foreground">by {doc.uploadedBy.username}</span>}
                                        </div>
                                        {doc.description && <p className="text-xs text-muted-foreground mt-1">{doc.description}</p>}
                                    </div>
                                    <div className="flex gap-2 shrink-0 ml-3">
                                        <Button size="sm" variant="outline" onClick={() => handleDownload(doc)} title="Download">
                                            <HugeiconsIcon icon={Download04Icon} className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => setDeleteModal({ open: true, id: doc._id })} title="Delete">
                                            <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <ConfirmDelete
                open={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, id: null })}
                onConfirm={handleDelete}
                loading={!!deletingId}
                title="Delete Document"
                description="This will permanently delete the document file. This cannot be undone."
                buttonText="Delete"
            />
        </div>
    )
}


export default function EmployeeProfile() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { employee, loading, error } = useEmployee(id)

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Spinner />
            </div>
        )
    }

    if (error || (!loading && !employee)) {
        return (
            <div className="flex h-[400px] flex-col items-center justify-center gap-4">
                <p className="text-destructive font-medium">{error || "Employee not found"}</p>
                <Button variant="outline" onClick={() => navigate("/app/employees")}>
                    Back to Employees
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate("/app/employees")}>
                    <HugeiconsIcon icon={ArrowLeft01Icon} />
                </Button>

                {employee.personalInfo?.avatar?.trim() ? (
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 shrink-0">
                        <img
                            src={employee.personalInfo.avatar.trim().startsWith('http') ? employee.personalInfo.avatar.trim() : `${(import.meta.env.VITE_BACKEND_URL?.replace('/api/v1', '') || 'http://localhost:8000').replace(/\/+$/, '')}/${employee.personalInfo.avatar.trim().replace(/^\/+/, '')}`}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 bg-muted flex items-center justify-center shrink-0">
                        <HugeiconsIcon icon={UserIcon} className="w-8 h-8 text-muted-foreground" />
                    </div>
                )}

                <PageHeader
                    title={`${employee.personalInfo?.firstName} ${employee.personalInfo?.middleName ? employee.personalInfo.middleName + ' ' : ''}${employee.personalInfo?.lastName}`}
                    description={`Employee profile for ${employee.employeeCode}`}
                />
            </div>

            <Tabs defaultValue="profile">
                <TabsList>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-2">
                            <CardHeader className="flex flex-row items-center gap-2">
                                <HugeiconsIcon icon={UserIcon} className="text-primary" />
                                <CardTitle>Personal Information</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InfoItem label="First Name" value={employee.personalInfo?.firstName} />
                                <InfoItem label="Middle Name" value={employee.personalInfo?.middleName} />
                                <InfoItem label="Last Name" value={employee.personalInfo?.lastName} />
                                <InfoItem label="Email" value={employee.personalInfo?.email} icon={Mail01Icon} />
                                <InfoItem label="Phone" value={employee.personalInfo?.phone} icon={CallIcon} />
                                <InfoItem label="Gender" value={employee.personalInfo?.gender} />
                                <InfoItem label="Date of Birth" value={DateItem(employee.personalInfo?.dateOfBirth)} icon={Calendar03Icon} />
                                <div className="sm:col-span-2">
                                    <InfoItem
                                        label="Address"
                                        icon={Location01Icon}
                                        value={`${employee.personalInfo?.address?.street || ""}, ${employee.personalInfo?.address?.city || ""}, ${employee.personalInfo?.address?.state || ""}, ${employee.personalInfo?.address?.country || ""} ${employee.personalInfo?.address?.zipCode || ""}`}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center gap-2">
                                <HugeiconsIcon icon={LicenseIcon} className="text-primary" />
                                <CardTitle>Work Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${employee.employmentInfo?.status === 'active' ? 'bg-green-100 text-green-700' :
                                        employee.employmentInfo?.status === 'terminated' ? 'bg-red-100 text-red-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                        {employee.employmentInfo?.status}
                                    </span>
                                </div>
                                <InfoItem label="Employee Code" value={employee.employeeCode} />
                                <InfoItem label="Hire Date" value={DateItem(employee.employmentInfo?.hireDate)} icon={Calendar03Icon} />
                                {employee.employmentInfo?.terminationDate && (
                                    <InfoItem label="Termination Date" value={DateItem(employee.employmentInfo?.terminationDate)} icon={Calendar03Icon} />
                                )}
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-2">
                            <CardHeader className="flex flex-row items-center gap-2">
                                <HugeiconsIcon icon={WorkHistoryIcon} className="text-primary" />
                                <CardTitle>Employment Details</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InfoItem label="Department" value={employee.employmentInfo?.departmentID?.name} icon={UserGroupIcon} />
                                <InfoItem label="Position" value={employee.employmentInfo?.positionID?.title} icon={Briefcase01Icon} />
                                <InfoItem label="Manager" value={employee.employmentInfo?.managerID ? `${employee.employmentInfo.managerID.personalInfo?.firstName} ${employee.employmentInfo.managerID.personalInfo?.lastName}` : "No Manager"} />
                                <InfoItem label="Employment Type" value={employee.employmentInfo?.employmentType} />
                                <InfoItem label="Work Schedule" value={employee.employmentInfo?.workSchedule} />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="documents" className="mt-6">
                    <DocumentsTab employeeID={id!} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

function InfoItem({ label, value, icon }: { label: string; value?: string | null; icon?: any }) {
    return (
        <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <div className="flex items-center gap-2">
                {icon && <HugeiconsIcon icon={icon} size={16} className="text-muted-foreground" />}
                <p className="text-sm font-semibold">{value || "—"}</p>
            </div>
        </div>
    )
}

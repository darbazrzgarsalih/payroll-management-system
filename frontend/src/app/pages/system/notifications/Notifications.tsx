import { useState } from "react"
import api from "@/app/services/api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { PageHeader } from "@/app/components/PageHeader"
import { SelectField } from "@/app/components/SelectField"
import { MultiSelectEmployees } from "@/app/components/MultiSelectEmployees"
import { useEffect } from "react"
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
import { Send } from "lucide-react"

const NOTIFICATION_TYPES = ["info", "success", "warning", "error", "reminder"]
const PRIORITY_OPTIONS = ["low", "medium", "high", "urgent"]

type NotificationForm = {
    title: string
    message: string
    type: string
    priority: string
    actionUrl: string
    broadcast: boolean
    userIDs: string[]
}

const defaultForm: NotificationForm = {
    title: "",
    message: "",
    type: "info",
    priority: "medium",
    actionUrl: "",
    broadcast: false,
    userIDs: [],
}

function SendNotificationDialog({ onSent }: { onSent: () => void }) {
    const [open, setOpen] = useState(false)
    const [form, setForm] = useState<NotificationForm>(defaultForm)
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    
    const [users, setUsers] = useState<{ _id: string; username: string }[]>([])
    useEffect(() => {
        if (open) {
            api.get('/users').then(r => setUsers(r.data?.users || [])).catch(() => { })
        }
    }, [open])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const reset = () => {
        setForm(defaultForm)
        setSubmitted(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitted(true)
        if (!form.title.trim() || !form.message.trim()) return
        if (!form.broadcast && form.userIDs.length === 0) return

        setLoading(true)
        try {
            await api.post('/notifications/send', {
                title: form.title,
                message: form.message,
                type: form.type,
                priority: form.priority,
                actionUrl: form.actionUrl || undefined,
                broadcast: form.broadcast,
                userIDs: form.broadcast ? undefined : form.userIDs,
            })
            toast.success("Notification sent successfully!")
            reset()
            setOpen(false)
            onSent()
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to send notification")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
            <DialogTrigger asChild>
                <Button>
                    Send Notification <Send className="ml-2 h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Send Notification</DialogTitle>
                    <DialogDescription>
                        Send a notification to specific users or broadcast to everyone.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <Label>Title <span className="text-destructive">*</span></Label>
                            <Input
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="Notification title"
                                className={submitted && !form.title ? "border-destructive" : ""}
                            />
                        </div>

                        <div className="col-span-2">
                            <Label>Message <span className="text-destructive">*</span></Label>
                            <Textarea
                                name="message"
                                value={form.message}
                                onChange={handleChange}
                                placeholder="Write your message..."
                                rows={3}
                                className={`resize-none ${submitted && !form.message ? "border-destructive" : ""}`}
                            />
                        </div>

                        <SelectField
                            label="Type"
                            name="type"
                            value={form.type}
                            options={NOTIFICATION_TYPES.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
                            onChange={handleSelectChange}
                        />
                        <SelectField
                            label="Priority"
                            name="priority"
                            value={form.priority}
                            options={PRIORITY_OPTIONS.map(p => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }))}
                            onChange={handleSelectChange}
                        />

                        <div className="col-span-2">
                            <Label>Action URL (optional)</Label>
                            <Input
                                name="actionUrl"
                                value={form.actionUrl}
                                onChange={handleChange}
                                placeholder="/app/some-page"
                            />
                        </div>

                        <div className="col-span-2 flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="broadcast"
                                checked={form.broadcast}
                                onChange={e => setForm(prev => ({ ...prev, broadcast: e.target.checked, userIDs: [] }))}
                                className="h-4 w-4"
                            />
                            <Label htmlFor="broadcast" className="cursor-pointer">
                                Broadcast to ALL users
                            </Label>
                        </div>

                        {!form.broadcast && (
                            <div className="col-span-2">
                                <MultiSelectEmployees
                                    label={`Recipients (${form.userIDs.length} selected)`}
                                    options={users.map(u => ({ value: u._id, label: u.username }))}
                                    selectedValues={form.userIDs}
                                    onChange={(vals: string[]) => setForm(prev => ({ ...prev, userIDs: vals }))}
                                />
                                {submitted && !form.broadcast && form.userIDs.length === 0 && (
                                    <p className="text-destructive text-xs mt-1">Select at least one recipient or enable broadcast</p>
                                )}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" type="button" disabled={loading}>Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Spinner /> : "Send"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}


function NotificationsAdminPage() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [total, setTotal] = useState(0)

    const fetchAll = async () => {
        setLoading(true)
        try {
            const r = await api.get('/notifications/admin/all', { params: { limit: 50 } })
            setNotifications(r.data?.notifications || [])
            setTotal(r.data?.total || 0)
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to load notifications")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchAll() }, [])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageHeader
                    title="Notifications"
                    description={total > 0 ? `${total} notifications sent` : "Manage and send notifications"}
                />
                <SendNotificationDialog onSent={fetchAll} />
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><Spinner /></div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No notifications sent yet.</div>
            ) : (
                <div className="space-y-2">
                    {notifications.map((n: any) => (
                        <div
                            key={n._id}
                            className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/10 transition"
                        >
                            <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${n.type === 'error' ? 'bg-destructive' :
                                n.type === 'success' ? 'bg-green-500' :
                                    n.type === 'warning' ? 'bg-yellow-500' :
                                        'bg-primary'
                                }`} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-sm truncate">{n.title}</p>
                                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded capitalize">{n.type}</span>
                                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded capitalize">{n.priority}</span>
                                    {n.isRead ? (
                                        <span className="text-xs text-green-600 bg-green-50 dark:bg-green-950/30 px-1.5 py-0.5 rounded">read</span>
                                    ) : (
                                        <span className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-950/30 px-1.5 py-0.5 rounded">unread</span>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-0.5 truncate">{n.message}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    To: <strong>{n.userID?.username || "Unknown"}</strong> · {new Date(n.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default NotificationsAdminPage

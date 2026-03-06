import { useEffect, useRef, useState } from "react"
import { Bell, CheckCheck, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import api from "@/app/services/api"
import { cn } from "@/lib/utils"

type Notification = {
    _id: string
    title: string
    message: string
    type: string
    priority: string
    isRead: boolean
    createdAt: string
    actionUrl?: string
}

const priorityColors: Record<string, string> = {
    low: "bg-muted",
    medium: "bg-blue-50 dark:bg-blue-950",
    high: "bg-orange-50 dark:bg-orange-950",
    urgent: "bg-red-50 dark:bg-red-950",
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "just now"
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
}

export function NotificationBell() {
    const [open, setOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unread, setUnread] = useState(0)
    const [loading, setLoading] = useState(false)
    const panelRef = useRef<HTMLDivElement>(null)

    const fetchUnread = async () => {
        try {
            const res = await api.get("/notifications/unread-count")
            setUnread(res.data.unreadCount ?? 0)
        } catch { }
    }

    const fetchNotifications = async () => {
        setLoading(true)
        try {
            const res = await api.get("/notifications", { params: { limit: 20 } })
            setNotifications(res.data.notifications || [])
            setUnread(res.data.unreadCount ?? 0)
        } catch { }
        finally { setLoading(false) }
    }

    
    useEffect(() => {
        fetchUnread()
        const interval = setInterval(fetchUnread, 30000)
        return () => clearInterval(interval)
    }, [])

    
    useEffect(() => {
        if (open) fetchNotifications()
    }, [open])

    
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
        }
        if (open) document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [open])

    const markRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`)
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
            setUnread(prev => Math.max(0, prev - 1))
        } catch { }
    }

    const markAllRead = async () => {
        try {
            await api.patch("/notifications/read-all")
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
            setUnread(0)
        } catch { }
    }

    const deleteNotif = async (id: string) => {
        try {
            await api.delete(`/notifications/${id}`)
            const was = notifications.find(n => n._id === id)
            setNotifications(prev => prev.filter(n => n._id !== id))
            if (was && !was.isRead) setUnread(prev => Math.max(0, prev - 1))
        } catch { }
    }

    return (
        <div className="relative" ref={panelRef}>
            <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setOpen(o => !o)}
                aria-label="Notifications"
            >
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                        {unread > 9 ? "9+" : unread}
                    </span>
                )}
            </Button>

            {open && (
                <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-border bg-background shadow-2xl">
                    {}
                    <div className="flex items-center justify-between border-b px-4 py-3">
                        <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold text-sm">Notifications</span>
                            {unread > 0 && <Badge variant="destructive" className="text-xs">{unread} New</Badge>}
                        </div>
                        <div className="flex gap-1">
                            {unread > 0 && (
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={markAllRead} title="Mark all read">
                                    <CheckCheck className="h-4 w-4" />
                                </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {}
                    <div className="max-h-80 overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center py-6"><Spinner className="h-5 w-5" /></div>
                        ) : notifications.length === 0 ? (
                            <div className="py-8 text-center text-sm text-muted-foreground">No notifications</div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n._id}
                                    className={cn(
                                        "group flex gap-3 border-b last:border-0 px-4 py-3 transition-colors hover:bg-muted/50 cursor-pointer",
                                        !n.isRead && priorityColors[n.priority] || "",
                                    )}
                                    onClick={() => !n.isRead && markRead(n._id)}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className={cn("text-sm font-medium truncate", !n.isRead && "text-foreground", n.isRead && "text-muted-foreground")}>
                                            {n.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                                        <p className="text-xs text-muted-foreground/60 mt-1">{timeAgo(n.createdAt)}</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0 mt-0.5"
                                        onClick={(e) => { e.stopPropagation(); deleteNotif(n._id) }}
                                        title="Delete"
                                    >
                                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

"use client"
import * as React from "react"
import htlogo from '../../assets/hightechoriginal.png'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { SIDEBAR_CONFIG } from "../config/sidebar"
import { hasPermission } from "../utils/hasPermission"
import { Outlet, Link } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { useContext } from "react"
import { ModeToggle } from '@/components/mode-toggle'
import { NotificationBell } from "@/app/components/NotificationBell"
import SidebarUser from "@/components/sidebar-user"
import { useState } from "react"
import Breadcrumbs from "@/components/Breadcrumbs"
import { Minus, Plus } from "lucide-react"


export default function DashboardShell() {
    return (
        <SidebarProvider
            defaultOpen={true}
            style={
                {
                    "--sidebar-width": "250px",
                    "--header-height": "56px",
                } as React.CSSProperties
            }
        >
            <AppSidebar />
            <SidebarInset>
                <Header />
                <main className="flex-1 p-6 bg-background">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}


function AppSidebar() {
    const { user } = useContext(AuthContext)
    const { state } = useSidebar()

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

    const toggleGroup = (group: string) => {
        setOpenGroups(prev => ({
            ...prev,
            [group]: !prev[group]
        }))
    }

    return (
        <Sidebar collapsible="icon" className="print:hidden">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton className="flex w-full justify-center items-center mb-4">
                            <img src={htlogo} className="w-10 rounded-full object-contain h-10 p-1" />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className='py-2 px-3'>
                {SIDEBAR_CONFIG.map(group => {
                    const visibleLinks = group.links.filter(link => {
                        if ((link as any).hideForRoles && (link as any).hideForRoles.includes(user.role)) return false
                        return link.permission ? hasPermission(user.role, link.permission) : true
                    })

                    if (visibleLinks.length === 0) return null
                    const isOpen = openGroups[group.group] ?? true

                    return (
                        <div key={group.group} className="mb-4">
                            {state === "expanded" && (
                                <button
                                    onClick={() => toggleGroup(group.group)}
                                    className="flex w-full items-center justify-between px-2 py-1.5 text-xs font-extrabold uppercase text-muted-foreground hover:text-foreground transition cursor-pointer"
                                >
                                    <span>{group.group}</span>
                                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                </button>
                            )}

                            <SidebarMenu className="gap-1">
                                {(state === "expanded" ? (isOpen ? visibleLinks : []) : visibleLinks).map(link => (
                                    <SidebarMenuItem key={link.path}>
                                        <SidebarMenuButton asChild className="rounded-sm" tooltip={link.label}>
                                            <Link to={link.path} className="flex  items-center gap-3 px-2 py-2 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-sm">
                                                <span className="shrink-0">{link.icon}</span>
                                                {state === "expanded" && (
                                                    <span className="font-medium text-sm">{link.label}</span>
                                                )}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </div>
                    )
                })}
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarUser />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}


function Header() {
    return (
        <header className="flex h-[56px] items-center gap-2 border-b border-border bg-accent/50 px-4 print:hidden">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-20" />
            <div className='flex w-full justify-between items-center'>
                <Breadcrumbs />
                <div className="shrink-0 flex items-center gap-2">
                    <NotificationBell />
                    <ModeToggle />
                </div>
            </div>
        </header>
    )
}


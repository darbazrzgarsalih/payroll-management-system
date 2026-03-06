"use client"


import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { useContext } from "react"
import { AuthContext } from "@/app/context/AuthContext"
import { HugeiconsIcon } from "@hugeicons/react"
import { Logout02Icon, UserCircle02Icon } from "@hugeicons/core-free-icons"
import { ChevronsUpDown } from "lucide-react"
import { Link } from "react-router-dom"
function SidebarUser() {
    const { isMobile } = useSidebar()
    const { user, logout } = useContext(AuthContext)

    
    const actualAvatar = (user?.avatar || user?.employee?.personalInfo?.avatar)?.trim();
    const avatarUrl = (() => {
        if (!actualAvatar) return null;
        if (actualAvatar.startsWith('http')) return actualAvatar;
        const baseUrl = import.meta.env.VITE_BACKEND_URL?.replace('/api/v1', '') || 'http://localhost:8000';
        return `${baseUrl.replace(/\/+$/, '')}/${actualAvatar.replace(/^\/+/, '')}`;
    })();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="
                                    h-10
                                    data-[state=open]:bg-sidebar-accent
                                    data-[state=open]:text-sidebar-accent-foreground
                                    group
                                "
                        >
                            <Avatar className="">
                                    {avatarUrl ? <AvatarImage className="object-cover" src={avatarUrl} /> : <AvatarFallback><HugeiconsIcon icon={UserCircle02Icon} className="w-4 h-4" /></AvatarFallback>}
                            </Avatar>
                            <div className="
                                grid flex-1 text-left text-sm leading-tight
                                group-data-[collapsible=icon]:hidden
">
                                <span className="truncate font-semibold">
                                    {user?.username}
                                </span>
                            </div>
                            <ChevronsUpDown />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-sm">
                                    {avatarUrl ? <AvatarImage className="object-cover" src={avatarUrl} /> : <AvatarFallback><HugeiconsIcon icon={UserCircle02Icon} className="w-4 h-4" /></AvatarFallback>}
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate text-black dark:text-white/90 font-bold">{user.username}</span>
                                    <span className="text-muted-foreground font-medium truncate text-xs">
                                        {user?.email}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <Link to={`/app/account`} className="flex items-center gap-2 w-full">
                                    <HugeiconsIcon icon={UserCircle02Icon} />
                                    Account
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout}>
                            <HugeiconsIcon icon={Logout02Icon} />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}


export default SidebarUser
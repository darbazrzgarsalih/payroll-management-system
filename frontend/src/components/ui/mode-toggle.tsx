import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"

export function ModeToggle() {
    const { setTheme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="" size={'sm'}>
                    <Sun className="h-[1rem] w-[1.2rem]  scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                    <Moon className="absolute h-[1rem] w-[4rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[10rem]">
                <DropdownMenuItem className="text-xs" onClick={() => setTheme("light")}>
                     دۆخی ڕووناک
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs" onClick={() => setTheme("dark")}>
                    دۆخی تاریک
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs" onClick={() => setTheme("system")}>
                    System preference
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

import { cn } from "@/lib/utils"

function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn("w-5 h-5 border-4 border-slate-900 border-t-transparent dark:border-white dark:border-t-transparent animate-spin rounded-full", className)}></div>
  )
}

export { Spinner }

import { Link, useLocation } from "react-router-dom"
import { getBreadcrumbs } from "../app/utils/breadcrumbs"
import { ArrowRight, ChevronRight, ChevronsRight } from "lucide-react"

export default function Breadcrumbs() {
    const location = useLocation()
    const breadcrumbs = getBreadcrumbs(location.pathname)

    if (breadcrumbs.length === 0) return null

    return (
        <nav className="flex items-center text-sm text-muted-foreground gap-2">
            {breadcrumbs.map((crumb, index) => (
                <div key={crumb.path} className="flex items-center gap-2">
                    {index > 0 && <ChevronRight className="h-4 w-4" />}
                    <Link
                        to={crumb.path}
                        className="  capitalize font-semibold dark:text-slate-200 text-[10px] md:text-sm ml-1 md:ml-8 flex items-center gap-2 tracking-wider transition"
                    >
                        {crumb.group} /  {crumb.label}
                    </Link>
                </div>
            ))}
        </nav>
    )
}
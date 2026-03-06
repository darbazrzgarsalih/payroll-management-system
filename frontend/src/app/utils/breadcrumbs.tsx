import { SIDEBAR_CONFIG } from "../config/sidebar"

export function getBreadcrumbs(pathname: string) {
    const parts = pathname.split("/").filter(Boolean)

    const breadcrumbs: { group: string,label: string; path: string }[] = []
    let currentPath = ""

    for (const part of parts) {
        currentPath += `/${part}`

        for (const group of SIDEBAR_CONFIG) {
            const link = group.links.find(l => l.path === part)

            if (link) {
                breadcrumbs.push({
                    label: link.breadcrumb ?? link.label,
                    path: currentPath,
                    group: group.group
                })
            }
        }
    }

    return breadcrumbs
}
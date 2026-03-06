type PageHeaderProps = {
    title: string
    description?: string
    children?: React.ReactNode
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
    return (
        <div className="mb-6 flex items-center justify-between">
            <div>
                <h1 className="text-sm md:text-xl font-semibold dark:text-white">{title}</h1>
                {description && (
                    <p className="text-muted-foreground text-xs">{description}</p>
                )}
            </div>
            {children}
        </div>
    )
}
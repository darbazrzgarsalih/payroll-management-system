import { Button } from "@/components/ui/button"

type PaginationProps = {
    page: number
    limit: number
    total: number
    onPageChange: (page: number) => void
}

export function Pagination({
    page,
    limit,
    total,
    onPageChange,
}: PaginationProps) {
    const totalPages = Math.ceil(total / limit)

    if (totalPages <= 1) return null

    return (
        <div className="flex items-center justify-center gap-2 mt-4">
            <Button
                variant={'outline'}
                className="disabled:opacity-50"
                disabled={page === 1}
                onClick={() => onPageChange(page - 1)}
            >
                Prev
            </Button>

            <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
            </span>

            <Button
                variant={'outline'}
                className=" disabled:opacity-50"
                disabled={page === totalPages}
                onClick={() => onPageChange(page + 1)}
            >
                Next
            </Button>
        </div>
    )
}
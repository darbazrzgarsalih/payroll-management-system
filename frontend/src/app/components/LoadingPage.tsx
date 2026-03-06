import { Spinner } from "@/components/ui/spinner"

export function LoadingPage() {
    return (
        <div className="flex flex-col gap-4 justify-center items-center h-[calc(100vh-100px)] w-full text-muted-foreground animate-in fade-in duration-500">
            <Spinner className="h-8 w-8 border-4" />
        </div>
    )
}

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"

export const ConfirmDelete = ({
    open,
    onClose,
    onConfirm,
    loading,
    title = "Delete item?",
    description = "This action cannot be undone.",
    buttonText
}: any) => {
    if (!open) return null

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onConfirm} disabled={loading}>
                        {loading ? <Spinner /> : buttonText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
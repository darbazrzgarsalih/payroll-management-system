

import { FormField } from "@/app/components/form/FormField"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { Plus } from "lucide-react"
import { useCreateShifts, useShifts } from "./shift.hooks"




export const CreateShift = () => {
  const { refetch } = useShifts()
  const { loading, error, handleChange, submitted, form, createShift } = useCreateShifts({ refetch })
  const isInvalid = (value: string) => submitted && !value
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>New <Plus /></Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>New Shift</DialogTitle>
          <DialogDescription>Create a new working shift.</DialogDescription>
        </DialogHeader>

        <form onSubmit={createShift} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Name"
            name="name"
            value={form.name}
            placeholder="Morning Shift"
            onChange={handleChange}
            required
            submitted={submitted}
          />

          <FormField
            label="Code"
            name="code"
            value={form.code}
            placeholder="MS-01"
            onChange={handleChange}
          />

          <FormField
            label="Start Time"
            name="startTime"
            value={form.startTime}
            onChange={handleChange}
            type="time"
            required
            submitted={submitted}
          />

          <FormField
            label="End Time"
            name="endTime"
            value={form.endTime}
            onChange={handleChange}
            type="time"
            required
            submitted={submitted}
          />

          <FormField
            label="Break Minutes"
            name="breakMinutes"
            value={form.breakMinutes}
            onChange={handleChange}
            type="number"
          />

          <FormField
            label="Grace Period (Minutes)"
            name="gracePeriodMinutes"
            value={form.gracePeriodMinutes}
            onChange={handleChange}
            type="number"
          />

          <FormField
            label="Overtime Threshold (Minutes)"
            name="overtimeThresholdMinutes"
            value={form.overtimeThresholdMinutes}
            onChange={handleChange}
            type="number"
          />

          <DialogFooter className="col-span-2">
            <DialogClose asChild>
              <Button variant={'outline'}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? <Spinner /> : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}




export function EditShift({
  open,
  form,
  loading,
  error,
  onChange,
  onSubmit,
  onClose,
}: any) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Shift</DialogTitle>
          <DialogDescription>Edit shift information below.</DialogDescription>
        </DialogHeader>

        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
        >
          {error && <p className="text-destructive">{error}</p>}

          <FormField
            name="name"
            label="Name"
            value={form.name}
            onChange={onChange}
            required
          />

          <FormField
            name="code"
            label="Code"
            value={form.code}
            onChange={onChange}
          />

          <FormField
            name="startTime"
            label="Start Time"
            value={form.startTime}
            onChange={onChange}
            type="time"
          />

          <FormField
            name="endTime"
            label="End Time"
            value={form.endTime}
            onChange={onChange}
            type="time"
          />

          <FormField
            name="breakMinutes"
            label="Break Minutes"
            value={form.breakMinutes}
            onChange={onChange}
            type="number"
          />

          <FormField
            name="gracePeriodMinutes"
            label="Grace Period (Minutes)"
            value={form.gracePeriodMinutes}
            onChange={onChange}
            type="number"
          />

          <FormField
            name="overtimeThresholdMinutes"
            label="Overtime Threshold (Minutes)"
            value={form.overtimeThresholdMinutes}
            onChange={onChange}
            type="number"
          />

          <DialogFooter className="col-span-2">
            <Button type="button" variant={'outline'} onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Spinner /> : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
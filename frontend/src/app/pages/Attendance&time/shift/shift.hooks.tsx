

import api from "@/app/services/api"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export type Shift = {
  _id?: string
  enr: number
  name: string
  code?: string
  startTime: string
  endTime: string
  breakMinutes: number
  gracePeriodMinutes: number
  overtimeThresholdMinutes: number
  status: string
}




export function useShifts() {
  const [page, setPage] = useState<number>(1)
  const [limit] = useState<number>(10)
  const [total, setTotal] = useState<number>(0)
  const [status, setStatus] = useState<string>("")
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchShifts = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get("/shifts", {
        params: {
          page,
          limit,
          status: status && status !== "all_status" ? status : undefined
        }
      })

      setShifts(res.data.shifts || [])
      setTotal(res.data.total || 0)
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch shifts")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShifts()
  }, [page, status])

  return {
    shifts,
    loading,
    error,
    refetch: fetchShifts,
    page,
    limit,
    total,
    setPage,
    status,
    setStatus
  }
}

type ShiftForm = {
    name: string,
    code: string,
    startTime: string,
    endTime: string,
    breakMinutes: number,
    gracePeriodMinutes: number,
    overtimeThreshouldMinutes: number
}




export function useCreateShifts({ refetch }: { refetch: () => void }) {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<null | string>(null)
    const [submitted, setSubmitted] = useState<boolean>(false)
    const [form, setForm] = useState<ShiftForm>({
        name: "",
        code: "",
        startTime: "",
        endTime: "",
        breakMinutes: 0,
        gracePeriodMinutes: 0,
        overtimeThreshouldMinutes: 0
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
        setError(null)
    }

    const createShift = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSubmitted(false)

        try {
            await api.post('/shifts', {
                name: form.name,
                code: form.code,
                startTime: form.startTime,
                endTime: form.endTime,
                breakMinutes: form.breakMinutes,
                gracePeriod: form.gracePeriodMinutes,
                overtimeThreshould: form.overtimeThreshouldMinutes
            })

            toast.success('Shift has been created successfully')
            refetch()
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Creation failed")
        } finally {
            setLoading(false)
        }
    }

    return {
        loading,
        error,
        submitted,
        form,
        handleChange,
        createShift
    }
}


type ShiftEditForm = {
    name: string,
    startTime: string,
    endTime: string,
    breakMinutes: number,
    gracePeriodMinutes: number,
    overtimeThreshouldMinutes: number
}


export function useEditshifts({ refetch }: { refetch: () => void }) {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [shiftId, setshiftId] = useState<string | null>(null)
    const [open, setOpen] = useState<boolean>(false)
    const [initialForm, setInitialForm] = useState<ShiftEditForm | null>(null)
    const [form, setForm] = useState<ShiftEditForm>({
        name: "",
        startTime: "",
        endTime: "",
        breakMinutes: 0,
        gracePeriodMinutes: 0,
        overtimeThreshouldMinutes: 0
    })

    const openEdit = (shift: any) => {
        setshiftId(shift._id)
        const initialData = {
            name: shift.name ?? "",
            startTime: shift.startTime ?? "",
            endTime: shift.endTime ?? "",
            breakMinutes: shift.breakMinutes ?? 0,
            gracePeriodMinutes: shift.gracePeriodMinutes ?? 0,
            overtimeThreshouldMinutes: shift.overtimeThreshouldMinutes ??0
        }

        setForm(initialData)
        setOpen(true)
        setInitialForm(initialData)
    }

    const closeEdit = () => {
        setOpen(false)
        setError(null)
        setInitialForm(null)
        setshiftId(null)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const submitEdit = async () => {
        if (!shiftId) return
        if (initialForm && JSON.stringify(form) === JSON.stringify(initialForm)) {
            toast.info("No update dats provided")
            return
        }
        setLoading(true)
        setError(null)

        const payload = {
            'name': form.name,
            'startTime': form.startTime,
            'endTime': form.endTime,
            'breakMinutes': form.breakMinutes,
            'gracePeriodMinutes': form.gracePeriodMinutes,
            'overtimeThreshouldMinutes': form.overtimeThreshouldMinutes
        }

        try {
            await api.put(`/shifts/${shiftId}`, payload)
            toast.success("shift updated")
            closeEdit()
            refetch()
        } catch (err: any) {
            setError(err?.response?.data?.message || "Cannot edit shift")
        } finally {
            setLoading(false)
        }
    }

    return {
        open,
        loading,
        error,
        form,
        openEdit,
        closeEdit,
        handleChange,
        submitEdit,
        setForm
    }
}




export function useDeactivateShift({ refetch }: { refetch: () => void }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const deactivateShift = async (id: string) => {
    setLoadingId(id)
    setError(null)
    try {
      await api.patch(`/shifts/${id}/deactivate`)
      toast.success("Shift deactivated successfully")
      refetch()
      return true
    } catch (err: any) {
      setError(err?.response?.data?.message || "Cannot deactivate shift")
      return false
    } finally {
      setLoadingId(null)
    }
  }

  return { deactivateShift, loadingId, error }
}

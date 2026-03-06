import api from "@/app/services/api"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export type SettingsData = {
    id?: string
    companyName: string
    companyTitle: string
    companyLogo?: string
    companyAddress: {
        street: string
        city: string
        state: string
        country: string
        zipCode: string
    }
    companyContact: {
        email: string
        phone: string
        website: string
    }
    taxID?: string
    registrationNumber?: string
}

export function useSettings() {
    const [settings, setSettings] = useState<SettingsData | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [updateLoading, setUpdateLoading] = useState<boolean>(false)

    const fetchSettings = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await api.get('/settings')
            setSettings(res.data.settings)
        } catch (err: any) {
            setError(err?.response?.data?.message || "Could not fetch settings")
        } finally {
            setLoading(false)
        }
    }

    const updateSettings = async (data: Partial<SettingsData>, logoFile?: File) => {
        setUpdateLoading(true)
        setError(null)
        try {
            const formData = new FormData()


            if (logoFile) {
                formData.append('logo', logoFile)
            }

            // Send rest of data as JSON to handle nested objects easily
            formData.append('settings', JSON.stringify(data))

            await api.patch('/settings', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            toast.success("Settings updated successfully")
            await fetchSettings()
            return true
        } catch (err: any) {
            setError(err?.response?.data?.message || "Could not update settings")
            toast.error(err?.response?.data?.message || "Update failed")
            return false
        } finally {
            setUpdateLoading(false)
        }
    }

    useEffect(() => {
        fetchSettings()
    }, [])

    return {
        settings,
        loading,
        error,
        updateSettings,
        updateLoading,
        refetch: fetchSettings
    }
}

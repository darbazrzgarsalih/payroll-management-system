import { useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { ModeToggle } from "@/components/mode-toggle"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import api from "@/app/services/api"
import { toast } from "sonner"

export default function ResetPassword() {
    const { token } = useParams<{ token: string }>()
    const navigate = useNavigate()
    const [form, setForm] = useState({ password: "", confirmPassword: "" })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [done, setDone] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(p => ({ ...p, [e.target.name]: e.target.value }))
        setError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.password || !form.confirmPassword) { setError("Both fields are required"); return }
        if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return }
        if (form.password.length < 8) { setError("Password must be at least 8 characters"); return }

        setLoading(true); setError(null)
        try {
            await api.post(`/auth/reset-password/${token}`, form)
            setDone(true)
            toast.success("Password reset! You can now log in.")
            setTimeout(() => navigate("/"), 3000)
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Reset failed. Link may have expired."
            setError(msg)
            toast.error(msg)
        } finally { setLoading(false) }
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <header className="p-4 flex justify-between items-center">
                <Link to="/" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                    ← Back to Login
                </Link>
                <ModeToggle />
            </header>

            <main className="flex flex-1 items-center justify-center px-4">
                <div className="w-full max-w-sm space-y-6">
                    <div className="text-center space-y-1">
                        <h1 className="text-2xl font-bold">Reset Password</h1>
                        <p className="text-sm text-muted-foreground">Enter your new password below.</p>
                    </div>

                    {done ? (
                        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center space-y-2">
                            <p className="text-sm font-medium text-green-700 dark:text-green-300">Password reset successfully!</p>
                            <p className="text-xs text-green-600 dark:text-green-400">Redirecting to login...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && <p className="text-sm text-destructive">{error}</p>}
                            <Input
                                type="password"
                                name="password"
                                placeholder="New password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                autoFocus
                            />
                            <Input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm new password"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Spinner className="h-4 w-4 mr-2" /> : null}
                                Reset Password
                            </Button>
                        </form>
                    )}
                </div>
            </main>
        </div>
    )
}

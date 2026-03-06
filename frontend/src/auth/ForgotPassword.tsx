import { useState } from "react"
import { Link } from "react-router-dom"
import { ModeToggle } from "@/components/mode-toggle"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import api from "@/app/services/api"
import { toast } from "sonner"

export default function ForgotPassword() {
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1) // 1: Email, 2: OTP & Reset
    const [error, setError] = useState<string | null>(null)

    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim()) { setError("Email is required"); return }
        setLoading(true); setError(null)
        try {
            await api.post("/auth/forgot-password", { email })
            setStep(2)
            toast.success("OTP sent to your email!")
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Something went wrong"
            setError(msg)
            toast.error(msg)
        } finally { setLoading(false) }
    }

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!otp.trim() || !password.trim() || !confirmPassword.trim()) {
            setError("All fields are required")
            return
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }
        setLoading(true); setError(null)
        try {
            await api.post("/auth/reset-password", { email, otp, password, confirmPassword })
            toast.success("Password reset successful!")
            setStep(3) 
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Invalid OTP or something went wrong"
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
                        <h1 className="text-2xl font-bold">
                            {step === 3 ? "Success!" : "Reset Password"}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {step === 1 && "Enter your email to receive a 6-digit code."}
                            {step === 2 && "Enter the 6-digit code sent to your email."}
                            {step === 3 && "Your password has been changed."}
                        </p>
                    </div>

                    {step === 1 && (
                        <form onSubmit={handleRequestOTP} className="space-y-4">
                            {error && <p className="text-sm text-destructive">{error}</p>}
                            <Input
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setError(null) }}
                                required
                                autoFocus
                            />
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Spinner className="h-4 w-4 mr-2" /> : null}
                                Send Code
                            </Button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            {error && <p className="text-sm text-destructive">{error}</p>}
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground ml-1">Email</p>
                                <Input value={email} disabled className="opacity-70" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground ml-1">6-Digit Code</p>
                                <Input
                                    placeholder="000000"
                                    value={otp}
                                    onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(null) }}
                                    className="text-center tracking-[1em] font-bold"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground ml-1">New Password</p>
                                <Input
                                    type="password"
                                    placeholder="New password"
                                    value={password}
                                    onChange={e => { setPassword(e.target.value); setError(null) }}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground ml-1">Confirm New Password</p>
                                <Input
                                    type="password"
                                    placeholder="Confirm password"
                                    value={confirmPassword}
                                    onChange={e => { setConfirmPassword(e.target.value); setError(null) }}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Spinner className="h-4 w-4 mr-2" /> : null}
                                Reset Password
                            </Button>
                        </form>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                                    Done! You can now log in with your new password.
                                </p>
                            </div>
                            <Button asChild className="w-full">
                                <Link to="/">Go to Login</Link>
                            </Button>
                        </div>
                    )}

                    <p className="text-center text-xs text-muted-foreground">
                        {step === 1 ? (
                            <>
                                Remembered it?{" "}
                                <Link to="/" className="underline hover:text-foreground transition-colors">Log in</Link>
                            </>
                        ) : step === 2 ? (
                            <button onClick={() => setStep(1)} className="underline hover:text-foreground transition-colors">
                                Use a different email
                            </button>
                        ) : null}
                    </p>
                </div>
            </main>
        </div>
    )
}

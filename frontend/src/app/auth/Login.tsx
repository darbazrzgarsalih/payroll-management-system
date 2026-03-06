import React, { useContext, useEffect, useState } from "react"
import { AuthContext } from "../context/AuthContext"
import { Link } from "react-router-dom"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ModeToggle } from "@/components/mode-toggle"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import { useNavigate } from "react-router-dom"
import htlogo from '../../assets/hightechoriginal.png'
function Login() {
    const navigate = useNavigate()
    const { login, user, loading, error } = useContext(AuthContext)
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    })
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [validationErrors, setValidationErrors] = useState({
        username: "",
        password: ""
    })
    const [touched, setTouched] = useState({
        username: false,
        password: false
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        if (validationErrors[name as keyof typeof validationErrors]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ""
            }))
        }
    }

    const handleBlur = (field: keyof typeof touched) => {
        setTouched(prev => ({
            ...prev,
            [field]: true
        }))
        if (!formData[field]) {
            setValidationErrors(prev => ({
                ...prev,
                [field]: `Please enter ${field === "username" ? "username" : "password"}`
            }))
        }
    }

    const validateForm = () => {
        const errors = {
            username: "",
            password: ""
        }
        let isValid = true

        if (!formData.username.trim()) {
            errors.username = "Account username is required"
            isValid = false
        }

        if (!formData.password) {
            errors.password = "Account password is required"
            isValid = false
        }

        setValidationErrors(errors)
        setTouched({
            username: true,
            password: true
        })

        return isValid
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }
        await login(formData)
    }

    useEffect(() => {
        if (user) {
            navigate('/app', { replace: true })
        }
    }, [user, navigate])

    const getInputClassName = (field: keyof typeof validationErrors) => {
        const baseClasses = "w-full transition-all duration-200"

        if (touched[field] && validationErrors[field]) {
            return `${baseClasses} border-destructive focus-visible:ring-destructive`
        }
        return baseClasses
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-background/20 via-background/50 to-muted/60">
            <nav className="sticky top-0 z-50 py-3 px-5 md:px-10 border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img
                            width={30}
                            className=" md:w-15 md:h-15 object-contain transition-transform hover:scale-105"
                            src={htlogo}
                            alt="HighTech Logo"
                        />
                        <p></p>
                    </div>
                    <ModeToggle />
                </div>
            </nav>

            <main className="flex justify-center items-center min-h-[calc(100vh-80px)] p-4">
                <div className="w-full max-w-md">
                    <form
                        className="bg-card/30 border border-border/50 rounded-xl shadow p-6 md:p-6 space-y-6 transition-all duration-300"
                        onSubmit={handleSubmit}
                    >
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-semibold dark:text-white  uppercase">Login to your account</h2>
                                <img width={30} className="" src={htlogo} />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Enter your credentials to log in.
                            </p>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="username" className="text-sm font-medium">
                                        Username
                                    </Label>
                                </div>
                                <Input
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    placeholder="Enter your username"
                                    onChange={handleChange}
                                    onBlur={() => handleBlur("username")}
                                    className={getInputClassName("username")}
                                    disabled={loading}
                                />
                                {touched.username && validationErrors.username && (
                                    <div className="flex items-center gap-1 text-destructive text-sm">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{validationErrors.username}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="w-full flex justify-between items-center">
                                        <Label htmlFor="password" className="text-sm font-medium">
                                            Password
                                        </Label>
                                        <Button onClick={() => setShowPassword(!showPassword)} type="button" variant={'ghost'}>
                                            {showPassword ? <Eye /> : <EyeOff />}
                                        </Button>
                                    </div>
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type={`${showPassword ? "text" : "password"}`}
                                    value={formData.password}
                                    placeholder="Enter your password"
                                    onChange={handleChange}
                                    onBlur={() => handleBlur("password")}
                                    className={getInputClassName("password")}
                                    disabled={loading}
                                />
                                {touched.password && validationErrors.password && (
                                    <div className="flex items-center gap-1 text-destructive text-sm">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{validationErrors.password}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="mt-2 mx-1">
                                <div className="flex items-center gap-2 text-destructive">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-sm font-medium">{error}</span>
                                </div>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-10 text-base font-semibold transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                            disabled={loading}
                            size="lg"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <Spinner className="w-4 h-4 animate-spin" />
                                </div>
                            ) : (
                                "LOGIN"
                            )}
                        </Button>
                        <p className="text-center text-sm text-muted-foreground">
                            <Link
                                to="/forgot-password"
                                className="underline hover:text-foreground transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </p>
                    </form>
                </div>
            </main>
        </div>
    )
}

export default Login
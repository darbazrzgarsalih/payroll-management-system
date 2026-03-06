import React, { createContext, useState } from "react"
import api from "../services/api"
import { hasPermission } from '../utils/hasPermission';

interface AuthContextType {
    user: any | null,
    loading: boolean,
    error: string | null
    login: (data: { username: string, password: string }) => Promise<any>,
    logout: () => void,
    hasAccess: (permission: string) => boolean
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType)

function AuthContextProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(() => {
        try {
            const storedUser = localStorage.getItem("user")
            if (storedUser && storedUser !== "undefined") {
                return JSON.parse(storedUser)
            }
            return null
        } catch (error) {
            console.error("Failed to parse user from localStorage:", error)
            localStorage.removeItem("user")
            return null
        }
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)


    React.useEffect(() => {
        const token = localStorage.getItem("token")
        if (token) {
            api.get('/auth/profile').then(res => {
                if (res.data?.user) {
                    setUser(res.data.user)
                    localStorage.setItem("user", JSON.stringify(res.data.user))
                }
            }).catch(err => {
                console.error("Silent session sync failed:", err)
            });
        }
    }, [])

    const login = async (formData: { username: string; password: string }) => {
        setLoading(true)
        setError(null)

        try {
            const res = await api.post("/auth/login", formData)

            localStorage.setItem("token", res.data.token)
            localStorage.setItem("user", JSON.stringify(res.data.user))

            setUser(res.data.user)
            return { success: true, user: res.data.user }
        } catch (err: any) {
            console.error("Login attempt failed:", {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                url: err.config?.url
            });

            let msg = "Login failed";
            if (err.message === "Network Error") {
                msg = "Cannot connect to server. Check VITE_API_URL in Vercel settings.";
            } else if (err.response?.data?.message) {
                msg = err.response.data.message;
            } else if (err.response?.status === 401) {
                msg = "Incorrect username or password";
            }

            setError(msg)
            return { success: false, error: msg }
        } finally {
            setLoading(false)
        }
    }

    const logout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setUser(null)
    }

    const hasAccess = (permission: string) => {
        if (!user || !user.role) return false;
        return hasPermission(user.role, permission);
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, logout, hasAccess }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContextProvider

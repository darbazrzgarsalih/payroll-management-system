import { Routes, Route, Navigate } from "react-router-dom"
import Login from "./app/auth/Login"
import ProtectedRoute from "./app/auth/ProtectedRoute"
import RoleRoute from "./app/auth/RoleRoute"
import DashboardShell from "./app/layout/DashboardShell"
import { ROUTES_CONFIG } from "./app/routes/routes"
import AuthContextProvider from "./app/context/AuthContext"
import { ThemeProvider } from "./components/theme-provider"
import ForgotPassword from "./auth/ForgotPassword"
import ResetPassword from "./auth/ResetPassword"


export default function App() {

  return (
    <ThemeProvider defaultTheme="light" storageKey="hrms-theme">
      <AuthContextProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/auth/login" />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<DashboardShell />}>
              <Route index element={<Navigate to="dashboard" />} />
              {ROUTES_CONFIG.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <RoleRoute permission={route.permission}>
                      {route.component}
                    </RoleRoute>
                  }
                />
              ))}
            </Route>
          </Route>
        </Routes>
      </AuthContextProvider>
    </ThemeProvider>
  )
}

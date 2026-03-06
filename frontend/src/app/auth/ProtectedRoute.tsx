import React, { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { Spinner } from '@/components/ui/spinner'
import { Navigate, Outlet } from 'react-router-dom'

function ProtectedRoute() {
    const { user, loading } = useContext(AuthContext)
    if(loading) {
        return <Spinner />
    }
    if(!user) {
        return <Navigate to={'/auth/login'} />
    }
  return <Outlet />
}

export default ProtectedRoute
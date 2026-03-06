import { Navigate } from "react-router-dom";
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Spinner } from "@/components/ui/spinner";
import { hasPermission } from "../utils/hasPermission";

interface RoleRouteProps {
    permission?: string,
    children: React.ReactNode
}

export default function RoleRoute({ permission, children }: RoleRouteProps) {

    const { user, loading, hasAccess } = useContext(AuthContext);
    
    
    
    if (loading) return <Spinner />;
    if (!user) return <Navigate to={'/login'} />;
    if (!hasAccess(permission)) {
        
        return <Navigate to={'/app/dashboard'} replace />;
    }
    return <>{children}</>;
}
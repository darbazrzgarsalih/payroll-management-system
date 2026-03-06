import { ROLE_PERMISSIONS } from "../config/role-permissions";

export const hasPermission = (role: string, permission: string): boolean => {
    if (!role || !permission) return false;

    
    const rolePermissions = ROLE_PERMISSIONS[role];

    if (!rolePermissions) return false;

    
    return rolePermissions.includes(permission);
};
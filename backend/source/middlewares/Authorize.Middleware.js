import { ROLE_PERMISSIONS } from "../role/roles.js";
import { UnauthorizedError } from "../utils/Error.Classes.js";

export const authorize = (requiredPermission) => {
    return (req, res, next) => {
        const roles = req.user?.roles || req.user?.role;

        if (!roles) {
            return next(new UnauthorizedError("Unauthorized"));
        }

        const roleList = Array.isArray(roles) ? roles : [roles];

        if (roleList.includes("super_admin")) {
            return next()
        }

        const userPermissions = new Set();

        for (const role of roleList) {
            const permissions = ROLE_PERMISSIONS[role] || [];
            permissions.forEach(p => userPermissions.add(p));
        }

        if (!userPermissions.has(requiredPermission)) {
            return next(new UnauthorizedError("Insufficient permissions"));
        }

        next();
    }
}
import { useAuthStore } from "../zustand/auth/useAuthStore";
import { hasAllPermissions, hasAnyPermission } from "./checkPermission";

export const usePermissions = () => {
    const user = useAuthStore((state) => state.user);
    const permissions = useAuthStore((state) => state.permissions);

    const canAccess = (permission: string): boolean => {
        if (!user) return false;
        return permissions.includes(permission);
    };

    const canAccessAny = (permissionList: string[]): boolean => {
        if (!user) return false;
        return hasAnyPermission(permissions, permissionList);
    };

    const canAccessAll = (permissionList: string[]): boolean => {
        if (!user) return false;
        return hasAllPermissions(permissions, permissionList);
    };

    return {
        permissions,
        canAccess,
        canAccessAny,
        canAccessAll,
        isLoading: false,
    };
};
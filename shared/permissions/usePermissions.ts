import { useMemo } from "react";
import { useAuthStore } from "../zustand/auth/useAuthStore";

export const usePermissions = () => {
    const user = useAuthStore((state) => state.user);
    const permissions = useAuthStore((state) => state.permissions);

    const canAccess = (permission: string): boolean => {
        if (!user) return false;
        return permissions.includes(permission);
    };

    const canAccessAny = (permissionList: string[]): boolean => {
        return permissionList.some((p) => permissions.includes(p));
    };

    const canAccessAll = (permissionList: string[]): boolean => {
        return permissionList.every((p) => permissions.includes(p));
    };

    return {
        permissions,
        canAccess,
        canAccessAny,
        canAccessAll,
        isLoading: false,
    };
};
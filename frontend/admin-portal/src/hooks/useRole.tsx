import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

export type UserRole = 'maker' | 'approver' | 'admin';

export interface RolePermissions {
  canCreateEvents: boolean;
  canEditOwnEvents: boolean;
  canEditAnyEvents: boolean;
  canDeleteOwnEvents: boolean;
  canDeleteAnyEvents: boolean;
  canSubmitForApproval: boolean;
  canViewApprovalQueue: boolean;
  canApproveEvents: boolean;
  canRejectEvents: boolean;
  canRequestRevisions: boolean;
  canViewAllEvents: boolean;
  canViewStats: boolean;
  canViewApprovalStats: boolean;
  canAccessAdminFeatures: boolean;
}

export interface UseRoleReturn {
  userRole: UserRole | null;
  permissions: RolePermissions;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: keyof RolePermissions) => boolean;
  canAccessRoute: (requiredRoles: UserRole | UserRole[]) => boolean;
  isOwner: (resourceOwnerId: string) => boolean;
  canModifyEvent: (eventOwnerId: string, eventStatus?: string) => boolean;
  canViewEvent: (eventOwnerId: string, eventStatus?: string) => boolean;
}

// Define role-based permissions
const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  maker: {
    canCreateEvents: true,
    canEditOwnEvents: true,
    canEditAnyEvents: false,
    canDeleteOwnEvents: true,
    canDeleteAnyEvents: false,
    canSubmitForApproval: true,
    canViewApprovalQueue: false,
    canApproveEvents: false,
    canRejectEvents: false,
    canRequestRevisions: false,
    canViewAllEvents: false,
    canViewStats: true, // Own stats only
    canViewApprovalStats: false,
    canAccessAdminFeatures: false,
  },
  approver: {
    canCreateEvents: true,
    canEditOwnEvents: true,
    canEditAnyEvents: false, // Can only change status, not content
    canDeleteOwnEvents: true,
    canDeleteAnyEvents: false,
    canSubmitForApproval: true,
    canViewApprovalQueue: true,
    canApproveEvents: true,
    canRejectEvents: true,
    canRequestRevisions: true,
    canViewAllEvents: true, // Can view events for approval
    canViewStats: true,
    canViewApprovalStats: true,
    canAccessAdminFeatures: false,
  },
  admin: {
    canCreateEvents: true,
    canEditOwnEvents: true,
    canEditAnyEvents: true,
    canDeleteOwnEvents: true,
    canDeleteAnyEvents: true,
    canSubmitForApproval: true,
    canViewApprovalQueue: true,
    canApproveEvents: true,
    canRejectEvents: true,
    canRequestRevisions: true,
    canViewAllEvents: true,
    canViewStats: true,
    canViewApprovalStats: true,
    canAccessAdminFeatures: true,
  },
};

export const useRole = (): UseRoleReturn => {
  const { user } = useAuth();

  const userRole = user?.role as UserRole | null;
  const permissions = userRole ? ROLE_PERMISSIONS[userRole] : {} as RolePermissions;

  const hasRole = useCallback(
    (requiredRole: UserRole | UserRole[]): boolean => {
      if (!userRole) return false;

      if (Array.isArray(requiredRole)) {
        return requiredRole.includes(userRole);
      }

      return userRole === requiredRole;
    },
    [userRole]
  );

  const hasPermission = useCallback(
    (permission: keyof RolePermissions): boolean => {
      if (!userRole) return false;
      return permissions[permission] || false;
    },
    [permissions, userRole]
  );

  const canAccessRoute = useCallback(
    (requiredRoles: UserRole | UserRole[]): boolean => {
      return hasRole(requiredRoles);
    },
    [hasRole]
  );

  const isOwner = useCallback(
    (resourceOwnerId: string): boolean => {
      if (!user?.id) return false;
      return user.id === resourceOwnerId;
    },
    [user?.id]
  );

  const canModifyEvent = useCallback(
    (eventOwnerId: string, eventStatus?: string): boolean => {
      if (!userRole) return false;

      // Admin can modify any event
      if (userRole === 'admin') {
        return true;
      }

      // Makers can modify their own events in draft or rejected state
      if (userRole === 'maker' && isOwner(eventOwnerId)) {
        return !eventStatus || eventStatus === 'draft' || eventStatus === 'rejected';
      }

      // Approvers can change status of pending events
      if (userRole === 'approver' && eventStatus === 'pending_approval') {
        return true;
      }

      return false;
    },
    [userRole, isOwner]
  );

  const canViewEvent = useCallback(
    (eventOwnerId: string, eventStatus?: string): boolean => {
      if (!userRole) return false;

      // Admin and approvers can view any event
      if (userRole === 'admin' || userRole === 'approver') {
        return true;
      }

      // Makers can view their own events
      if (userRole === 'maker' && isOwner(eventOwnerId)) {
        return true;
      }

      // Anyone can view approved events (public)
      if (eventStatus === 'approved') {
        return true;
      }

      return false;
    },
    [userRole, isOwner]
  );

  return {
    userRole,
    permissions,
    hasRole,
    hasPermission,
    canAccessRoute,
    isOwner,
    canModifyEvent,
    canViewEvent,
  };
};

// Higher-order component for role-based route protection
export interface WithRoleProtectionProps {
  requiredRoles: UserRole | UserRole[];
  fallbackComponent?: React.ComponentType;
  redirectTo?: string;
}

export const withRoleProtection = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithRoleProtectionProps
) => {
  return (props: P) => {
    const { canAccessRoute } = useRole();
    const { isAuthenticated } = useAuth();

    // Check authentication first
    if (!isAuthenticated) {
      if (options.redirectTo) {
        // In a real app, you'd use react-router for navigation
        window.location.href = options.redirectTo;
        return null;
      }
      return options.fallbackComponent ? <options.fallbackComponent /> : <div>Access Denied</div>;
    }

    // Check role permissions
    if (!canAccessRoute(options.requiredRoles)) {
      return options.fallbackComponent ? <options.fallbackComponent /> : <div>Insufficient Permissions</div>;
    }

    return <WrappedComponent {...props} />;
  };
};

// Hook for component-level role checks
export const useRoleGuard = (requiredRoles: UserRole | UserRole[]): boolean => {
  const { canAccessRoute, userRole } = useRole();

  if (!userRole) {
    return false;
  }

  return canAccessRoute(requiredRoles);
};

// Utility functions for common role checks
export const roleUtils = {
  isMaker: (role: UserRole | null): boolean => role === 'maker',
  isApprover: (role: UserRole | null): boolean => role === 'approver',
  isAdmin: (role: UserRole | null): boolean => role === 'admin',

  canCreateEvents: (role: UserRole | null): boolean =>
    role ? ROLE_PERMISSIONS[role].canCreateEvents : false,

  canApproveEvents: (role: UserRole | null): boolean =>
    role ? ROLE_PERMISSIONS[role].canApproveEvents : false,

  canViewApprovalQueue: (role: UserRole | null): boolean =>
    role ? ROLE_PERMISSIONS[role].canViewApprovalQueue : false,

  hasAdminAccess: (role: UserRole | null): boolean =>
    role ? ROLE_PERMISSIONS[role].canAccessAdminFeatures : false,
};

export default useRole;
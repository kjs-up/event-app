import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthResponse } from '@/shared/types';
import { authService } from '../services/auth.service';
import toast from 'react-hot-toast';

// Auth State Interface
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth Actions
type AuthAction =
  | { type: 'AUTH_LOADING' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CLEAR_ERROR' }
  | { type: 'AUTH_UPDATE_USER'; payload: User };

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_LOADING':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case 'AUTH_CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'AUTH_UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };

    default:
      return state;
  }
}

// Auth Context Interface
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  isAdmin: () => boolean;
  isApprover: () => boolean;
  isMaker: () => boolean;
  refreshUser: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | null>(null);

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth();
  }, []);

  // Initialize authentication
  const initializeAuth = async () => {
    try {
      dispatch({ type: 'AUTH_LOADING' });

      const token = localStorage.getItem('auth_token');
      if (!token) {
        dispatch({ type: 'AUTH_LOGOUT' });
        return;
      }

      // Verify token and get current user
      const user = await authService.getCurrentUser();
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
    } catch (error) {
      // Token is invalid or expired
      localStorage.removeItem('auth_token');
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_LOADING' });

      const response: AuthResponse = await authService.login(email, password);

      // Store token in localStorage
      localStorage.setItem('auth_token', response.accessToken);

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          token: response.accessToken,
        },
      });

      toast.success(`Welcome back, ${response.user.firstName}!`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('auth_token');
    dispatch({ type: 'AUTH_LOGOUT' });
    toast.success('Logged out successfully');
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  };

  // Role checking functions
  const hasRole = (role: UserRole): boolean => {
    return state.user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return state.user ? roles.includes(state.user.role) : false;
  };

  const isAdmin = (): boolean => {
    return hasRole(UserRole.ADMIN);
  };

  const isApprover = (): boolean => {
    return hasRole(UserRole.APPROVER);
  };

  const isMaker = (): boolean => {
    return hasRole(UserRole.MAKER);
  };

  // Refresh user data
  const refreshUser = async (): Promise<void> => {
    try {
      if (!state.isAuthenticated) return;

      const user = await authService.getCurrentUser();
      dispatch({ type: 'AUTH_UPDATE_USER', payload: user });
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      // If refresh fails, user might need to re-authenticate
      logout();
    }
  };

  // Context value
  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
    hasRole,
    hasAnyRole,
    isAdmin,
    isApprover,
    isMaker,
    refreshUser,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Custom hook for role-based access
export function useRoleAccess(requiredRoles: UserRole[]) {
  const { hasAnyRole, isAuthenticated, user } = useAuth();

  return {
    hasAccess: isAuthenticated && hasAnyRole(requiredRoles),
    isAuthenticated,
    userRole: user?.role,
    user,
  };
}
import { User, AuthResponse, LoginDto } from '../types';
import { api } from './api';

export class AuthService {
  private readonly basePath = '/auth';

  // Login user
  async login(email: string, password: string): Promise<AuthResponse> {
    const loginData: LoginDto = { email, password };
    return api.post<AuthResponse>(`${this.basePath}/login`, loginData);
  }

  // Register user
  async register(data: any): Promise<AuthResponse> {
    return api.post<AuthResponse>(`${this.basePath}/register`, data);
  }

  // Get current user profile
  async getCurrentUser(): Promise<User> {
    return api.get<User>(`${this.basePath}/profile`);
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return api.post<AuthResponse>(`${this.basePath}/refresh`, { refreshToken });
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await api.post(`${this.basePath}/logout`);
    } catch (error) {
      // Logout on client side even if server request fails
      console.warn('Server logout failed, but clearing local session:', error);
    } finally {
      // Always clear local storage
      api.clearAuthToken();
    }
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return api.post(`${this.basePath}/change-password`, {
      currentPassword,
      newPassword,
    });
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<void> {
    return api.post(`${this.basePath}/forgot-password`, { email });
  }

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<void> {
    return api.post(`${this.basePath}/reset-password`, {
      token,
      newPassword,
    });
  }

  // Verify email
  async verifyEmail(token: string): Promise<void> {
    return api.post(`${this.basePath}/verify-email`, { token });
  }

  // Resend email verification
  async resendEmailVerification(): Promise<void> {
    return api.post(`${this.basePath}/resend-verification`);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!api.getAuthToken();
  }

  // Get stored token
  getToken(): string | null {
    return api.getAuthToken();
  }

  // Set token
  setToken(token: string): void {
    api.setAuthToken(token);
  }

  // Clear token
  clearToken(): void {
    api.clearAuthToken();
  }
}

// Export singleton instance
export const authService = new AuthService();
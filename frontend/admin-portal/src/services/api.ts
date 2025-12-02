import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';
import toast from 'react-hot-toast';

// API Response interface
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    timestamp: string;
    path: string;
    method: string;
    statusCode: number;
    requestId?: string;
    executionTime: number;
  };
}

// API Error interface
interface ApiError {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error?: string;
  details?: any;
  requestId?: string;
}

// API Configuration
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Create axios instance
const apiClient: AxiosInstance = axios.create(API_CONFIG);

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: Date.now() };

    // Log request in development
    if (import.meta.env.DEV) {
      console.group(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      console.log('Config:', config);
      console.groupEnd();
    }

    return config;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('❌ Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { config } = response;
    const duration = Date.now() - (config as any).metadata?.startTime;

    // Log response in development
    if (import.meta.env.DEV) {
      console.group(`✅ API Response: ${config.method?.toUpperCase()} ${config.url} (${duration}ms)`);
      console.log('Response:', response.data);
      console.groupEnd();
    }

    // Return the data directly for easier consumption
    return response;
  },
  (error) => {
    const { config, response } = error;
    const duration = config?.metadata?.startTime ? Date.now() - config.metadata.startTime : 0;

    // Log error in development
    if (import.meta.env.DEV) {
      console.group(`❌ API Error: ${config?.method?.toUpperCase()} ${config?.url} (${duration}ms)`);
      console.error('Error:', error);
      console.error('Response:', response?.data);
      console.groupEnd();
    }

    // Handle specific error cases
    if (response) {
      const apiError: ApiError = response.data;

      switch (response.status) {
        case 401:
          // Unauthorized - redirect to login
          handleUnauthorized();
          break;

        case 403:
          // Forbidden - show error message
          toast.error('You do not have permission to perform this action.');
          break;

        case 404:
          // Not found - show error message
          toast.error('The requested resource was not found.');
          break;

        case 422:
          // Validation error - show validation messages
          if (Array.isArray(apiError.message)) {
            apiError.message.forEach((msg) => toast.error(msg));
          } else {
            toast.error(apiError.message);
          }
          break;

        case 429:
          // Rate limit - show rate limit message
          toast.error('Too many requests. Please slow down.');
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors - show generic error
          toast.error('Server error. Please try again later.');
          break;

        default:
          // Other errors - show API error message or generic message
          const errorMessage = typeof apiError.message === 'string'
            ? apiError.message
            : 'An unexpected error occurred.';
          toast.error(errorMessage);
      }
    } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
      // Network or timeout error
      toast.error('Network error. Please check your connection.');
    } else {
      // Unknown error
      toast.error('An unexpected error occurred.');
    }

    return Promise.reject(error);
  }
);

// Handle unauthorized access
function handleUnauthorized() {
  // Clear stored token
  localStorage.removeItem('auth_token');

  // Show error message
  toast.error('Your session has expired. Please log in again.');

  // Redirect to login page
  window.location.href = '/login';
}

// API Client class
export class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = apiClient;
  }

  // Generic request method
  async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.client.request<ApiResponse<T>>(config);
    return response.data.data as T;
  }

  // GET request
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data.data as T;
  }

  // POST request
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data.data as T;
  }

  // PUT request
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data.data as T;
  }

  // PATCH request
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data.data as T;
  }

  // DELETE request
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data.data as T;
  }

  // Upload file
  async uploadFile<T = any>(
    url: string,
    file: File,
    fieldName: string = 'file',
    config?: AxiosRequestConfig
  ): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);

    const response = await this.client.post<ApiResponse<T>>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    });

    return response.data.data as T;
  }

  // Download file
  async downloadFile(url: string, filename?: string, config?: AxiosRequestConfig): Promise<void> {
    const response = await this.client.get(url, {
      ...config,
      responseType: 'blob',
    });

    // Create blob link to download
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  // Get current auth token
  getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Set auth token
  setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  // Clear auth token
  clearAuthToken(): void {
    localStorage.removeItem('auth_token');
  }
}

// Export singleton instance
export const api = new ApiClient();

// Export axios instance for advanced usage
export { apiClient };

// Export types
export type { ApiResponse, ApiError };
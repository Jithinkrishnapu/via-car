import { Alert } from 'react-native';

export interface ApiError extends Error {
  status?: number;
  body?: any;
  code?: string;
}

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data: T;
  error?: string;
}

/**
 * Enhanced fetch wrapper with comprehensive error handling
 */
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Always read the response body first
    let data: any;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (parseError) {
        data = { message: 'Invalid JSON response from server' };
      }
    } else {
      // Handle non-JSON responses (HTML error pages, etc.)
      const textResponse = await response.text();
      data = { 
        message: response.ok ? textResponse : 'Server returned non-JSON response',
        rawResponse: textResponse 
      };
    }

    if (!response.ok) {
      const error: ApiError = new Error(
        data?.message || 
        data?.error || 
        data?.msg || 
        `HTTP ${response.status}: ${response.statusText}`
      );
      error.status = response.status;
      error.body = data;
      throw error;
    }

    return {
      ok: true,
      status: response.status,
      data,
    };
  } catch (error: any) {
    // Handle different types of errors
    if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
      throw new Error('Network error: Please check your internet connection and try again.');
    }
    
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      throw new Error('Request timeout: The server took too long to respond. Please try again.');
    }
    
    // Re-throw API errors as-is
    if (error.status) {
      throw error;
    }
    
    // Generic error fallback
    throw new Error(error.message || 'An unexpected error occurred. Please try again.');
  }
}

/**
 * Show user-friendly error alerts based on error type
 */
export function handleApiError(error: any, context?: string): void {
  console.error(`API Error${context ? ` (${context})` : ''}:`, error);
  
  let title = 'Error';
  let message = 'An unexpected error occurred. Please try again.';
  
  if (error.status) {
    switch (error.status) {
      case 400:
        title = 'Invalid Request';
        message = error.message || 'Please check your input and try again.';
        break;
      case 401:
        title = 'Authentication Error';
        message = 'Please log in again to continue.';
        break;
      case 403:
        title = 'Access Denied';
        message = 'You do not have permission to perform this action.';
        break;
      case 404:
        title = 'Not Found';
        message = 'The requested resource was not found.';
        break;
      case 422:
        title = 'Validation Error';
        message = error.message || 'Please check your input and try again.';
        break;
      case 429:
        title = 'Too Many Requests';
        message = 'Please wait a moment before trying again.';
        break;
      case 500:
        title = 'Server Error';
        message = 'Something went wrong on our end. Please try again later.';
        break;
      case 502:
      case 503:
      case 504:
        title = 'Service Unavailable';
        message = 'The service is temporarily unavailable. Please try again later.';
        break;
      default:
        title = `Error ${error.status}`;
        message = error.message || 'An unexpected error occurred.';
    }
  } else if (error.message) {
    if (error.message.includes('Network error')) {
      title = 'Connection Error';
      message = 'Please check your internet connection and try again.';
    } else if (error.message.includes('timeout')) {
      title = 'Timeout Error';
      message = 'The request took too long. Please try again.';
    } else {
      message = error.message;
    }
  }
  
  Alert.alert(title, message);
}

/**
 * Extract validation errors from API response
 */
export function extractValidationErrors(error: any): string[] {
  const errors: string[] = [];
  
  if (error.body?.errors) {
    if (Array.isArray(error.body.errors)) {
      errors.push(...error.body.errors.map((err: any) => err.message || err));
    } else if (typeof error.body.errors === 'object') {
      Object.values(error.body.errors).forEach((fieldErrors: any) => {
        if (Array.isArray(fieldErrors)) {
          errors.push(...fieldErrors);
        } else {
          errors.push(fieldErrors);
        }
      });
    }
  }
  
  return errors;
}

/**
 * Show validation errors in a user-friendly format
 */
export function showValidationErrors(error: any): void {
  const validationErrors = extractValidationErrors(error);
  
  if (validationErrors.length > 0) {
    Alert.alert('Validation Error', validationErrors.join('\n'));
  } else {
    handleApiError(error);
  }
}
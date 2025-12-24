import { snackbarManager } from './snackbar-manager';

export interface ApiError {
  message?: string;
  status?: number;
  code?: string;
}

export const handleApiError = (error: any, retryAction?: () => void) => {
  console.error('API Error:', error);

  let errorMessage = 'Something went wrong. Please try again.';

  // Check if it's a network error
  if (!error.response) {
    errorMessage = 'Network error. Please check your connection and try again.';
    snackbarManager.showNetworkError(errorMessage, retryAction);
    return;
  }

  // Handle different HTTP status codes
  const status = error.response?.status;
  const serverMessage = error.response?.data?.message;

  switch (status) {
    case 400:
      errorMessage = serverMessage || 'Invalid request. Please check your input.';
      break;
    case 401:
      errorMessage = 'Session expired. Please login again.';
      break;
    case 403:
      errorMessage = 'Access denied. You don\'t have permission for this action.';
      break;
    case 404:
      errorMessage = 'Resource not found. Please try again.';
      break;
    case 422:
      errorMessage = serverMessage || 'Validation error. Please check your input.';
      break;
    case 429:
      errorMessage = 'Too many requests. Please wait a moment and try again.';
      break;
    case 500:
    case 502:
    case 503:
    case 504:
      errorMessage = 'Server error. Please try again later.';
      snackbarManager.showNetworkError(errorMessage, retryAction);
      return;
    default:
      errorMessage = serverMessage || 'Something went wrong. Please try again.';
  }

  snackbarManager.showError(errorMessage, retryAction ? { label: 'Retry', onPress: retryAction } : undefined);
};

export const handleNetworkError = (message?: string, retryAction?: () => void) => {
  snackbarManager.showNetworkError(message, retryAction);
};

export const showSuccessMessage = (message: string) => {
  snackbarManager.showSuccess(message);
};

export const showWarningMessage = (message: string) => {
  snackbarManager.showWarning(message);
};

export const showInfoMessage = (message: string) => {
  snackbarManager.showInfo(message);
};
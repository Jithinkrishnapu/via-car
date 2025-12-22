import { useState, useCallback } from 'react';

interface NetworkErrorHook {
  showSnackbar: boolean;
  snackbarMessage: string;
  showNetworkError: (message?: string) => void;
  hideSnackbar: () => void;
  retryAction?: () => void;
  setRetryAction: (action: () => void) => void;
}

export const useNetworkError = (): NetworkErrorHook => {
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [retryAction, setRetryAction] = useState<(() => void) | undefined>();

  const showNetworkError = useCallback((message?: string) => {
    const defaultMessage = 'Network error. Please check your connection and try again.';
    setSnackbarMessage(message || defaultMessage);
    setShowSnackbar(true);
  }, []);

  const hideSnackbar = useCallback(() => {
    setShowSnackbar(false);
    setSnackbarMessage('');
  }, []);

  const setRetryActionCallback = useCallback((action: () => void) => {
    setRetryAction(() => action);
  }, []);

  return {
    showSnackbar,
    snackbarMessage,
    showNetworkError,
    hideSnackbar,
    retryAction,
    setRetryAction: setRetryActionCallback,
  };
};
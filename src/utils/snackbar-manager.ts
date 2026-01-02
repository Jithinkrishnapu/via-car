import { EventEmitter } from 'events';

export interface SnackbarConfig {
  message: string;
  type?: 'error' | 'success' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

class SnackbarManager extends EventEmitter {
  private static instance: SnackbarManager;

  static getInstance(): SnackbarManager {
    if (!SnackbarManager.instance) {
      SnackbarManager.instance = new SnackbarManager();
    }
    return SnackbarManager.instance;
  }

  show(config: SnackbarConfig) {
    this.emit('show', config);
  }

  showError(message: string, action?: { label: string; onPress: () => void }) {
    this.show({
      message,
      type: 'error',
      duration: 5000,
      action,
    });
  }

  showSuccess(message: string, duration?: number) {
    this.show({
      message,
      type: 'success',
      duration: duration || 3000,
    });
  }

  showWarning(message: string, duration?: number) {
    this.show({
      message,
      type: 'warning',
      duration: duration || 4000,
    });
  }

  showInfo(message: string, duration?: number) {
    this.show({
      message,
      type: 'info',
      duration: duration || 3000,
    });
  }

  showNetworkError(message?: string, retryAction?: () => void) {
    const defaultMessage = 'Network error. Please check your connection and try again.';
    this.showError(
      message || defaultMessage,
      retryAction ? { label: 'Retry', onPress: retryAction } : undefined
    );
  }

  hide() {
    this.emit('hide');
  }
}

export const snackbarManager = SnackbarManager.getInstance();
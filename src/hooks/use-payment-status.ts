import { useState, useCallback, useRef, useEffect } from 'react';
import { getPaymentStatus } from '@/service/payment';

export type PaymentStatus = 'idle' | 'waiting' | 'approved' | 'failed';

interface UsePaymentStatusResult {
  status: PaymentStatus;
  setStatus: (status: PaymentStatus) => void;
  startPolling: () => void;
  stopPolling: () => void;
}

export const usePaymentStatus = (bookingId: string | undefined): UsePaymentStatusResult => {
  const [status, setStatus] = useState<PaymentStatus>('idle');
  
  // Timer ref to clear interval
  const pollTimer = useRef<NodeJS.Timeout | null>(null);
  const timeoutTimer = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
    if (timeoutTimer.current) {
      clearTimeout(timeoutTimer.current);
      timeoutTimer.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    if (!bookingId) return;
    
    // Reset timers if any
    stopPolling();
    
    setStatus('waiting');

    // Poll every 3 seconds
    pollTimer.current = setInterval(async () => {
      try {
        const response = await getPaymentStatus(Number(bookingId));
        // Check for specific payment status codes
        // Assuming 2 is approved based on previous code
        if (response.data?.paymentStatus === 2) { 
          setStatus('approved');
          stopPolling();
        }
        // Add other status checks if needed (e.g. failed/rejected)
      } catch (error) {
        console.error("Payment polling error:", error);
        // We continue polling on network errors hoping it resolves
      }
    }, 3000);

    // Timeout after 2 minutes (120000ms)
    timeoutTimer.current = setTimeout(() => {
      stopPolling();
      setStatus((prev) => {
        if (prev === 'waiting') {
            return 'failed'; // Or handle timeout explicitly
        }
        return prev;
      });
    }, 120000);

  }, [bookingId, stopPolling]);

  // Clean up on unmount
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return {
    status,
    setStatus,
    startPolling,
    stopPolling
  };
};

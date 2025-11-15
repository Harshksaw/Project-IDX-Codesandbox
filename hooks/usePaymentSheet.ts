import { useState, useCallback } from 'react';

export type PaymentSheetMode = 'settings' | 'payment';

interface UsePaymentSheetReturn {
  isVisible: boolean;
  mode: PaymentSheetMode;
  showSettings: () => void;
  showPayment: () => void;
  hide: () => void;
  handleSuccess: (result: any) => void;
  handleError: (error: any) => void;
}

export const usePaymentSheet = (
  onSuccess?: (result: any) => void,
  onError?: (error: any) => void
): UsePaymentSheetReturn => {
  const [isVisible, setIsVisible] = useState(false);
  const [mode, setMode] = useState<PaymentSheetMode>('settings');

  const showSettings = useCallback(() => {
    setMode('settings');
    setIsVisible(true);
  }, []);

  const showPayment = useCallback(() => {
    setMode('payment');
    setIsVisible(true);
  }, []);

  const hide = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleSuccess = useCallback((result: any) => {
    onSuccess?.(result);
    hide();
  }, [onSuccess, hide]);

  const handleError = useCallback((error: any) => {
    onError?.(error);
    hide();
  }, [onError, hide]);

  return {
    isVisible,
    mode,
    showSettings,
    showPayment,
    hide,
    handleSuccess,
    handleError,
  };
};

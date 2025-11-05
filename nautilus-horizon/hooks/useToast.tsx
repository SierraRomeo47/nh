import { useState, useCallback } from 'react';

export type ToastType = 'info' | 'warning' | 'error' | 'success';

interface ToastData {
  id: number;
  message: string;
  type: ToastType;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const hideToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return { toasts, showToast, hideToast };
};


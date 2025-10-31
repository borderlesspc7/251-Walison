import React, { useState, useCallback } from "react";
import Toast from "../components/ui/Toast/Toast";
import {
  ToastContext,
  type ToastData,
  type ToastContextValue,
} from "./ToastContextAux";

export const ToastProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((toast: Omit<ToastData, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastData = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback(
    (title: string, message: string, duration = 5000) => {
      showToast({ type: "success", title, message, duration });
    },
    [showToast]
  );

  const showError = useCallback(
    (title: string, message: string, duration = 7000) => {
      showToast({ type: "error", title, message, duration });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (title: string, message: string, duration = 6000) => {
      showToast({ type: "warning", title, message, duration });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, message: string, duration = 5000) => {
      showToast({ type: "info", title, message, duration });
    },
    [showToast]
  );

  const value: ToastContextValue = {
    toasts,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={hideToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

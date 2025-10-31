import { createContext } from "react";

export interface ToastData {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
}

export interface ToastContextValue {
  toasts: ToastData[];
  showToast: (toast: Omit<ToastData, "id">) => void;
  hideToast: (id: string) => void;
  showSuccess: (title: string, message: string, duration?: number) => void;
  showError: (title: string, message: string, duration?: number) => void;
  showWarning: (title: string, message: string, duration?: number) => void;
  showInfo: (title: string, message: string, duration?: number) => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(
  undefined
);

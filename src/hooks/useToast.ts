import { useContext } from "react";
import type { ToastContextValue } from "../contexts/ToastContextAux";
import { ToastContext } from "../contexts/ToastContextAux";

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

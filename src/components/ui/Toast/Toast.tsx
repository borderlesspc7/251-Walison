import React, { useEffect } from "react";
import "./Toast.css";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaInfoCircle,
} from "react-icons/fa";

export interface ToastProps {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 3000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  });

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="toast-icon success" />;
      case "error":
        return <FaTimesCircle className="toast-icon error" />;
      case "warning":
        return <FaExclamationTriangle className="toast-icon warning" />;
      case "info":
        return <FaInfoCircle className="toast-icon info" />;
      default:
        return <FaInfoCircle className="toast-icon info" />;
    }
  };

  return (
    <div className={`toast ${type}`}>
      <div className="toast-content">
        {getIcon()}
        <div className="toast-text">
          <h3 className="toast-title">{title}</h3>
          <p className="toast-message">{message}</p>
        </div>
        <button
          className="toast-close"
          onClick={() => onClose(id)}
          aria-label="Close toast"
        >
          <FaTimesCircle className="toast-close-icon" />
        </button>
      </div>
    </div>
  );
};

export default Toast;

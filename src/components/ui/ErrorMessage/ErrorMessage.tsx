import React from "react";
import { FiXCircle, FiAlertTriangle, FiInfo } from "react-icons/fi";
import "./ErrorMessage.css";

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
  type?: "error" | "warning" | "info";
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onClose,
  type = "error",
}) => {
  return (
    <div className={`error-message error-message-${type}`}>
      <div className="error-content">
        <span className="error-icon">
          {type === "error" && <FiXCircle size={16} />}
          {type === "warning" && <FiAlertTriangle size={16} />}
          {type === "info" && <FiInfo size={16} />}
        </span>
        <span className="error-text">{message}</span>
      </div>
      {onClose && (
        <button className="error-close" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
};

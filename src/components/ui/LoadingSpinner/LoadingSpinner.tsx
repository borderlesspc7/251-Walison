import React from "react";
import "./LoadingSpinner.css";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  text?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "medium",
  text,
  fullScreen = false,
}) => {
  const containerClass = fullScreen
    ? "loading-spinner-container full-screen"
    : "loading-spinner-container";

  return (
    <div className={containerClass}>
      <div className={`loading-spinner ${size}`}>
        <div className="spinner"></div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

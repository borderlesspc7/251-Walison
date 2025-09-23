import type { ButtonHTMLAttributes } from "react";
import React from "react";
import "./Button.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  loading?: boolean;
}

export default function Button({
  children,
  type = "button",
  variant = "primary",
  onClick,
  disabled = false,
  className = "",
  loading = false,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn--${variant} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="loading loading-spinner loading-sm"></span>
      ) : (
        children
      )}
    </button>
  );
}

export { Button };

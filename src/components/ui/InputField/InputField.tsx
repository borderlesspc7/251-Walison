"use client";

import "./InputField.css";

interface InputFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

export default function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required = false,
}: InputFieldProps) {
  return (
    <div className="input-field">
      <label className="input-field__label">
        {label}
        {required && <span className="input-field__required">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`input-field__input ${
          error ? "input-field__input--error" : ""
        }`}
      />
      {error && <span className="input-field__error">{error}</span>}
    </div>
  );
}

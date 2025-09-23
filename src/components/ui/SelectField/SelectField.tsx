import React from "react";
import "./SelectField.css";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Selecione uma opção",
  error,
  required = false,
  disabled = false,
  className = "",
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`select-field ${className}`}>
      <label className="select-field__label">
        {label}
        {required && <span className="select-field__required">*</span>}
      </label>
      <select
        className={`select-field__select ${
          error ? "select-field__select--error" : ""
        }`}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        required={required}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="select-field__error">{error}</span>}
    </div>
  );
};

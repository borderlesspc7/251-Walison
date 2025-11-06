"use client";

import { useState, useEffect } from "react";
import "./InputField.css";
import type { MaskType } from "../../../utils/masks";
import { applyMask, removeMask } from "../../../utils/masks";

interface InputFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  mask?: MaskType;
  returnUnmasked?: boolean; // Se true, onChange retorna valor sem máscara
}

export default function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  min,
  max,
  step,
  mask,
  returnUnmasked = false,
}: InputFieldProps) {
  const [displayValue, setDisplayValue] = useState(value);

  // Atualizar displayValue quando value externo mudar
  useEffect(() => {
    if (mask && value) {
      setDisplayValue(applyMask(value, mask));
    } else {
      setDisplayValue(value);
    }
  }, [value, mask]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (mask) {
      // Aplicar máscara no display
      const masked = applyMask(inputValue, mask);
      setDisplayValue(masked);

      // Retornar valor com ou sem máscara baseado em returnUnmasked
      if (returnUnmasked) {
        const unmasked = removeMask(masked, mask);
        onChange(unmasked);
      } else {
        onChange(masked);
      }
    } else {
      // Sem máscara, comportamento normal
      setDisplayValue(inputValue);
      onChange(inputValue);
    }
  };

  // Para campos numéricos com máscara de moeda ou porcentagem
  const getInputType = () => {
    if (mask === "currency" || mask === "percentage") {
      return "text"; // Usar text para permitir formatação
    }
    return type;
  };

  return (
    <div className="input-field">
      <label className="input-field__label">
        {label}
        {required && <span className="input-field__required">*</span>}
      </label>
      <input
        type={getInputType()}
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={`input-field__input ${
          error ? "input-field__input--error" : ""
        }`}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
      />
      {error && <span className="input-field__error">{error}</span>}
    </div>
  );
}

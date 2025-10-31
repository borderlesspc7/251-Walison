"use client";

import React from "react";
import { useState } from "react";
import InputField from "../../../components/ui/InputField/InputField";
import { Button } from "../../../components/ui/Button/Button";
import type { RegisterCredentials } from "../../../types/user";
import { useAuth } from "../../../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { paths } from "../../../routes/paths";
import "./Form.css";
import { useToast } from "../../../hooks/useToast";

type FormData = {
  displayName: string;
  email: string;
  password: string;
  cpf: string;
  phone: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

export const UserRegisterForm: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    displayName: "",
    email: "",
    password: "",
    cpf: "",
    phone: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");
  const { showError, showSuccess } = useToast();

  const formatCPF = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, "");

    // Apply CPF mask: XXX.XXX.XXX-XX
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2");
    }

    return numbers
      .slice(0, 11)
      .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.displayName.trim()) {
      newErrors.displayName = "Nome é obrigatório";
    } else if (formData.displayName.trim().length < 2) {
      newErrors.displayName = "Nome deve ter pelo menos 2 caracteres";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (formData.password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }

    // CPF validation
    const cpfNumbers = formData.cpf.replace(/\D/g, "");
    if (!formData.cpf.trim()) {
      newErrors.cpf = "CPF é obrigatório";
    } else if (cpfNumbers.length !== 11) {
      newErrors.cpf = "CPF deve ter 11 dígitos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData) => (value: string) => {
    if (field === "cpf") {
      value = formatCPF(value);
    }

    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const payload: RegisterCredentials = {
        name: formData.displayName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      };

      await register(payload);

      setFormData({
        displayName: "",
        email: "",
        password: "",
        cpf: "",
        phone: "",
      });

      showSuccess(
        "Usuário cadastrado",
        "Cadastro concluído com sucesso. Redirecionando para login."
      );

      // Redirecionar para login após registro bem-sucedido
      setTimeout(() => {
        navigate(paths.login);
      }, 1000);
    } catch (error) {
      if (error instanceof Error) {
        setSubmitError(error.message);
        showError("Falha no cadastro", error.message);
      } else {
        setSubmitError("Erro inesperado ao registrar usuário");
        showError(
          "Falha no cadastro",
          "Erro inesperado ao registrar usuário"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="user-register-form">
      <div className="user-register-form__header">
        <h1 className="user-register-form__title">
          Cadastro de Usuário - Exclusive Homes
        </h1>
        <p className="user-register-form__subtitle">
          Preencha os dados abaixo para cadastrar um novo usuário no sistema de
          gestão de aluguéis
        </p>
      </div>

      <form className="user-register-form__form" onSubmit={handleSubmit}>
        <div className="user-register-form__fields">
          <InputField
            label="Nome completo"
            type="text"
            value={formData.displayName}
            onChange={handleInputChange("displayName")}
            placeholder="Digite o nome completo"
            error={errors.displayName}
            required
          />

          <InputField
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleInputChange("email")}
            placeholder="Digite o email"
            error={errors.email}
            required
          />

          <InputField
            label="Senha"
            type="password"
            value={formData.password}
            onChange={handleInputChange("password")}
            placeholder="Digite a senha"
            error={errors.password}
            required
          />

          <InputField
            label="CPF"
            type="text"
            value={formData.cpf}
            onChange={handleInputChange("cpf")}
            placeholder="000.000.000-00"
            error={errors.cpf}
            required
          />

          <InputField
            label="Telefone"
            type="text"
            value={formData.phone}
            onChange={handleInputChange("phone")}
            placeholder="(00) 00000-0000"
          />
        </div>

        {submitError && (
          <div className="user-register-form__error">
            <p>{submitError}</p>
          </div>
        )}

        <div className="user-register-form__actions">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="user-register-form__submit-btn"
          >
            {isSubmitting ? "Cadastrando..." : "Cadastrar Usuário"}
          </Button>
        </div>

        <div className="user-register-form__divider">
          <span>ou</span>
        </div>

        <div className="user-register-form__login-link">
          <p>Já tem uma conta?</p>
          <Link to={paths.login} className="user-register-form__login-btn">
            Faça o login
          </Link>
        </div>
      </form>
    </div>
  );
};

"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button/Button";
import InputField from "../../../components/ui/InputField/InputField";
import "./Form.css";
import { useAuth } from "../../../hooks/useAuth";
import { paths } from "../../../routes/paths";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../../../hooks/useToast";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();

    try {
      await login({ email, password });
    } catch {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      showSuccess(
        "Login realizado",
        user.displayName ? `Bem-vindo(a), ${user.displayName}!` : "Bem-vindo(a)!"
      );
      navigate(paths.clients);
    }
  }, [user, navigate, showSuccess]);

  useEffect(() => {
    if (error) {
      showError("Falha no login", error);
    }
  }, [error, showError]);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (error) clearError();
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (error) clearError();
  };

  return (
    <div className="login-form">
      <div className="login-form__header">
        <h1 className="login-form__title">Bem-Vindo de volta!</h1>
        <p className="login-form__subtitle">
          Bem-vindo ao Exclusive Homes, sua plataforma de gestão de aluguéis e
          imóveis
        </p>
      </div>

      <form onSubmit={handleSubmit} className="login-form__form">
        <InputField
          label="Email"
          type="text"
          value={email}
          onChange={handleEmailChange}
          placeholder="Digite seu email"
          required
        />

        <InputField
          label="Senha"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          placeholder="Digite sua senha"
          required
        />

        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          className="login-form__submit-btn"
        >
          x{isLoading ? "Entrando..." : "Entrar"}
        </Button>

        <a href="#" className="login-form__forgot-password">
          Esqueceu sua senha?
        </a>

        <div className="login-form__divider">
          <span>ou</span>
        </div>

        <div className="login-form__register-link">
          <p>Não tem uma conta?</p>
          <Link to={paths.register} className="login-form__register-btn">
            Faça o registro
          </Link>
        </div>
      </form>
    </div>
  );
}

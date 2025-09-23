"use client";

import LoginForm from "./Form/Form";
import "./Login.css";
// Ícones SVG inline para evitar dependências

export default function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-page__container">
        <div className="login-page__form-section">
          <LoginForm />
        </div>

        <div className="login-page__brand-section">
          <div className="login-page__brand-content">
            <div className="login-page__logo">
              <div className="login-page__logo-icon">
                <svg viewBox="0 0 100 100" className="logo-svg">
                  <defs>
                    <linearGradient
                      id="logoGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#e5e7eb" />
                    </linearGradient>
                  </defs>
                  <rect
                    x="15"
                    y="25"
                    width="70"
                    height="50"
                    rx="6"
                    fill="url(#logoGradient)"
                  />
                  <rect
                    x="20"
                    y="35"
                    width="60"
                    height="6"
                    rx="3"
                    fill="#1f2937"
                    opacity="0.9"
                  />
                  <rect
                    x="20"
                    y="45"
                    width="45"
                    height="4"
                    rx="2"
                    fill="#1f2937"
                    opacity="0.7"
                  />
                  <rect
                    x="20"
                    y="52"
                    width="55"
                    height="4"
                    rx="2"
                    fill="#1f2937"
                    opacity="0.7"
                  />
                  <rect
                    x="20"
                    y="59"
                    width="40"
                    height="4"
                    rx="2"
                    fill="#1f2937"
                    opacity="0.7"
                  />
                  <circle cx="75" cy="40" r="6" fill="#1f2937" />
                  <text
                    x="75"
                    y="44"
                    textAnchor="middle"
                    fill="white"
                    fontSize="6"
                    fontWeight="bold"
                  >
                    R
                  </text>
                </svg>
              </div>
              <h2 className="login-page__brand-name">Exclusive Homes</h2>
            </div>

            <div className="login-page__brand-description">
              <h3 className="login-page__tagline">
                Gestão Inteligente de Aluguéis{" "}
              </h3>
              <p className="login-page__description">
                Plataforma completa para gerenciamento de imóveis, contratos de
                locação, clientes e fornecedores com métricas financeiras
                detalhadas
              </p>
              <div className="login-page__features">
                <div className="feature-item">
                  <div className="feature-icon">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                    </svg>
                  </div>
                  <span>Gestão de Imóveis</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                    </svg>
                  </div>
                  <span>Contratos de Locação</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z" />
                    </svg>
                  </div>
                  <span>Métricas Financeiras</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

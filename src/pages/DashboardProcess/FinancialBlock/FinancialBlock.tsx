import React, { useState } from "react";
import "./FinancialBlock.css";
import {
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiHome,
  FiUsers,
  FiFileText,
  FiBarChart,
  FiPieChart,
  FiCalendar,
} from "react-icons/fi";
import type { FinancialData } from "../../../types/dashboardProcess";

export interface FinancialBlockProps {
  data: FinancialData;
  loading?: boolean;
}

const FinancialBlock: React.FC<FinancialBlockProps> = ({
  data,
  loading = false,
}) => {
  const [selectedChart, setSelectedChart] = useState<
    "sales" | "commissions" | "margin"
  >("sales");

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  const calculateVariation = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getTrendIcon = (variation: number) => {
    if (variation > 0) return <FiTrendingUp />;
    if (variation < 0) return <FiTrendingDown />;
    return "trend-neutral";
  };

  const getTrendClass = (variation: number): string => {
    if (variation > 0) return "trend-up";
    if (variation < 0) return "trend-down";
    return "trend-neutral";
  };

  if (loading) {
    return (
      <div className="financial-block">
        <div className="block-header">
          <h2>Bloco Financeiro Consolidado</h2>
          <div className="chart-selector loading">
            <div className="skeleton-button"></div>
            <div className="skeleton-button"></div>
            <div className="skeleton-button"></div>
          </div>
        </div>

        <div className="financial-cards">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="financial-card loading">
              <div className="card-skeleton">
                <div className="skeleton-icon"></div>
                <div className="skeleton-content">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-value"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="chart-container loading">
          <div className="skeleton-chart"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="financial-block">
      <div className="block-header">
        <h2>Bloco Financeiro Consolidado</h2>
        <p className="block-subtitle">
          {" "}
          Analise completa de receitas, despesas e margem de contribuição{" "}
        </p>
        <div className="chart-selector">
          <button
            className={`chart-btn ${selectedChart === "sales" ? "active" : ""}`}
            onClick={() => setSelectedChart("sales")}
          >
            <FiBarChart size={16} />
            Total de Vendas
          </button>
          <button
            className={`chart-btn ${
              selectedChart === "commissions" ? "active" : ""
            }`}
            onClick={() => setSelectedChart("commissions")}
          >
            <FiBarChart size={16} />
            Comissões
          </button>
          <button
            className={`chart-btn ${
              selectedChart === "margin" ? "active" : ""
            }`}
            onClick={() => setSelectedChart("margin")}
          >
            <FiBarChart size={16} />
            Margem por casa
          </button>
        </div>
      </div>

      <div className="financial-cards">
        <div className="financial-card total-sales">
          <div className="card-header">
            <div className="card-icon">
              <FiDollarSign size={24} />
            </div>
            <div className="card-trend">
              {getTrendIcon(data.totalCommissions.variation)}
              <span
                className={`trend-value ${getTrendClass(
                  data.totalCommissions.variation
                )}`}
              >
                {formatPercentage(data.totalCommissions.variation)}
              </span>
            </div>
          </div>
          <div className="card-content">
            <h3>Total de comissões</h3>
            <p className="card-value">
              {formatCurrency(data.totalCommissions.value)}
            </p>
            <p className="card-description">Comissões pagas no período</p>
          </div>
        </div>

        <div className="financial-card supplier-commissions">
          <div className="card-header">
            <div className="card-icon">
              <FiFileText size={24} />
            </div>
          </div>
          <div className="card-content">
            <h3>Comissões fornecedores</h3>
            <p className="card-value">
              {formatCurrency(data.supplierCommissions.value)}
            </p>
            <p className="card-description">Comissões pagas a fornecedores</p>
          </div>
        </div>

        <div className="financial-card total-concierge">
          <div className="card-header">
            <div className="card-icon">
              <FiUsers size={24} />
            </div>
          </div>
          <div className="card-content">
            <h3>Total Concierge</h3>
            <p className="card-value">
              {formatCurrency(data.totalConcierge.value)}
            </p>
            <p className="card-description">
              Receiras de servicos de concierge
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

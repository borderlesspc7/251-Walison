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
  FiBarChart2,
} from "react-icons/fi";
import type { FinancialData } from "../../../types/dashboardConsolidation";

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

  // Formatar moeda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Formatar porcentagem
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  // Obter ícone de tendência
  const getTrendIcon = (variation: number) => {
    if (variation > 0) return <FiTrendingUp size={16} className="trend-up" />;
    if (variation < 0)
      return <FiTrendingDown size={16} className="trend-down" />;
    return null;
  };

  // Obter classe CSS para tendência
  const getTrendClass = (variation: number): string => {
    if (variation > 0) return "trend-up";
    if (variation < 0) return "trend-down";
    return "trend-neutral";
  };

  if (loading) {
    return (
      <div className="financial-block">
        <div className="block-header">
          <h2>
            <FiBarChart2
              size={24}
              style={{ marginRight: "8px", verticalAlign: "middle" }}
            />
            Bloco Financeiro Consolidado
          </h2>
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
        <h2>
          <FiBarChart2
            size={24}
            style={{ marginRight: "8px", verticalAlign: "middle" }}
          />
          Bloco Financeiro Consolidado
        </h2>
        <p className="block-subtitle">
          Análise completa de receitas, despesas e margem de contribuição
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
            <FiPieChart size={16} />
            Comissões
          </button>
          <button
            className={`chart-btn ${
              selectedChart === "margin" ? "active" : ""
            }`}
            onClick={() => setSelectedChart("margin")}
          >
            <FiHome size={16} />
            Margem por Casa
          </button>
        </div>
      </div>

      {/* Cards de Métricas Financeiras */}
      <div className="financial-cards">
        {/* Total de Vendas */}
        <div className="financial-card total-sales">
          <div className="card-header">
            <div className="card-icon">
              <FiDollarSign size={24} />
            </div>
            <div className="card-trend">
              {getTrendIcon(data.totalSales.variation)}
              <span
                className={`trend-value ${getTrendClass(
                  data.totalSales.variation
                )}`}
              >
                {formatPercentage(data.totalSales.variation)}
              </span>
            </div>
          </div>
          <div className="card-content">
            <h3>Total de Vendas</h3>
            <p className="card-value">
              {formatCurrency(data.totalSales.current)}
            </p>
            <p className="card-description">Receita total no período</p>
          </div>
        </div>

        {/* Total de Comissões */}
        <div className="financial-card total-commissions">
          <div className="card-header">
            <div className="card-icon">
              <FiTrendingUp size={24} />
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
            <h3>Total de Comissões</h3>
            <p className="card-value">
              {formatCurrency(data.totalCommissions.current)}
            </p>
            <p className="card-description">Comissões pagas no período</p>
          </div>
        </div>

        {/* Comissões de Fornecedores */}
        <div className="financial-card supplier-commissions">
          <div className="card-header">
            <div className="card-icon">
              <FiFileText size={24} />
            </div>
          </div>
          <div className="card-content">
            <h3>Comissões Fornecedores</h3>
            <p className="card-value">
              {formatCurrency(data.supplierCommissions.current)}
            </p>
            <p className="card-description">Comissões pagas a fornecedores</p>
          </div>
        </div>

        {/* Total Concierge */}
        <div className="financial-card total-concierge">
          <div className="card-header">
            <div className="card-icon">
              <FiUsers size={24} />
            </div>
          </div>
          <div className="card-content">
            <h3>Total Concierge</h3>
            <p className="card-value">
              {formatCurrency(data.concierge.current)}
            </p>
            <p className="card-description">Receita de serviços de concierge</p>
          </div>
        </div>

        {/* Pagamentos a Governantas */}
        <div className="financial-card housekeeper-payments">
          <div className="card-header">
            <div className="card-icon">
              <FiHome size={24} />
            </div>
          </div>
          <div className="card-content">
            <h3>Pagamentos Governantas</h3>
            <p className="card-value">
              {formatCurrency(data.housekeeperPayments.current)}
            </p>
            <p className="card-description">
              Pagamentos realizados a governantas
            </p>
          </div>
        </div>

        {/* Margem de Contribuição */}
        <div className="financial-card contribution-margin">
          <div className="card-header">
            <div className="card-icon">
              <FiBarChart size={24} />
            </div>
            <div className="card-trend">
              {getTrendIcon(data.contributionMargin.total.variation)}
              <span
                className={`trend-value ${getTrendClass(
                  data.contributionMargin.total.variation
                )}`}
              >
                {formatPercentage(data.contributionMargin.total.variation)}
              </span>
            </div>
          </div>
          <div className="card-content">
            <h3>Margem de Contribuição</h3>
            <p className="card-value">
              {formatCurrency(data.contributionMargin.total.current)}
            </p>
            <p className="card-description">Receita - Despesas diretas</p>
          </div>
        </div>
      </div>

      {/* Container de Gráficos */}
      <div className="chart-container">
        {/* Gráfico de Total de Vendas */}
        {selectedChart === "sales" && (
          <div className="chart-section">
            <div className="chart-header">
              <h3>
                <FiBarChart size={20} />
                Evolução de Vendas - Mês a Mês
              </h3>
              <div className="chart-info">
                <span>Período: Últimos 12 meses</span>
              </div>
            </div>
            <div className="chart-content">
              <div className="simple-chart">
                <div className="chart-bars">
                  {data.totalSales.chartData.map((item, index) => (
                    <div key={index} className="chart-bar-container">
                      <div className="chart-bar-wrapper">
                        <div
                          className="chart-bar"
                          style={{
                            height: `${
                              (item.value /
                                Math.max(
                                  ...data.totalSales.chartData.map(
                                    (d) => d.value
                                  )
                                )) *
                              100
                            }%`,
                            backgroundColor: `hsl(${
                              200 + index * 20
                            }, 70%, 50%)`,
                          }}
                        ></div>
                        <div className="bar-value">
                          {formatCurrency(item.value)}
                        </div>
                      </div>
                      <div className="bar-label">
                        {item.label
                          ? new Date(item.label).toLocaleDateString("pt-BR", {
                              month: "short",
                              year: "2-digit",
                            })
                          : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gráfico de Comissões */}
        {selectedChart === "commissions" && (
          <div className="chart-section">
            <div className="chart-header">
              <h3>
                <FiPieChart size={20} />
                Evolução de Comissões - Mês a Mês
              </h3>
              <div className="chart-info">
                <span>Período: Últimos 12 meses</span>
              </div>
            </div>
            <div className="chart-content">
              <div className="simple-chart">
                <div className="chart-bars">
                  {data.totalCommissions.chartData.map((item, index) => (
                    <div key={index} className="chart-bar-container">
                      <div className="chart-bar-wrapper">
                        <div
                          className="chart-bar"
                          style={{
                            height: `${
                              (item.value /
                                Math.max(
                                  ...data.totalCommissions.chartData.map(
                                    (d) => d.value
                                  )
                                )) *
                              100
                            }%`,
                            backgroundColor: `hsl(${
                              120 + index * 15
                            }, 70%, 50%)`,
                          }}
                        ></div>
                        <div className="bar-value">
                          {formatCurrency(item.value)}
                        </div>
                      </div>
                      <div className="bar-label">
                        {item.label
                          ? new Date(item.label).toLocaleDateString("pt-BR", {
                              month: "short",
                              year: "2-digit",
                            })
                          : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gráfico de Margem por Casa */}
        {selectedChart === "margin" && (
          <div className="chart-section">
            <div className="chart-header">
              <h3>
                <FiHome size={20} />
                Margem de Contribuição por Casa
              </h3>
              <div className="chart-info">
                <span>Comparativo entre casas</span>
              </div>
            </div>
            <div className="chart-content">
              <div className="margin-chart">
                {data.contributionMargin.byHouse.map((house, index) => (
                  <div key={index} className="margin-house">
                    <div className="house-header">
                      <h4>{house.houseName}</h4>
                      <span className="house-value">
                        {formatCurrency(house.margin)}
                      </span>
                    </div>
                    <div className="house-bar">
                      <div
                        className="house-progress"
                        style={{
                          width: `${
                            (house.margin /
                              Math.max(
                                ...data.contributionMargin.byHouse.map(
                                  (h) => h.margin
                                )
                              )) *
                            100
                          }%`,
                          backgroundColor: `hsl(${280 + index * 40}, 70%, 50%)`,
                        }}
                      ></div>
                    </div>
                    <div className="house-details">
                      <div className="detail-item">
                        <span>Receita:</span>
                        <span>{formatCurrency(house.totalRevenue)}</span>
                      </div>
                      <div className="detail-item">
                        <span>Despesas:</span>
                        <span>{formatCurrency(house.totalCosts)}</span>
                      </div>
                      <div className="detail-item">
                        <span>Margem:</span>
                        <span className="margin-percentage">
                          {formatPercentage(house.marginPercentage)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialBlock;

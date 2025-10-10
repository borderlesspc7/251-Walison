import React from "react";
import "./ComparativeReport.css";
import {
  FiBarChart2,
  FiTrendingUp,
  FiTrendingDown,
  FiArrowRight,
  FiHome,
  FiBell,
  FiUsers,
} from "react-icons/fi";
import type { ComparativeReport as ComparativeReportType } from "../../../types/financial";

interface ComparativeReportProps {
  data: ComparativeReportType;
}

const ComparativeReport: React.FC<ComparativeReportProps> = ({ data }) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  const getTrendIcon = (trend: "up" | "down" | "neutral") => {
    if (trend === "up") return <FiTrendingUp size={16} />;
    if (trend === "down") return <FiTrendingDown size={16} />;
    return <FiArrowRight size={16} />;
  };

  const getTrendClass = (trend: "up" | "down" | "neutral"): string => {
    if (trend === "up") return "trend-up";
    if (trend === "down") return "trend-down";
    return "trend-neutral";
  };

  const metrics = [
    {
      label: "Total de Vendas",
      key: "totalSales" as const,
      format: (val: number) => val.toString(),
    },
    {
      label: "Receita Total",
      key: "totalRevenue" as const,
      format: formatCurrency,
    },
    {
      label: "Receita Diárias",
      key: "dailyRates" as const,
      format: formatCurrency,
    },
    {
      label: "Receita Concierge",
      key: "concierge" as const,
      format: formatCurrency,
    },
    {
      label: "Comissões Fornecedores",
      key: "suppliersCommission" as const,
      format: formatCurrency,
    },
    {
      label: "Ticket Médio",
      key: "averageTicket" as const,
      format: formatCurrency,
    },
    {
      label: "Noites Vendidas",
      key: "numberOfNights" as const,
      format: (val: number) => val.toString(),
    },
  ];

  return (
    <div className="comparative-report">
      <h2>
        <FiBarChart2
          size={28}
          style={{ verticalAlign: "middle", marginRight: "0.5rem" }}
        />
        Relatório Comparativo entre Períodos
      </h2>
      <p className="report-subtitle">
        Análise comparativa das métricas entre dois períodos
      </p>

      {/* Cabeçalhos dos Períodos */}
      <div className="periods-header">
        <div className="period-card period1">
          <span className="period-label">Período 1</span>
          <span className="period-value">{data.period1.label}</span>
        </div>
        <div className="versus">VS</div>
        <div className="period-card period2">
          <span className="period-label">Período 2</span>
          <span className="period-value">{data.period2.label}</span>
        </div>
      </div>

      {/* Tabela Comparativa */}
      <div className="table-container">
        <table className="comparative-table">
          <thead>
            <tr>
              <th>Métrica</th>
              <th>{data.period1.label}</th>
              <th>{data.period2.label}</th>
              <th>Variação</th>
              <th>Variação %</th>
              <th>Tendência</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => {
              const comparison = data.comparison[metric.key];
              const val1 = data.period1.metrics[metric.key];
              const val2 = data.period2.metrics[metric.key];

              return (
                <tr key={metric.key}>
                  <td>
                    <strong>{metric.label}</strong>
                  </td>
                  <td className="value-cell">{metric.format(val1)}</td>
                  <td className="value-cell">{metric.format(val2)}</td>
                  <td
                    className={`change-cell ${getTrendClass(comparison.trend)}`}
                  >
                    {metric.key === "totalSales" ||
                    metric.key === "numberOfNights"
                      ? comparison.absoluteChange > 0
                        ? `+${comparison.absoluteChange}`
                        : comparison.absoluteChange.toString()
                      : formatCurrency(comparison.absoluteChange)}
                  </td>
                  <td
                    className={`percentage-cell ${getTrendClass(
                      comparison.trend
                    )}`}
                  >
                    {formatPercentage(comparison.percentageChange)}
                  </td>
                  <td className="trend-cell">
                    <span
                      className={`trend-badge ${getTrendClass(
                        comparison.trend
                      )}`}
                    >
                      {getTrendIcon(comparison.trend)}{" "}
                      {comparison.trend === "up"
                        ? "Crescimento"
                        : comparison.trend === "down"
                        ? "Queda"
                        : "Estável"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Resumo das Três Fontes de Receita */}
      <div className="revenue-sources-comparison">
        <h3>Comparação das Três Fontes de Receita</h3>
        <div className="sources-grid">
          <div className="source-item">
            <div className="source-header">
              <span className="source-icon">
                <FiHome size={28} />
              </span>
              <h4>Diárias</h4>
            </div>
            <div className="source-values">
              <div className="source-period">
                <span className="period-label">Período 1</span>
                <span className="period-value">
                  {formatCurrency(data.period1.metrics.dailyRates)}
                </span>
              </div>
              <div className="source-period">
                <span className="period-label">Período 2</span>
                <span className="period-value">
                  {formatCurrency(data.period2.metrics.dailyRates)}
                </span>
              </div>
            </div>
            <div
              className={`source-change ${getTrendClass(
                data.comparison.dailyRates.trend
              )}`}
            >
              {formatPercentage(data.comparison.dailyRates.percentageChange)}
            </div>
          </div>

          <div className="source-item">
            <div className="source-header">
              <span className="source-icon">
                <FiBell size={28} />
              </span>
              <h4>Concierge</h4>
            </div>
            <div className="source-values">
              <div className="source-period">
                <span className="period-label">Período 1</span>
                <span className="period-value">
                  {formatCurrency(data.period1.metrics.concierge)}
                </span>
              </div>
              <div className="source-period">
                <span className="period-label">Período 2</span>
                <span className="period-value">
                  {formatCurrency(data.period2.metrics.concierge)}
                </span>
              </div>
            </div>
            <div
              className={`source-change ${getTrendClass(
                data.comparison.concierge.trend
              )}`}
            >
              {formatPercentage(data.comparison.concierge.percentageChange)}
            </div>
          </div>

          <div className="source-item">
            <div className="source-header">
              <span className="source-icon">
                <FiUsers size={28} />
              </span>
              <h4>Comissões</h4>
            </div>
            <div className="source-values">
              <div className="source-period">
                <span className="period-label">Período 1</span>
                <span className="period-value">
                  {formatCurrency(data.period1.metrics.suppliersCommission)}
                </span>
              </div>
              <div className="source-period">
                <span className="period-label">Período 2</span>
                <span className="period-value">
                  {formatCurrency(data.period2.metrics.suppliersCommission)}
                </span>
              </div>
            </div>
            <div
              className={`source-change ${getTrendClass(
                data.comparison.suppliersCommission.trend
              )}`}
            >
              {formatPercentage(
                data.comparison.suppliersCommission.percentageChange
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparativeReport;

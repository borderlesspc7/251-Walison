import React from "react";
import {
  FiCalendar,
  FiPlay,
  FiCheckCircle,
  FiAlertTriangle,
  FiClock,
  FiTrendingUp,
  FiTrendingDown,
  FiBarChart2,
} from "react-icons/fi";
import type { ProcessMetrics } from "../../../types/processDashboard";
import "./TopIndicators.css";

interface TopIndicatorsProps {
  metrics: ProcessMetrics;
  loading?: boolean;
}

const TopIndicators: React.FC<TopIndicatorsProps> = ({
  metrics,
  loading = false,
}) => {
  const calculateVariation = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const formatTime = (hours: number): string => {
    if (hours < 24) {
      return `${Math.round(hours)}h`;
    }

    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  };

  const formatPercentage = (value: number): string => {
    return `${Math.round(value)}%`;
  };

  const getTrendIcon = (variation: number): React.ReactNode => {
    if (variation > 0) {
      return <FiTrendingUp size={16} className="trend-up" />;
    } else if (variation < 0) {
      return <FiTrendingDown size={16} className="trend-down" />;
    }
    return null;
  };

  // Função para obter cor da variação
  const getVariationColor = (
    variation: number,
    isGoodIncrease: boolean = true
  ): string => {
    if (variation > 0) {
      return isGoodIncrease ? "#10b981" : "#ef4444"; // Verde se é bom aumento, vermelho se é ruim
    } else if (variation < 0) {
      return isGoodIncrease ? "#ef4444" : "#10b981"; // Vermelho se é ruim, verde se é bom
    }
    return "#6b7280"; // Cinza se não há variação
  };

  const indicators = [
    {
      id: "total-reservations",
      title: "Total de Reservas",
      value: metrics.totalReservations,
      previousValue: metrics.lastMonth.newReservations,
      icon: <FiCalendar size={24} />,
      color: "blue",
      isGoodIncrease: true,
      subtitle: "Este mês",
    },
    {
      id: "active-processes",
      title: "Processos Ativos",
      value: metrics.activeConciergeProcesses,
      previousValue: null,
      icon: <FiPlay size={24} />,
      color: "orange",
      isGoodIncrease: false,
      subtitle: "Em andamento",
    },
    {
      id: "completed-processes",
      title: "Processos Concluídos",
      value: metrics.completedProcesses,
      previousValue: metrics.lastMonth.completedProcesses,
      icon: <FiCheckCircle size={24} />,
      color: "green",
      isGoodIncrease: true,
      subtitle: "Este mês",
    },
    {
      id: "overdue-processes",
      title: "Processos Atrasados",
      value: metrics.overdueProcesses,
      previousValue: null,
      icon: <FiAlertTriangle size={24} />,
      color: "red",
      isGoodIncrease: false,
      subtitle: "Precisam atenção",
    },
    {
      id: "average-time",
      title: "Tempo Médio",
      value: formatTime(metrics.averageProcessTime),
      previousValue: metrics.lastMonth.averageTime,
      icon: <FiClock size={24} />,
      color: "purple",
      isGoodIncrease: false,
      subtitle: "Por processo",
    },
    {
      id: "completion-rate",
      title: "Taxa de Conclusão",
      value: formatPercentage(metrics.completionRate),
      previousValue: null,
      icon: <FiBarChart2 size={24} />,
      color: "teal",
      isGoodIncrease: true,
      subtitle: "Geral",
    },
  ];

  if (loading) {
    return (
      <div className="top-indicators">
        <div className="indicators-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="indicator-card loading">
              <div className="card-header">
                <div className="skeleton-icon"></div>
                <div className="skeleton-title"></div>
              </div>
              <div className="card-content">
                <div className="skeleton-value"></div>
                <div className="skeleton-subtitle"></div>
                <div className="skeleton-variation"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="top-indicators">
      <div className="indicators-header">
        <h2>
          <FiBarChart2 size={24} />
          Indicadores Principais
        </h2>
        <p> Visão geral dos processos e performance</p>
      </div>

      <div className="indicators-grid">
        {indicators.map((indicator) => {
          const variation =
            indicator.previousValue !== null
              ? calculateVariation(
                  indicator.value as number,
                  indicator.previousValue
                )
              : null;

          return (
            <div
              key={indicator.id}
              className={`indicator-card ${indicator.color}`}
            >
              <div className="card-header">
                <div className="card-icon">{indicator.icon}</div>
                <div className="card-title">
                  <h3>{indicator.title}</h3>
                  <span className="card-subtitle">{indicator.subtitle}</span>
                </div>
              </div>
              <div className="card-content">
                <div className="card-value">
                  {typeof indicator.value === "number"
                    ? indicator.value.toLocaleString()
                    : indicator.value}
                </div>

                {variation !== null && (
                  <div className="card-variation">
                    <span
                      className="variation-value"
                      style={{
                        color: getVariationColor(
                          variation,
                          indicator.isGoodIncrease
                        ),
                      }}
                    >
                      {variation > 0 ? "+" : ""}
                      {Math.round(variation)}%
                    </span>
                    <span className="variation-icon">
                      {getTrendIcon(variation)}
                    </span>
                    <span className="variation-label">vs mes anterior</span>
                  </div>
                )}
              </div>

              {indicator.id === "overdue-process" &&
                metrics.overdueProcesses > 0 && (
                  <div className="critical-badge">Atenção necessária</div>
                )}

              {indicator.id === "completion-rate" &&
                metrics.completionRate >= 90 && (
                  <div className="excellent-badge">Excelente performance</div>
                )}
            </div>
          );
        })}
      </div>

      <div className="executive-summary">
        <div className="summary-card">
          <h3>Resumo Executivo</h3>
          <div className="summary-content">
            <div className="summary-item">
              <span className="summary-label">Status geral:</span>
              <span
                className={`summary-value ${
                  metrics.overdueProcesses === 0 && metrics.completionRate >= 80
                    ? "status-good"
                    : metrics.overdueProcesses > 5 ||
                      metrics.completionRate < 60
                    ? "status-critical"
                    : "status-warning"
                }`}
              >
                {metrics.overdueProcesses === 0 && metrics.completionRate >= 80
                  ? "Excelente"
                  : metrics.overdueProcesses > 5 || metrics.completionRate < 60
                  ? "Crítico"
                  : "Atenção"}
              </span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Processos em andamento:</span>
              <span className="summary-value">
                {metrics.activeConciergeProcesses}
              </span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Eficicência:</span>
              <span className="summary-value">
                {formatPercentage(metrics.completionRate)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopIndicators;

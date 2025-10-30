import React from "react";
import {
  FiTrendingUp,
  FiTarget,
  FiDollarSign,
  FiActivity,
  FiAlertTriangle,
} from "react-icons/fi";
import type { AnnualThermometer } from "../../../types/dashboardGoals";
import "./SalesThermometer.css";

interface SalesThermometerProps {
  data: AnnualThermometer;
  isLoading?: boolean;
}

export const SalesThermometer: React.FC<SalesThermometerProps> = ({
  data,
  isLoading = false,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const getThermometerColor = (percentage: number): string => {
    if (percentage >= 100) return "#10b981";
    if (percentage >= 75) return "#3b82f6";
    if (percentage >= 50) return "#f59e0b";
    if (percentage >= 25) return "#f97316";
    return "#ef4444";
  };

  const getStatusInfo = (percentage: number) => {
    if (percentage >= 100) {
      return {
        label: "Meta atingida",
        icon: FiTarget,
        color: "#10b981",
      };
    }
    if (percentage >= 75) {
      return {
        label: "Excelente progresso",
        icon: FiTrendingUp,
        color: "#3b82f6",
      };
    }
    if (percentage >= 50) {
      return {
        label: "Progresso moderado",
        icon: FiActivity,
        color: "#f59e0b",
      };
    }
    return {
      label: "Atenção Necessária",
      icon: FiAlertTriangle,
      color: "#ef4444",
    };
  };

  if (isLoading) {
    return (
      <div className="sales-thermometer">
        <div className="thermometer-skeleton">
          <div className="skeleton-header"></div>
          <div className="skeleton-thermometer"></div>
          <div className="skeleton-stats"></div>
        </div>
      </div>
    );
  }

  const thermometerColor = getThermometerColor(data.percentage);
  const statusInfo = getStatusInfo(data.percentage);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="sales-thermometer">
      <div className="thermometer-header">
        <div className="header-title">
          <FiDollarSign className="title-icon" />
          <h3>Termômetro de Vendas {data.year}</h3>
        </div>
        <div
          className="status-badge"
          style={{ backgroundColor: statusInfo.color }}
        >
          <StatusIcon className="status-icon" />
          <span>{statusInfo.label}</span>
        </div>
      </div>

      <div className="thermometer-content">
        <div className="thermometer-visual">
          <div className="thermometer-container">
            <div
              className="thermometer-bulb"
              style={{ borderColor: thermometerColor }}
            >
              <div
                className="thermometer-mercury"
                style={{ backgroundColor: thermometerColor }}
              ></div>
            </div>
            <div className="thermometer-tube">
              <div className="temperature-markers">
                <div className="marker">
                  <span className="marker-label">100%</span>
                  <div className="marker-line"></div>
                </div>
                <div className="marker">
                  <span className="marker-label">75%</span>
                  <div className="marker-line"></div>
                </div>
                <div className="marker">
                  <span className="marker-label">50%</span>
                  <div className="marker-line"></div>
                </div>
                <div className="marker">
                  <span className="marker-label">25%</span>
                  <div className="marker-line"></div>
                </div>
                <div className="marker">
                  <span className="marker-label">0%</span>
                  <div className="marker-line"></div>
                </div>
              </div>
              <div className="thermometer-fill-container">
                <div
                  className="thermometer-fill"
                  style={{
                    height: `${Math.min(data.percentage, 100)}%`,
                    backgroundColor: thermometerColor,
                  }}
                >
                  <div className="fill-shimmer"></div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="percentage-display"
            style={{ color: thermometerColor }}
          >
            <span className="percentage-value">
              {formatPercentage(data.percentage)}
            </span>
            <span className="percentage-label">Atingido</span>
          </div>
        </div>

        <div className="thermometer-stats">
          <div className="stat-card achieved">
            <div className="stat-header">
              <FiTrendingUp className="stat-icon" />
              <span className="stat-label">Vendas Realizadas</span>
            </div>
            <div className="stat-value">
              {formatCurrency(data.totalAchieved)}
            </div>
            <div className="stat-detail">
              Faltam{" "}
              <strong>
                {formatCurrency(data.totalGoal - data.totalAchieved)}
              </strong>{" "}
              para atingir a meta
            </div>
          </div>

          <div className="stat-card target">
            <div className="stat-header">
              <FiTarget className="stat-icon" />
              <span className="stat-label">Meta Anual</span>
            </div>
            <div className="stat-value">{formatCurrency(data.totalGoal)}</div>
            <div className="stat-detail">
              {data.percentage >= 100 ? (
                <span className="success-text">
                  <FiTarget style={{ marginRight: "4px" }} />
                  Meta superada em{" "}
                  {formatCurrency(data.totalAchieved - data.totalGoal)}!
                </span>
              ) : (
                <span>
                  Meta restante:{" "}
                  <strong>
                    {formatCurrency(data.totalGoal - data.totalAchieved)}
                  </strong>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${Math.min(data.percentage, 100)}%`,
              backgroundColor: thermometerColor,
            }}
          >
            <span className="progress-text">
              {formatPercentage(data.percentage)}
            </span>
          </div>
        </div>

        <div className="progress-labels">
          <span>R$ 0</span>
          <span>{formatCurrency(data.totalGoal)}</span>
        </div>
      </div>
    </div>
  );
};

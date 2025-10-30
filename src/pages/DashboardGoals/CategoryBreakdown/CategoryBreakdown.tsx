import React from "react";
import {
  FiDollarSign,
  FiFileText,
  FiUsers,
  FiBell,
  FiHome,
  FiTrendingUp,
  FiTrendingDown,
  FiTarget,
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
} from "react-icons/fi";
import type {
  CategoryChartData,
  GoalCategory,
} from "../../../types/dashboardGoals";
import "./CategoryBreakdown.css";

interface CategoryBreakdownProps {
  data: CategoryChartData[];
  isLoading?: boolean;
}

interface CategoryConfig {
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const CATEGORY_CONFIGS: Record<GoalCategory, CategoryConfig> = {
  rental_sales: {
    label: "Vendas de Locações",
    icon: FiDollarSign,
    color: "#3b82f6",
    bgColor: "#dbeafe",
  },
  contracts_quantity: {
    label: "Quantidade de Contratos",
    icon: FiFileText,
    color: "#10b981",
    bgColor: "#d1fae5",
  },
  supplier_commission: {
    label: "Comissão Fornecedores",
    icon: FiUsers,
    color: "#f59e0b",
    bgColor: "#fef3c7",
  },
  concierge: {
    label: "Concierge",
    icon: FiBell,
    color: "#8b5cf6",
    bgColor: "#ede9fe",
  },
  house_sales: {
    label: "Vendas de Casas",
    icon: FiHome,
    color: "#ec4899",
    bgColor: "#fce7f3",
  },
};

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  data,
  isLoading = false,
}) => {
  const formatValue = (value: number, category: string): string => {
    if (
      category.toLowerCase().includes("contratos") ||
      category.toLowerCase().includes("contracts")
    ) {
      return value.toString();
    }
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatus = (percentage: number) => {
    if (percentage >= 100) {
      return {
        label: "Meta Atingida",
        icon: FiCheckCircle,
        color: "#10b981",
        bgColor: "#d1fae5",
      };
    }
    if (percentage >= 75) {
      return {
        label: "No Caminho",
        icon: FiTrendingUp,
        color: "#3b82f6",
        bgColor: "#dbeafe",
      };
    }
    if (percentage >= 50) {
      return {
        label: "Atenção",
        icon: FiAlertTriangle,
        color: "#f59e0b",
        bgColor: "#fef3c7",
      };
    }
    return {
      label: "Abaixo da Meta",
      icon: FiXCircle,
      color: "#ef4444",
      bgColor: "#fee2e2",
    };
  };

  if (isLoading) {
    return (
      <div className="category-breakdown">
        <div className="breakdown-header">
          <h3>Desempenho por Categoria</h3>
        </div>
        <div className="breakdown-grid">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="category-card skeleton">
              <div className="skeleton-content"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="category-breakdown">
      <div className="breakdown-header">
        <FiTarget className="header-icon" />
        <h3>Desempenho por Categoria</h3>
      </div>

      <div className="breakdown-grid">
        {data.map((item) => {
          const categoryKey = item.category
            .toLowerCase()
            .replace(/\s+/g, "_") as GoalCategory;
          const config = CATEGORY_CONFIGS[categoryKey] || {
            label: item.category,
            icon: FiTarget,
            color: "#6b7280",
            bgColor: "#f3f4f6",
          };
          const status = getStatus(item.percentage);
          const Icon = config.icon;
          const StatusIcon = status.icon;
          const difference = item.achieved - item.goal;
          const isPositive = difference >= 0;

          return (
            <div key={item.category} className="category-card">
              {/* Card Header */}
              <div className="card-header">
                <div
                  className="category-icon-wrapper"
                  style={{ backgroundColor: config.bgColor }}
                >
                  <Icon
                    className="category-icon"
                    style={{ color: config.color }}
                  />
                </div>
                <div className="category-info">
                  <h4 className="category-title">{config.label}</h4>
                  <div
                    className="status-badge"
                    style={{
                      backgroundColor: status.bgColor,
                      color: status.color,
                    }}
                  >
                    <StatusIcon className="status-icon" />
                    <span>{status.label}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="progress-section">
                <div className="progress-bar-container">
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.min(item.percentage, 100)}%`,
                        backgroundColor: config.color,
                      }}
                    >
                      <div className="progress-shimmer"></div>
                    </div>
                  </div>
                </div>
                <div
                  className="progress-percentage"
                  style={{ color: config.color }}
                >
                  {item.percentage.toFixed(1)}%
                </div>
              </div>

              {/* Values */}
              <div className="values-section">
                <div className="value-item">
                  <div className="value-label">
                    <FiTarget className="value-icon" />
                    Meta
                  </div>
                  <div className="value-amount">
                    {formatValue(item.goal, item.category)}
                  </div>
                </div>
                <div className="value-item achieved">
                  <div className="value-label">
                    <FiCheckCircle className="value-icon" />
                    Realizado
                  </div>
                  <div className="value-amount" style={{ color: config.color }}>
                    {formatValue(item.achieved, item.category)}
                  </div>
                </div>
              </div>

              {/* Difference */}
              <div className="difference-section">
                <div
                  className={`difference ${
                    isPositive ? "positive" : "negative"
                  }`}
                >
                  {isPositive ? (
                    <FiTrendingUp className="diff-icon" />
                  ) : (
                    <FiTrendingDown className="diff-icon" />
                  )}
                  <span className="diff-label">
                    {isPositive ? "Superado em" : "Faltam"}:
                  </span>
                  <span className="diff-value">
                    {formatValue(Math.abs(difference), item.category)}
                  </span>
                </div>
              </div>

              {/* Mini Chart (usando divs, sem SVG) */}
              <div className="mini-chart">
                <div className="chart-label">Tendência</div>
                <div className="chart-bars">
                  {[20, 35, 45, 60, 75, 85, item.percentage].map(
                    (value, index) => (
                      <div key={index} className="chart-bar-wrapper">
                        <div
                          className="chart-bar"
                          style={{
                            height: `${Math.min(value, 100)}%`,
                            backgroundColor:
                              index === 6 ? config.color : `${config.color}80`,
                            opacity: index === 6 ? 1 : 0.5,
                          }}
                        ></div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

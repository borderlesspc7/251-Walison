import React, { useState } from "react";
import {
  FiBarChart2,
  FiTrendingUp,
  FiTrendingDown,
  FiCalendar,
  FiTarget,
} from "react-icons/fi";
import type {
  MonthlyChartData,
  GoalCategory,
} from "../../../types/dashboardGoals";
import "./MonthlyGoalsChart.css";

interface MonthlyGoalsChartProps {
  data: MonthlyChartData[];
  isLoading?: boolean;
}

interface CategoryConfig {
  label: string;
  goalKey: keyof MonthlyChartData;
  achievedKey: keyof MonthlyChartData;
  color: string;
}

const CATEGORY_CONFIGS: Record<GoalCategory, CategoryConfig> = {
  rental_sales: {
    label: "Vendas de Locações",
    goalKey: "rentalSalesGoal",
    achievedKey: "rentalSalesAchieved",
    color: "#3b82f6",
  },
  contracts_quantity: {
    label: "Quantidade de Contratos",
    goalKey: "contractsGoal",
    achievedKey: "contractsAchieved",
    color: "#10b981",
  },
  supplier_commission: {
    label: "Comissão Fornecedores",
    goalKey: "supplierCommissionGoal",
    achievedKey: "supplierCommissionAchieved",
    color: "#f59e0b",
  },
  concierge: {
    label: "Concierge",
    goalKey: "conciergeGoal",
    achievedKey: "conciergeAchieved",
    color: "#8b5cf6",
  },
  house_sales: {
    label: "Vendas de Casas",
    goalKey: "houseSalesGoal",
    achievedKey: "houseSalesAchieved",
    color: "#ec4899",
  },
};

export const MonthlyGoalsChart: React.FC<MonthlyGoalsChartProps> = ({
  data,
  isLoading = false,
}) => {
  const [selectedCategory, setSelectedCategory] =
    useState<GoalCategory>("rental_sales");

  const formatValue = (value: number, category: GoalCategory): string => {
    if (category === "contracts_quantity") {
      return value.toString();
    }
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const calculateStats = () => {
    const config = CATEGORY_CONFIGS[selectedCategory];
    const totalGoal = data.reduce(
      (sum, item) => sum + (item[config.goalKey] as number),
      0
    );
    const totalAchieved = data.reduce(
      (sum, item) => sum + (item[config.achievedKey] as number),
      0
    );
    const percentage = totalGoal > 0 ? (totalAchieved / totalGoal) * 100 : 0;
    const difference = totalAchieved - totalGoal;

    return {
      totalGoal,
      totalAchieved,
      percentage,
      difference,
      status:
        percentage >= 100
          ? "exceeded"
          : percentage >= 75
          ? "on_track"
          : "below_target",
    };
  };

  const getMaxValue = () => {
    const config = CATEGORY_CONFIGS[selectedCategory];
    return Math.max(
      ...data.map((item) =>
        Math.max(
          item[config.goalKey] as number,
          item[config.achievedKey] as number
        )
      )
    );
  };

  const calculateBarHeight = (value: number): number => {
    const maxValue = getMaxValue();
    return maxValue > 0 ? (value / maxValue) * 100 : 0;
  };

  if (isLoading) {
    return (
      <div className="monthly-goals-chart">
        <div className="chart-skeleton">
          <div className="skeleton-header"></div>
          <div className="skeleton-filters"></div>
          <div className="skeleton-chart"></div>
          <div className="skeleton-stats"></div>
        </div>
      </div>
    );
  }

  const config = CATEGORY_CONFIGS[selectedCategory];
  const stats = calculateStats();

  return (
    <div className="monthly-goals-chart">
      <div className="chart-header">
        <div className="header-title">
          <FiBarChart2 className="title-icon" />
          <h3>Evolução Mensal de Metas</h3>
        </div>
        <div className="header-stats">
          <div className="stat-badge">
            <FiTarget className="stat-icon" />
            <span>Meta: {formatValue(stats.totalGoal, selectedCategory)}</span>
          </div>

          <div className={`stat-badge ${stats.status}`}>
            {stats.percentage >= 100 ? (
              <FiTrendingUp className="stat-icon" />
            ) : (
              <FiTrendingDown className="stat-icon" />
            )}
            <span>{stats.percentage.toFixed(1)}% Atingido</span>
          </div>
        </div>
      </div>

      <div className="category-filters">
        {(Object.keys(CATEGORY_CONFIGS) as GoalCategory[]).map((category) => (
          <button
            key={category}
            className={`category-btn ${
              selectedCategory === category ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(category)}
            style={{
              borderColor:
                selectedCategory === category
                  ? CATEGORY_CONFIGS[category].color
                  : undefined,
            }}
          >
            <span
              className="category-color"
              style={{ backgroundColor: CATEGORY_CONFIGS[category].color }}
            ></span>
            {CATEGORY_CONFIGS[category].label}
          </button>
        ))}
      </div>

      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-box goal"></div>
          <span>Meta</span>
        </div>
        <div className="legend-item">
          <div
            className="legend-box achieved"
            style={{ backgroundColor: config.color }}
          ></div>
          <span>Realizado</span>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-bars">
          {data.map((monthData) => {
            const goalValue = monthData[config.goalKey] as number;
            const achievedValue = monthData[config.achievedKey] as number;
            const monthPercentage =
              goalValue > 0 ? (achievedValue / goalValue) * 100 : 0;
            const isExceeded = monthPercentage >= 100;

            return (
              <div key={monthData.month} className="bar-group">
                <div className="bars">
                  {/* Barra de Meta */}
                  <div className="bar-container">
                    <div
                      className="bar goal-bar"
                      style={{ height: `${calculateBarHeight(goalValue)}%` }}
                      title={`Meta: ${formatValue(
                        goalValue,
                        selectedCategory
                      )}`}
                    >
                      <span className="bar-value">
                        {formatValue(goalValue, selectedCategory)}
                      </span>
                    </div>
                  </div>

                  {/* Barra de Realizado */}
                  <div className="bar-container">
                    <div
                      className={`bar achieved-bar ${
                        isExceeded ? "exceeded" : ""
                      }`}
                      style={{
                        height: `${calculateBarHeight(achievedValue)}%`,
                        backgroundColor: config.color,
                      }}
                      title={`Realizado: ${formatValue(
                        achievedValue,
                        selectedCategory
                      )}`}
                    >
                      <span className="bar-value">
                        {formatValue(achievedValue, selectedCategory)}
                      </span>
                      {isExceeded && (
                        <div className="exceeded-badge">
                          <FiTrendingUp />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div
                  className={`month-percentage ${isExceeded ? "exceeded" : ""}`}
                >
                  {monthPercentage.toFixed(0)}%
                </div>

                {/* Label do Mês */}
                <div className="month-label">
                  <FiCalendar className="month-icon" />
                  <span>{monthData.month}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="chart-summary">
        <div className="summary-card">
          <div className="summary-label">Total Meta</div>
          <div className="summary-value">
            {formatValue(stats.totalGoal, selectedCategory)}
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Total Realizado</div>
          <div className="summary-value achieved">
            {formatValue(stats.totalAchieved, selectedCategory)}
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Diferença</div>
          <div
            className={`summary-value ${
              stats.difference >= 0 ? "positive" : "negative"
            }`}
          >
            {stats.difference >= 0 ? "+" : ""}
            {formatValue(Math.abs(stats.difference), selectedCategory)}
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Percentual Atingido</div>
          <div className={`summary-value ${stats.status}`}>
            {stats.percentage.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
};

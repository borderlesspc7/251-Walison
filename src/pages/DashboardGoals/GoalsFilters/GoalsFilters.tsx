import React from "react";
import { FiCalendar, FiFilter, FiRefreshCw } from "react-icons/fi";
import type {
  GoalFilters,
  GoalPeriod,
  GoalCategory,
} from "../../../types/dashboardGoals";
import "./GoalsFilters.css";

interface GoalsFiltersProps {
  filters: GoalFilters;
  onFiltersChange: (filters: GoalFilters) => void;
  onRefresh: () => void;
  loading?: boolean;
}

const CATEGORY_OPTIONS: { value: GoalCategory; label: string }[] = [
  { value: "rental_sales", label: "Vendas de Locações" },
  { value: "contracts_quantity", label: "Quantidade de Contratos" },
  { value: "supplier_commission", label: "Comissão de Fornecedores" },
  { value: "concierge", label: "Concierge" },
  { value: "house_sales", label: "Vendas de Casas" },
];

const PERIOD_OPTIONS: { value: GoalPeriod; label: string }[] = [
  { value: "monthly", label: "Mensal" },
  { value: "quarterly", label: "Trimestral" },
  { value: "annual", label: "Anual" },
];

const MONTH_OPTIONS = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

const QUARTER_OPTIONS = [
  { value: { start: 1, end: 3 }, label: "Q1 (Jan-Mar)" },
  { value: { start: 4, end: 6 }, label: "Q2 (Abr-Jun)" },
  { value: { start: 7, end: 9 }, label: "Q3 (Jul-Set)" },
  { value: { start: 10, end: 12 }, label: "Q4 (Out-Dez)" },
];

export const GoalsFilters: React.FC<GoalsFiltersProps> = ({
  filters,
  onFiltersChange,
  onRefresh,
  loading,
}) => {
  const handleYearChange = (year: number) => {
    onFiltersChange({ ...filters, year });
  };

  const handlePeriodChange = (period: GoalPeriod) => {
    const updates: Partial<GoalFilters> = { period };

    if (period === "annual") {
      updates.startMonth = undefined;
      updates.endMonth = undefined;
    } else if (period === "monthly") {
      updates.startMonth = new Date().getMonth() + 1;
      updates.endMonth = undefined;
    } else if (period === "quarterly") {
      updates.startMonth = 1;
      updates.endMonth = 3;
    }
    onFiltersChange({ ...filters, ...updates });
  };

  const handleMonthChange = (month: number) => {
    onFiltersChange({
      ...filters,
      startMonth: month,
      endMonth: undefined,
    });
  };

  const handleQuarterChange = (start: number, end: number) => {
    onFiltersChange({
      ...filters,
      startMonth: start,
      endMonth: end,
    });
  };

  const handleCategoryToggle = (category: GoalCategory) => {
    const currentCategories = filters.categories || [];
    const isSelected = currentCategories.includes(category);

    const newCategories = isSelected
      ? currentCategories.filter((c) => c !== category)
      : [...currentCategories, category];

    onFiltersChange({ ...filters, categories: newCategories });
  };

  const currentYear = new Date().getFullYear();
  const availableYear = [
    currentYear - 3,
    currentYear - 2,
    currentYear - 1,
    currentYear,
    currentYear + 1,
    currentYear + 2,
    currentYear + 3,
  ];

  return (
    <div className="goals-filters">
      <div className="filters-header">
        <div className="filters-title">
          <FiFilter className="title-icon" />
          <h3>Filtros</h3>
        </div>
        <button
          className="refresh-button"
          onClick={onRefresh}
          disabled={loading}
          title="Atualizar dados"
        >
          <FiRefreshCw className={loading ? "spinning" : ""} />
          {loading ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      <div className="filters-content">
        <div className="filter-group">
          <label className="filter-label">
            <FiCalendar className="label-icon" />
            Ano
          </label>
          <div className="year-buttons">
            {availableYear.map((year) => (
              <button
                key={year}
                className={`year-btn ${filters.year === year ? "active" : ""}`}
                onClick={() => handleYearChange(year)}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">Período</label>
          <div className="period-buttons">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                className={`period-btn ${
                  filters.period === option.value ? "active" : ""
                }`}
                onClick={() => handlePeriodChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {filters.period === "monthly" && (
          <div className="filter-group">
            <label className="filter-label">Mês</label>
            <select
              className="month-select"
              value={filters.startMonth || new Date().getMonth() + 1}
              onChange={(e) => handleMonthChange(Number(e.target.value))}
            >
              {MONTH_OPTIONS.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {filters.period === "quarterly" && (
          <div className="filter-group">
            <label className="filter-label">Trimestre</label>
            <div className="quarter-buttons">
              {QUARTER_OPTIONS.map((quarter) => (
                <button
                  key={quarter.value.start}
                  className={`quarter-btn ${
                    filters.startMonth === quarter.value.start &&
                    filters.endMonth === quarter.value.end
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleQuarterChange(quarter.value.start, quarter.value.end)
                  }
                >
                  {quarter.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="filter-group">
          <label className="filter-label">Categoria a exibir</label>
          <div className="category-checkboxes">
            {CATEGORY_OPTIONS.map((category) => (
              <label key={category.value} className="category-checkbox">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category.value)}
                  onChange={() => handleCategoryToggle(category.value)}
                />
                <span className="checkbox-label">{category.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

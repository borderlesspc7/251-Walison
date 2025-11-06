import React, { useState, useEffect } from "react";
import { FiFilter, FiCalendar, FiRefreshCw } from "react-icons/fi";
import type { StatisticsFilters } from "../../../types/dashboardStatistics";
import "./Filter.css";

export interface StatisticsFiltersProps {
  filters: StatisticsFilters;
  onFiltersChange: (filters: StatisticsFilters) => void;
  onClearFilters: () => void;
  loading?: boolean;
}

const StatisticsFiltersComponent: React.FC<StatisticsFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  loading = false,
}) => {
  const [localFilters, setLocalFilters] = useState<StatisticsFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const updateFilter = (
    key: keyof StatisticsFilters,
    value: string | undefined
  ) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const defaultFilters: StatisticsFilters = {
      period: "month",
      startDate: undefined,
      endDate: undefined,
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
    onClearFilters();
  };

  const getPeriodOptions = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    return [
      {
        value: "month",
        label: "Mensal",
        description: `Mês atual (${currentDate.toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        })})`,
      },
      {
        value: "year",
        label: "Anual",
        description: `Ano atual (${currentYear})`,
      },
      {
        value: "custom",
        label: "Personalizado",
        description: "Selecione um período específico",
      },
    ];
  };

  return (
    <div className="statistics-filters">
      <div className="filters-header">
        <div className="filters-title">
          <FiFilter size={24} />
          <h3>Filtros de Estatísticas</h3>
        </div>

        <div className="filters-actions">
          <button
            className="btn-clear-filters"
            onClick={handleClearFilters}
            disabled={loading}
            title="Limpar Filtros"
          >
            <FiRefreshCw size={16} />
            Limpar Filtros
          </button>
        </div>
      </div>

      <div className="filters-grid">
        <div className="filter-group">
          <label className="filter-label">
            <FiCalendar size={16} />
            Período
          </label>
          <select
            value={localFilters.period}
            onChange={(e) => updateFilter("period", e.target.value)}
            className="filter-select"
            disabled={loading}
          >
            {getPeriodOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <small className="filter-description">
            {
              getPeriodOptions().find(
                (opt) => opt.value === localFilters.period
              )?.description
            }
          </small>
        </div>

        {localFilters.period === "custom" && (
          <>
            <div className="filter-group">
              <label className="filter-label">
                <FiCalendar size={16} />
                Data Inicial
              </label>
              <input
                type="date"
                value={localFilters.startDate || ""}
                onChange={(e) =>
                  updateFilter("startDate", e.target.value || undefined)
                }
                className="filter-input"
                disabled={loading}
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">
                <FiCalendar size={16} />
                Data Final
              </label>
              <input
                type="date"
                value={localFilters.endDate || ""}
                onChange={(e) =>
                  updateFilter("endDate", e.target.value || undefined)
                }
                className="filter-input"
                disabled={loading}
              />
            </div>
          </>
        )}
      </div>

      <div className="active-filters-summary">
        <h4>Filtros Ativos:</h4>
        <div className="active-filters-tags">
          <span className="filter-tag">
            Período:{" "}
            {
              getPeriodOptions().find(
                (opt) => opt.value === localFilters.period
              )?.label
            }
          </span>
          {localFilters.startDate && (
            <span className="filter-tag">
              De: {new Date(localFilters.startDate).toLocaleDateString("pt-BR")}
            </span>
          )}
          {localFilters.endDate && (
            <span className="filter-tag">
              Até: {new Date(localFilters.endDate).toLocaleDateString("pt-BR")}
            </span>
          )}
        </div>
      </div>

      {loading && (
        <div className="filters-loading">
          <div className="loading-spinner"></div>
          <span>Carregando filtros...</span>
        </div>
      )}
    </div>
  );
};

export default StatisticsFiltersComponent;

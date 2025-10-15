import React, { useState, useEffect } from "react";
import {
  FiFilter,
  FiCalendar,
  FiAward,
  FiHome,
  FiEye,
  FiRefreshCw,
  FiGrid,
  FiEdit,
} from "react-icons/fi";
import { houseService } from "../../../services/houseService";
import type { House } from "../../../types/house";
import type { DashboardFilters as DashboardFiltersType } from "../../../types/dashboardProcess";
import "./Filter.css";

export interface DashboardFiltersProps {
  filters: DashboardFiltersType;
  onFiltersChange: (filters: DashboardFiltersType) => void;
  onClearFilters: () => void;
  loading?: boolean;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  loading = false,
}) => {
  const [houses, setHouses] = useState<House[]>([]);
  const [localFilters, setLocalFilters] =
    useState<DashboardFiltersType>(filters);

  useEffect(() => {
    const loadHouses = async () => {
      try {
        const housesData = await houseService.getAll();
        setHouses(housesData.filter((house) => house.status === "available"));
      } catch (error) {
        console.error("Erro ao carregar casas:", error);
      }
    };
    loadHouses();
  }, []);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const updateFilter = (
    key: keyof DashboardFiltersType,
    value: string | undefined | Date
  ) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const defaultFilters: DashboardFiltersType = {
      period: "month",
      company: "all",
      houseId: undefined,
      viewMode: "consolidated",
      comparisonMode: "previous-month",
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
    const currentMonth = currentDate.getMonth();

    return [
      {
        value: "month",
        label: "Mensal",
        description: `Mes atual (${currentDate.toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        })})`,
      },
      {
        value: "quarter",
        label: "Trimestral",
        description: `Trimestre atual (Q${
          Math.floor(currentMonth / 3) + 1
        }/${currentYear}s)`,
      },
      {
        value: "year",
        label: "Anual",
        description: `Ano atual (${currentYear})`,
      },
    ];
  };

  const getCompanyOptions = () => [
    {
      value: "all",
      label: "Todas as empresas",
      icon: <FiGrid />,
    },
    {
      value: "exclusive",
      label: "Exclusive Homes",
      icon: <FiAward />,
    },
    {
      value: "giogio",
      label: "Giogio",
      icon: <FiHome />,
    },
    {
      value: "direta",
      label: "Venda Direta",
      icon: <FiEye />,
    },
  ];

  const getViewModeOptions = () => [
    {
      value: "consolidated",
      label: "Consolidado",
      description: "Soma geral de todas as casas",
      icon: <FiGrid size={20} />,
    },
    {
      value: "individual",
      label: "Individual",
      description: "Análise detalhada de uma casa específica",
      icon: <FiHome size={20} />,
    },
  ];

  const getComparisonModeOptions = () => [
    {
      value: "previous-month",
      label: "Mês Anterior",
      description: "Comparar com o mês anterior",
    },
    {
      value: "previous-year",
      label: "Ano Anterior",
      description: "Comparar com o mesmo período do ano anterior",
    },
  ];

  return (
    <div className="dashboard-filters">
      <div className="filters-header">
        <div className="filters-title">
          <FiFilter size={24} />
          <h3>Filtros do Dashboard</h3>
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

        <div className="filter-group">
          <label className="filter-label">
            <FiEdit size={16} />
            Empresa
          </label>
          <select
            value={localFilters.company}
            onChange={(e) => updateFilter("company", e.target.value)}
            className="filter-select"
            disabled={loading}
          >
            {getCompanyOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {localFilters.viewMode === "individual" && (
          <div className="filter-group">
            <label className="filter-label">
              <FiHome size={16} />
              Casa específica
            </label>
            <select
              value={localFilters.houseId || ""}
              onChange={(e) =>
                updateFilter("houseId", e.target.value || undefined)
              }
              className="filter-select"
              disabled={loading}
            >
              <option value="">Selecione uma casa</option>
              {houses.map((house) => (
                <option key={house.id} value={house.id}>
                  {house.houseName}
                </option>
              ))}
            </select>
            {!localFilters.houseId && (
              <small className="filter-warning">
                Selecione uma casa para visualizar os dados específicos
              </small>
            )}
          </div>
        )}

        <div className="filter-group">
          <label className="filter-label">
            <FiEye size={18} />
            Tipo de visualização
          </label>
          <div className="view-mode-buttons">
            {getViewModeOptions().map((option) => (
              <button
                key={option.value}
                className={`view-mode-btn ${
                  localFilters.viewMode === option.value ? "active" : ""
                }`}
                onClick={() => updateFilter("viewMode", option.value)}
                disabled={loading}
                title={option.description}
              >
                {option.icon}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">
            <FiRefreshCw size={18} />
            Comparação
          </label>
          <select
            value={localFilters.comparisonMode}
            onChange={(e) => updateFilter("comparisonMode", e.target.value)}
            className="filter-select"
            disabled={loading}
          >
            {getComparisonModeOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <small className="filter-description">
            {
              getComparisonModeOptions().find(
                (opt) => opt.value === localFilters.comparisonMode
              )?.description
            }
          </small>
        </div>
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
          <span className="filter-tag">
            Empresa:{" "}
            {
              getCompanyOptions().find(
                (opt) => opt.value === localFilters.company
              )?.label
            }
          </span>
          <span className="filter-tag">
            Tipo de visualização:{" "}
            {
              getViewModeOptions().find(
                (opt) => opt.value === localFilters.viewMode
              )?.label
            }
          </span>
          {localFilters.houseId && (
            <span className="filter-tag">
              Casa:{" "}
              {houses.find((h) => h.id === localFilters.houseId)?.houseName}
            </span>
          )}
          <span className="filter-tag">
            Comparação:{" "}
            {
              getComparisonModeOptions().find(
                (opt) => opt.value === localFilters.comparisonMode
              )?.label
            }
          </span>
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

export default DashboardFilters;

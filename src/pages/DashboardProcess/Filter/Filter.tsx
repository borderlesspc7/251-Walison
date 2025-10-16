import React, { useState, useEffect } from "react";
import {
  FiCalendar,
  FiHome,
  FiFilter,
  FiRefreshCw,
  FiX,
  FiClock,
  FiPlay,
  FiCheckCircle,
  FiXCircle,
  FiSettings,
} from "react-icons/fi";
import { houseService } from "../../../services/houseService";
import type {
  ProcessFilters,
  ProcessStatus,
  Priority,
  ProcessStep,
} from "../../../types/processDashboard";
import type { House } from "../../../types/house";
import "./Filter.css";

interface FilterProps {
  filters: ProcessFilters;
  onFiltersChange: (filters: ProcessFilters) => void;
  onClearFilters: () => void;
  loading?: boolean;
}

const Filter: React.FC<FilterProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  loading = false,
}) => {
  const [houses, setHouses] = useState<House[]>([]);
  const [housesLoading, setHousesLoading] = useState(true);

  const statusOptions: Array<{
    value: ProcessStatus;
    label: string;
    icon: React.ReactNode;
  }> = [
    { value: "pending", label: "Pendente", icon: <FiClock size={16} /> },
    { value: "in_progress", label: "Em Andamento", icon: <FiPlay size={16} /> },
    {
      value: "completed",
      label: "Completo",
      icon: <FiCheckCircle size={16} />,
    },
    { value: "cancelled", label: "Cancelado", icon: <FiXCircle size={16} /> },
  ];

  const priorityOptions: Array<{
    value: Priority;
    label: string;
    color: string;
    icon: React.ReactNode;
  }> = [
    {
      value: "low",
      label: "Baixa",
      color: "#10b981",
      icon: <FiSettings size={14} />,
    },
    {
      value: "medium",
      label: "Média",
      color: "#f59e0b",
      icon: <FiSettings size={14} />,
    },
    {
      value: "high",
      label: "Alta",
      color: "#ef4444",
      icon: <FiSettings size={14} />,
    },
    {
      value: "urgent",
      label: "Urgente",
      color: "#dc2626",
      icon: <FiSettings size={14} />,
    },
  ];

  const stepOptions: Array<{ value: ProcessStep; label: string }> = [
    { value: "menu_sent", label: "Cardápio Enviado" },
    { value: "menu_received", label: "Cardápio Recebido" },
    { value: "shopping_list", label: "Lista de Compras" },
    { value: "client_approval", label: "Aprovação do Cliente" },
    { value: "supplier_sent", label: "Enviado para Fornecedores" },
    { value: "payment_sent", label: "Notas para Pagamento" },
    { value: "invoices_received", label: "Notas Recebidas" },
    { value: "receipts_sent", label: "Comprovante Enviado" },
  ];

  useEffect(() => {
    const loadHouses = async () => {
      try {
        setHousesLoading(true);
        const housesData = await houseService.getAll();
        const activeHouses = housesData.filter(
          (house) => house.status === "available" || house.status === "occupied"
        );
        setHouses(activeHouses);
      } catch (error) {
        console.error("Erro ao carregar casas:", error);
      } finally {
        setHousesLoading(false);
      }
    };
    loadHouses();
  }, []);

  const updateFilter = <K extends keyof ProcessFilters>(
    key: K,
    value: ProcessFilters[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const updateDateFilter = (key: "start" | "end", value: Date) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [key]: value,
      },
    });
  };

  const handleClearFilters = () => {
    onClearFilters();
  };

  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  // Converter string para Date
  const parseDateFromInput = (dateString: string): Date => {
    return new Date(dateString + "T00:00:00");
  };

  const hasActiveFilters = () => {
    return (
      filters.houseId ||
      filters.status ||
      filters.priority ||
      filters.step ||
      filters.showOnlyActive ||
      filters.showOnlyOverdue
    );
  };

  return (
    <div className="process-filter">
      <div className="filter-header">
        <div className="filter-title">
          <FiFilter size={20} />
          <h3>Filtros</h3>
        </div>
        {hasActiveFilters() && (
          <button
            className="clear-filters-btn"
            onClick={handleClearFilters}
            disabled={loading}
            title="Limpar todos os filtros"
          >
            <FiX size={16} />
            Limpar
          </button>
        )}
      </div>

      <div className="filter-content">
        <div className="filter-group">
          <label className="filter-label">
            <FiCalendar size={16} />
            Período
          </label>
          <div className="date-inputs">
            <div className="date-input">
              <label>Data Inicio</label>
              <input
                type="date"
                value={formatDateForInput(filters.dateRange.start)}
                onChange={(e) =>
                  updateDateFilter("start", parseDateFromInput(e.target.value))
                }
                disabled={loading}
              />
            </div>
            <div className="date-input">
              <label>Data Fim</label>
              <input
                type="date"
                value={formatDateForInput(filters.dateRange.end)}
                onChange={(e) =>
                  updateDateFilter("end", parseDateFromInput(e.target.value))
                }
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">
            <FiHome size={16} />
            Casa
          </label>
          <select
            value={filters.houseId || ""}
            onChange={(e) =>
              onFiltersChange({ ...filters, houseId: e.target.value })
            }
            disabled={loading}
            className="filter-select"
          >
            <option value="">Todas as Casas</option>
            {houses.map((house) => (
              <option key={house.id} value={house.id}>
                {house.houseName}
              </option>
            ))}
          </select>
          {housesLoading && (
            <div className="loading-indicator">
              <FiRefreshCw className="spinning" size={16} />
              Carregando casas...
            </div>
          )}
        </div>

        <div className="filter-group">
          <label className="filter-label">Status</label>
          <div className="filter-options">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                className={`filter-option ${
                  filters.status === option.value ? "active" : ""
                }`}
                disabled={loading}
                onClick={() =>
                  updateFilter(
                    "status",
                    filters.status === option.value ? undefined : option.value
                  )
                }
                title={option.label}
              >
                <span className="option-icon">{option.icon}</span>
                <span className="option-label">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">Prioridade</label>
          <div className="filter-options">
            {priorityOptions.map((option) => (
              <button
                key={option.value}
                className={`filter-option priority-${
                  filters.priority === option.value ? "active" : ""
                }`}
                disabled={loading}
                onClick={() =>
                  updateFilter(
                    "priority",
                    filters.priority === option.value ? undefined : option.value
                  )
                }
                title={option.label}
              >
                <span className="option-icon" style={{ color: option.color }}>
                  {option.icon}
                </span>
                <span className="option-label">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">Etapa</label>
          <select
            value={filters.step || ""}
            disabled={loading}
            className="filter-select"
            onChange={(e) =>
              updateFilter("step", (e.target.value as ProcessStep) || undefined)
            }
          >
            <option value="">Todas as Etapas</option>
            {stepOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Opções</label>
          <div className="filter-checkboxes">
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={filters.showOnlyActive}
                onChange={(e) =>
                  updateFilter("showOnlyActive", e.target.checked)
                }
                disabled={loading}
              />
              <span className="checkbox-label">
                Mostrar apenas processos ativos
              </span>
            </label>
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={filters.showOnlyOverdue}
                onChange={(e) =>
                  updateFilter("showOnlyOverdue", e.target.checked)
                }
                disabled={loading}
              />
              <span className="checkbox-label">Apenas processos atrasados</span>
            </label>
          </div>
        </div>
      </div>

      {hasActiveFilters() && (
        <div className="active-filters">
          <h4>Filtros Ativos:</h4>
          <div className="active-filters-tags">
            {filters.houseId && (
              <span className="filter-tag">
                Casa:{" "}
                {houses.find((house) => house.id === filters.houseId)
                  ?.houseName || "N/A"}
                <button onClick={() => updateFilter("houseId", undefined)}>
                  <FiX size={12} />
                </button>
              </span>
            )}
            {filters.priority && (
              <span className="filter-tag">
                Prioridade:{" "}
                {
                  priorityOptions.find((p) => p.value === filters.priority)
                    ?.label
                }
                <button onClick={() => updateFilter("priority", undefined)}>
                  <FiX size={12} />
                </button>
              </span>
            )}
            {filters.step && (
              <span className="filter-tag">
                Etapa:{" "}
                {stepOptions.find((s) => s.value === filters.step)?.label}
                <button onClick={() => updateFilter("step", undefined)}>
                  <FiX size={12} />
                </button>
              </span>
            )}
            {filters.showOnlyActive && (
              <span className="filter-tag">
                Apenas ativos
                <button onClick={() => updateFilter("showOnlyActive", false)}>
                  <FiX size={12} />
                </button>
              </span>
            )}
            {filters.showOnlyOverdue && (
              <span className="filter-tag">
                Apenas atrasados
                <button onClick={() => updateFilter("showOnlyOverdue", false)}>
                  <FiX size={12} />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Filter;

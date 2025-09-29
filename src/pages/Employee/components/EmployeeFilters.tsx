import React, { useState } from "react";
import type { EmployeeFilters } from "../../../types/employee";
import InputField from "../../../components/ui/InputField/InputField";
import { SelectField } from "../../../components/ui/SelectField/SelectField";
import { Button } from "../../../components/ui/Button/Button";
import "./EmployeeFilters.css";

interface EmployeeFiltersProps {
  filters: EmployeeFilters;
  onFiltersChange: (filters: EmployeeFilters) => void;
  onClearFilters: () => void;
  employeeCount: number;
  totalCount: number;
}

export const EmployeeFiltersComponent: React.FC<EmployeeFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  employeeCount,
  totalCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof EmployeeFilters, value: string) => {
    const newFilters = {
      ...filters,
      [key]: value || undefined,
    };

    // Remove empty filters
    Object.keys(newFilters).forEach((k) => {
      if (!newFilters[k as keyof EmployeeFilters]) {
        delete newFilters[k as keyof EmployeeFilters];
      }
    });

    onFiltersChange(newFilters);
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  const statusOptions = [
    { value: "", label: "Todos os status" },
    { value: "active", label: "Ativo" },
    { value: "inactive", label: "Inativo" },
    { value: "suspended", label: "Suspenso" },
  ];

  return (
    <div className="employee-filters">
      <div className="filters-header">
        <div className="filters-info">
          <h3>Filtros</h3>
          <span className="results-count">
            {employeeCount === totalCount
              ? `${totalCount} colaboradores`
              : `${employeeCount} de ${totalCount} colaboradores`}
          </span>
        </div>
        <div className="filters-actions">
          {hasActiveFilters && (
            <Button onClick={onClearFilters} variant="secondary" size="small">
              Limpar Filtros
            </Button>
          )}
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="secondary"
            size="small"
            className="toggle-filters-btn"
          >
            {isExpanded ? "▲ Ocultar" : "▼ Expandir"}
          </Button>
        </div>
      </div>

      <div className={`filters-content ${isExpanded ? "expanded" : ""}`}>
        <div className="filters-row">
          <div className="filter-group">
            <InputField
              label="Buscar"
              placeholder="Nome do colaborador..."
              value={filters.search || ""}
              onChange={(value) => handleFilterChange("search", value)}
            />
          </div>

          <div className="filter-group">
            <SelectField
              label="Status"
              value={filters.status || ""}
              onChange={(value) => handleFilterChange("status", value)}
              options={statusOptions}
            />
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="active-filters">
          <span className="active-filters-label">Filtros ativos:</span>
          <div className="filter-tags">
            {filters.search && (
              <span className="filter-tag">
                Busca: "{filters.search}"
                <button onClick={() => handleFilterChange("search", "")}>
                  ×
                </button>
              </span>
            )}
            {filters.status && (
              <span className="filter-tag">
                Status:{" "}
                {
                  statusOptions.find((opt) => opt.value === filters.status)
                    ?.label
                }
                <button onClick={() => handleFilterChange("status", "")}>
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

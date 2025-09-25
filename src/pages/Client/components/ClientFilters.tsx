import React, { useState } from "react";
import type { ClientFilters } from "../../../types/client";
import InputField from "../../../components/ui/InputField/InputField";
import { SelectField } from "../../../components/ui/SelectField/SelectField";
import { Button } from "../../../components/ui/Button/Button";
import "./ClientFilters.css";

interface ClientFiltersProps {
  filters: ClientFilters;
  onFiltersChange: (filters: ClientFilters) => void;
  onClearFilters: () => void;
  clientCount: number;
  totalCount: number;
}

export const ClientFiltersComponent: React.FC<ClientFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  clientCount,
  totalCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof ClientFilters, value: string) => {
    const newFilters = {
      ...filters,
      [key]: value || undefined,
    };

    // Remove empty filters
    Object.keys(newFilters).forEach((k) => {
      if (!newFilters[k as keyof ClientFilters]) {
        delete newFilters[k as keyof ClientFilters];
      }
    });

    onFiltersChange(newFilters);
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  const statusOptions = [
    { value: "", label: "Todos os status" },
    { value: "active", label: "Ativo" },
    { value: "inactive", label: "Inativo" },
    { value: "prospect", label: "Prospect" },
  ];

  const maritalStatusOptions = [
    { value: "", label: "Todos os estados civis" },
    { value: "single", label: "Solteiro(a)" },
    { value: "married", label: "Casado(a)" },
    { value: "divorced", label: "Divorciado(a)" },
    { value: "widowed", label: "Viúvo(a)" },
    { value: "separated", label: "Separado(a)" },
  ];

  return (
    <div className="client-filters">
      <div className="filters-header">
        <div className="filters-info">
          <h3>Filtros</h3>
          <span className="results-count">
            {clientCount === totalCount
              ? `${totalCount} clientes`
              : `${clientCount} de ${totalCount} clientes`}
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
              placeholder="Nome, email, telefone, CPF, CNPJ..."
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

          <div className="filter-group">
            <InputField
              label="Profissão"
              placeholder="Digite a profissão"
              value={filters.profession || ""}
              onChange={(value) => handleFilterChange("profession", value)}
            />
          </div>
        </div>

        {isExpanded && (
          <div className="filters-row">
            <div className="filter-group">
              <InputField
                label="Cidade"
                placeholder="Digite a cidade"
                value={filters.city || ""}
                onChange={(value) => handleFilterChange("city", value)}
              />
            </div>

            <div className="filter-group">
              <InputField
                label="Estado"
                placeholder="Digite o estado"
                value={filters.state || ""}
                onChange={(value) => handleFilterChange("state", value)}
              />
            </div>

            <div className="filter-group">
              <SelectField
                label="Estado Civil"
                value={filters.maritalStatus || ""}
                onChange={(value) => handleFilterChange("maritalStatus", value)}
                options={maritalStatusOptions}
              />
            </div>
          </div>
        )}
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
            {filters.profession && (
              <span className="filter-tag">
                Profissão: {filters.profession}
                <button onClick={() => handleFilterChange("profession", "")}>
                  ×
                </button>
              </span>
            )}
            {filters.city && (
              <span className="filter-tag">
                Cidade: {filters.city}
                <button onClick={() => handleFilterChange("city", "")}>
                  ×
                </button>
              </span>
            )}
            {filters.state && (
              <span className="filter-tag">
                Estado: {filters.state}
                <button onClick={() => handleFilterChange("state", "")}>
                  ×
                </button>
              </span>
            )}
            {filters.maritalStatus && (
              <span className="filter-tag">
                Estado Civil:{" "}
                {
                  maritalStatusOptions.find(
                    (opt) => opt.value === filters.maritalStatus
                  )?.label
                }
                <button onClick={() => handleFilterChange("maritalStatus", "")}>
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

import React, { useState } from "react";
import type { SupplierFilters } from "../../../types/supplier";
import InputField from "../../../components/ui/InputField/InputField";
import { SelectField } from "../../../components/ui/SelectField/SelectField";
import { Button } from "../../../components/ui/Button/Button";
import "./SupplierFilters.css";

interface SupplierFiltersProps {
  filters: SupplierFilters;
  onFiltersChange: (filters: SupplierFilters) => void;
  onClearFilters: () => void;
  supplierCount: number;
  totalCount: number;
}

export const SupplierFiltersComponent: React.FC<SupplierFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  supplierCount,
  totalCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof SupplierFilters, value: string) => {
    const newFilters = {
      ...filters,
      [key]: value || undefined,
    };

    // Remove empty filters
    Object.keys(newFilters).forEach((k) => {
      if (!newFilters[k as keyof SupplierFilters]) {
        delete newFilters[k as keyof SupplierFilters];
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

  const serviceTypeOptions = [
    { value: "", label: "Todos os tipos de serviço" },
    { value: "catering", label: "Buffet/Catering" },
    { value: "decoration", label: "Decoração" },
    { value: "photography", label: "Fotografia" },
    { value: "music", label: "Música/Som" },
    { value: "transport", label: "Transporte" },
    { value: "cleaning", label: "Limpeza" },
    { value: "security", label: "Segurança" },
    { value: "flowers", label: "Flores" },
    { value: "other", label: "Outros" },
  ];

  return (
    <div className="supplier-filters">
      <div className="filters-header">
        <div className="filters-info">
          <h3>Filtros</h3>
          <span className="results-count">
            {supplierCount === totalCount
              ? `${totalCount} fornecedores`
              : `${supplierCount} de ${totalCount} fornecedores`}
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
              placeholder="Nome, tipo de serviço, banco..."
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
            <SelectField
              label="Tipo de Serviço"
              value={filters.serviceType || ""}
              onChange={(value) => handleFilterChange("serviceType", value)}
              options={serviceTypeOptions}
            />
          </div>
        </div>

        {isExpanded && (
          <div className="filters-row">
            <div className="filter-group">
              <InputField
                label="Banco"
                placeholder="Digite o banco"
                value={filters.bank || ""}
                onChange={(value) => handleFilterChange("bank", value)}
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
            {filters.serviceType && (
              <span className="filter-tag">
                Tipo:{" "}
                {
                  serviceTypeOptions.find(
                    (opt) => opt.value === filters.serviceType
                  )?.label
                }
                <button onClick={() => handleFilterChange("serviceType", "")}>
                  ×
                </button>
              </span>
            )}
            {filters.bank && (
              <span className="filter-tag">
                Banco: {filters.bank}
                <button onClick={() => handleFilterChange("bank", "")}>
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

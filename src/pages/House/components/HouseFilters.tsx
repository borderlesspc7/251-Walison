import React, { useState } from "react";
import type { Filters } from "../../../types/house";
import InputField from "../../../components/ui/InputField/InputField";
import { SelectField } from "../../../components/ui/SelectField/SelectField";
import { Button } from "../../../components/ui/Button/Button";
import "./HouseFilters.css";

interface HouseFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClearFilters: () => void;
  houseCount: number;
  totalCount: number;
}

export const HouseFilters: React.FC<HouseFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  houseCount,
  totalCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };

    Object.keys(newFilters).forEach((k) => {
      if (!newFilters[k as keyof Filters]) {
        delete newFilters[k as keyof Filters];
      }
    });

    onFiltersChange(newFilters);
  };

  const handlePriceRangeChange = (field: "min" | "max", value: string) => {
    const priceValue = parseFloat(value) || 0;

    const newPriceRange = {
      ...filters.priceRange,
      [field]: priceValue,
    };

    if (!newPriceRange.min && !newPriceRange.max) {
      const { priceRange: _, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({
        ...filters,
        priceRange: {
          min: newPriceRange.min || 0,
          max: newPriceRange.max || 0,
        },
      });
    }
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  const statusOptions = [
    { value: "", label: "Todos os status" },
    { value: "available", label: "Disponíveis" },
    { value: "occupied", label: "Ocupadas" },
    { value: "maintenance", label: "Em manutenção" },
    { value: "inactive", label: "Inativas" },
  ];

  return (
    <div className="house-filters">
      <div className="filters-header">
        <div className="filters-info">
          <h3>Filtros</h3>
          <span className="results-count">
            {houseCount === totalCount
              ? `${totalCount} casas`
              : `${houseCount} de ${totalCount} casas`}
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
              placeholder="Nome da casa, cidade, bairro, descrição..."
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
              label="Cidade"
              placeholder="Digite a cidade"
              value={filters.city || ""}
              onChange={(value) => handleFilterChange("city", value)}
            />
          </div>
        </div>

        {isExpanded && (
          <div className="filters-row">
            <div className="filter-group">
              <InputField
                label="Estado"
                placeholder="Digite o estado"
                value={filters.state || ""}
                onChange={(value) => handleFilterChange("state", value)}
              />
            </div>

            <div className="filter-group">
              <InputField
                label="Preço Mínimo (R$)"
                type="number"
                placeholder="0"
                value={filters.priceRange?.min?.toString() || ""}
                onChange={(value) => handlePriceRangeChange("min", value)}
              />
            </div>

            <div className="filter-group">
              <InputField
                label="Preço Máximo (R$)"
                type="number"
                placeholder="999999"
                value={filters.priceRange?.max?.toString() || ""}
                onChange={(value) => handlePriceRangeChange("max", value)}
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

            {filters.priceRange && (
              <span className="filter-tag">
                Preço: R$ {filters.priceRange.min} - R$ {filters.priceRange.max}
                <button onClick={() => handleFilterChange("priceRange", "")}>
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

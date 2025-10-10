import React, { useState, useEffect } from "react";
import "./FinancialFilters.css";
import { FiDownload } from "react-icons/fi";
import { houseService } from "../../../services/houseService";
import type { House } from "../../../types/house";

export interface FinancialFilterValues {
  startDate: string;
  endDate: string;
  company: "all" | "exclusive" | "giogio" | "direta";
  houseId: string;
  reportType:
    | "summary"
    | "revenue-by-house"
    | "cash-flow"
    | "contracts"
    | "breakdown"
    | "demographic"
    | "comparative"
    | "tax";
  groupBy: "day" | "month" | "quarter" | "year";
  demographicType: "house" | "gender" | "location" | "origin";
}

interface FinancialFiltersProps {
  onFilterChange: (filters: FinancialFilterValues) => void;
  onExport: (type: string) => void;
}

const FinancialFilters: React.FC<FinancialFiltersProps> = ({
  onFilterChange,
  onExport,
}) => {
  const [houses, setHouses] = useState<House[]>([]);
  const [filters, setFilters] = useState<FinancialFilterValues>({
    startDate: "",
    endDate: "",
    company: "all",
    houseId: "",
    reportType: "summary",
    groupBy: "month",
    demographicType: "house",
  });

  useEffect(() => {
    loadHouses();
  }, []);

  const loadHouses = async () => {
    try {
      const data = await houseService.getAll();
      setHouses(data);
    } catch (error) {
      console.error("Erro ao carregar casas:", error);
    }
  };

  const handleFilterChange = (
    field: keyof FinancialFilterValues,
    value: string
  ) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: FinancialFilterValues = {
      startDate: "",
      endDate: "",
      company: "all",
      houseId: "",
      reportType: "summary",
      groupBy: "month",
      demographicType: "house",
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const getExportLabel = () => {
    switch (filters.reportType) {
      case "summary":
        return "Exportar Resumo";
      case "revenue-by-house":
        return "Exportar Receitas";
      case "cash-flow":
        return "Exportar Fluxo de Caixa";
      case "contracts":
        return "Exportar Contratos";
      case "breakdown":
        return "Exportar Breakdown";
      case "demographic":
        return "Exportar Demográfico";
      case "comparative":
        return "Exportar Comparativo";
      case "tax":
        return "Exportar Impostos";
      default:
        return "Exportar Excel";
    }
  };

  return (
    <div className="financial-filters">
      <div className="filters-header">
        <h3>Filtros de Relatório</h3>
        <div className="filters-actions">
          <button
            className="btn-clear-filters"
            onClick={handleClearFilters}
            title="Limpar filtros"
          >
            Limpar Filtros
          </button>
          <button
            className="btn-export-excel"
            onClick={() => onExport(filters.reportType)}
            title="Exportar para Excel"
          >
            <FiDownload size={18} /> {getExportLabel()}
          </button>
        </div>
      </div>

      <div className="filters-grid">
        {/* Tipo de Relatório */}
        <div className="filter-group">
          <label htmlFor="reportType">Tipo de Relatório</label>
          <select
            id="reportType"
            value={filters.reportType}
            onChange={(e) => handleFilterChange("reportType", e.target.value)}
          >
            <option value="summary">Resumo Geral</option>
            <option value="revenue-by-house">Receitas por Casa</option>
            <option value="cash-flow">Fluxo de Caixa</option>
            <option value="contracts">Contratos Ativos/Concluídos</option>
            <option value="breakdown">Breakdown de Receitas</option>
            <option value="demographic">Análise Demográfica</option>
            <option value="comparative">Comparativo entre Períodos</option>
            <option value="tax">Impostos por Empresa</option>
          </select>
        </div>

        {/* Período */}
        <div className="filter-group">
          <label htmlFor="startDate">Data Início</label>
          <input
            id="startDate"
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="endDate">Data Fim</label>
          <input
            id="endDate"
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
          />
        </div>

        {/* Empresa */}
        <div className="filter-group">
          <label htmlFor="company">Empresa</label>
          <select
            id="company"
            value={filters.company}
            onChange={(e) => handleFilterChange("company", e.target.value)}
          >
            <option value="all">Todas</option>
            <option value="exclusive">Exclusive Imóveis</option>
            <option value="giogio">Gio Gio Temporadas</option>
            <option value="direta">Venda Direta</option>
          </select>
        </div>

        {/* Casa (para filtros específicos) */}
        {(filters.reportType === "revenue-by-house" ||
          filters.reportType === "summary") && (
          <div className="filter-group">
            <label htmlFor="houseId">Casa Específica (opcional)</label>
            <select
              id="houseId"
              value={filters.houseId}
              onChange={(e) => handleFilterChange("houseId", e.target.value)}
            >
              <option value="">Todas as casas</option>
              {houses.map((house) => (
                <option key={house.id} value={house.id}>
                  {house.houseName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Agrupamento (para fluxo de caixa) */}
        {filters.reportType === "cash-flow" && (
          <div className="filter-group">
            <label htmlFor="groupBy">Agrupar por</label>
            <select
              id="groupBy"
              value={filters.groupBy}
              onChange={(e) => handleFilterChange("groupBy", e.target.value)}
            >
              <option value="day">Dia</option>
              <option value="month">Mês</option>
              <option value="quarter">Trimestre</option>
              <option value="year">Ano</option>
            </select>
          </div>
        )}

        {/* Tipo demográfico */}
        {filters.reportType === "demographic" && (
          <div className="filter-group">
            <label htmlFor="demographicType">Analisar por</label>
            <select
              id="demographicType"
              value={filters.demographicType}
              onChange={(e) =>
                handleFilterChange("demographicType", e.target.value)
              }
            >
              <option value="house">Casa</option>
              <option value="gender">Gênero</option>
              <option value="location">Localidade</option>
              <option value="origin">Origem da Venda</option>
            </select>
          </div>
        )}
      </div>

      {/* Aviso para relatório comparativo */}
      {filters.reportType === "comparative" && (
        <div className="comparative-notice">
          <p>
            <strong>Relatório Comparativo:</strong> Será comparado o período
            selecionado com o período anterior de mesma duração.
          </p>
        </div>
      )}
    </div>
  );
};

export default FinancialFilters;

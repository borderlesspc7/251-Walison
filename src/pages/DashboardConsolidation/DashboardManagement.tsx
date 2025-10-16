import React, { useState, useEffect } from "react";
import "./DashboardManagement.css";
import {
  FiDownload,
  FiRefreshCw,
  FiSettings,
  FiBarChart2,
} from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import DashboardFilters from "./Filter/Filter";
import TopIndicators from "./TopIndicators/TopIndicators";
import FinancialBlock from "./FinancialBlock/FinancialBlock";
import CommercialIntelligence from "./CommercialIntelligence/CommercialIntelligence";
import { dashboardService } from "../../services/dashboardProcess";
import type {
  DashboardFilters as DashboardFiltersType,
  TopIndicators as TopIndicatorsType,
  FinancialData,
  CommercialIntelligence as CommercialIntelligenceType,
} from "../../types/dashboardConsolidation";

const DashboardManagement: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<DashboardFiltersType>({
    period: "month",
    company: "all",
    houseId: undefined,
    viewMode: "consolidated",
    comparisonMode: "previous-month",
    startDate: undefined,
    endDate: undefined,
  });

  // Estados dos dados
  const [topIndicators, setTopIndicators] = useState<TopIndicatorsType | null>(
    null
  );
  const [financialData, setFinancialData] = useState<FinancialData | null>(
    null
  );
  const [commercialData, setCommercialData] =
    useState<CommercialIntelligenceType | null>(null);

  // Carregar dados do dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [indicators, financial, commercial] = await Promise.all([
        dashboardService.getTopIndicators(filters),
        dashboardService.getFinancialData(filters),
        dashboardService.getCommercialIntelligence(filters),
      ]);

      setTopIndicators(indicators);
      setFinancialData(financial);
      setCommercialData(commercial);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando os filtros mudarem
  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Atualizar filtros
  const handleFiltersChange = (newFilters: DashboardFiltersType) => {
    setFilters(newFilters);
  };

  // Limpar filtros
  const handleClearFilters = (defaultFilters: DashboardFiltersType) => {
    setFilters(defaultFilters);
  };

  // Exportar dados
  const handleExport = async (format: "excel" | "pdf") => {
    try {
      // TODO: Implementar exportação
      console.log(`Exportando dados em formato ${format}`, {
        filters,
        topIndicators,
        financialData,
        commercialData,
      });
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
    }
  };

  // Atualizar dados
  const handleRefresh = () => {
    loadDashboardData();
  };

  return (
    <div className="dashboard-management">
      {/* Header do Dashboard */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-info">
            <h1>
              <FiBarChart2
                size={28}
                style={{ marginRight: "12px", verticalAlign: "middle" }}
              />
              Dashboard Consolidado
            </h1>
            <p className="dashboard-subtitle">
              Visão geral completa do negócio com análises em tempo real
            </p>
          </div>
          <div className="header-actions">
            <button
              className="action-btn refresh-btn"
              onClick={handleRefresh}
              disabled={loading}
            >
              <FiRefreshCw size={16} className={loading ? "spinning" : ""} />
              Atualizar
            </button>
            <div className="export-dropdown">
              <button className="action-btn export-btn">
                <FiDownload size={16} />
                Exportar
              </button>
              <div className="dropdown-menu">
                <button onClick={() => handleExport("excel")}>
                  Exportar para Excel
                </button>
                <button onClick={() => handleExport("pdf")}>
                  Exportar para PDF
                </button>
              </div>
            </div>
            <button className="action-btn settings-btn">
              <FiSettings size={16} />
              Configurações
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="dashboard-filters">
        <DashboardFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={() =>
            handleClearFilters({
              period: "month",
              company: "all",
              houseId: undefined,
              viewMode: "consolidated",
              comparisonMode: "previous-month",
              startDate: undefined,
              endDate: undefined,
            })
          }
          loading={loading}
        />
      </div>

      {/* Conteúdo Principal */}
      <div className="dashboard-content">
        {loading ? (
          <div className="dashboard-loading">
            <div className="loading-spinner"></div>
            <p>Carregando dados do dashboard...</p>
          </div>
        ) : (
          <>
            {/* Indicadores de Topo */}
            {topIndicators && (
              <div className="dashboard-section">
                <TopIndicators data={topIndicators} loading={false} />
              </div>
            )}

            {/* Bloco Financeiro */}
            {financialData && (
              <div className="dashboard-section">
                <FinancialBlock data={financialData} loading={false} />
              </div>
            )}

            {/* Inteligência Comercial */}
            {commercialData && (
              <div className="dashboard-section">
                <CommercialIntelligence data={commercialData} loading={false} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer com Informações */}
      <div className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-info">
            <span className="last-update">
              Última atualização: {new Date().toLocaleString("pt-BR")}
            </span>
            <span className="user-info">
              Logado como: {user?.email || "Usuário"}
            </span>
          </div>
          <div className="footer-stats">
            <span className="stat-item">
              <strong>Período:</strong>{" "}
              {filters.period === "month"
                ? "Mensal"
                : filters.period === "year"
                ? "Anual"
                : "Trimestral"}
            </span>
            <span className="stat-item">
              <strong>Empresa:</strong>{" "}
              {filters.company === "all" ? "Todas" : filters.company}
            </span>
            <span className="stat-item">
              <strong>Visualização:</strong>{" "}
              {filters.viewMode === "consolidated"
                ? "Consolidada"
                : "Individual"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardManagement;

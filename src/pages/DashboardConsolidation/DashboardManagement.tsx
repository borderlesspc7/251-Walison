import React, { useState, useEffect } from "react";
import "./DashboardManagement.css";
import { FiDownload, FiRefreshCw, FiSettings, FiBarChart2, FiCalendar } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import DashboardFilters from "./Filter/Filter";
import TopIndicators from "./TopIndicators/TopIndicators";
import FinancialBlock from "./FinancialBlock/FinancialBlock";
import CommercialIntelligence from "./CommercialIntelligence/CommercialIntelligence";
import { dashboardService } from "../../services/dashboardConsolidation";
import { excelExportService } from "../../services/excelExportService";
import type {
  DashboardFilters as DashboardFiltersType,
  TopIndicators as TopIndicatorsType,
  FinancialData,
  CommercialIntelligence as CommercialIntelligenceType,
} from "../../types/dashboardConsolidation";

const DashboardManagement: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
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
      if (format === "excel") {
        // Verificar se há dados para exportar
        if (!topIndicators || !financialData || !commercialData) {
          showError("Erro ao exportar", "Não há dados disponíveis para exportação");
          return;
        }

        // Gerar nome do arquivo com data
        const dateStr = new Date().toISOString().split("T")[0];
        const periodStr = filters.period === "month" ? "mensal" : "anual";
        const companyStr =
          filters.company === "all" ? "todas" : filters.company;
        const filename = `dashboard-consolidacao-${periodStr}-${companyStr}-${dateStr}.xlsx`;

        // Exportar
        excelExportService.exportDashboardConsolidation(
          topIndicators,
          financialData,
          commercialData,
          filters,
          filename
        );

        showSuccess("Exportação concluída", "Relatório exportado com sucesso!");
      } else {
        // PDF ainda não implementado
        showInfo(
          "Em desenvolvimento",
          "Exportação em PDF será implementada em breve"
        );
      }
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      showError("Erro ao exportar", "Não foi possível exportar o relatório");
    }
  };

  // Atualizar dados
  const handleRefresh = () => {
    loadDashboardData();
  };

  return (
    <div className="dashboard-management">
      {/* Header moderno unificado */}
      <div className="consolidation-dashboard-header">
        <div className="consolidation-dashboard-header-content">
          <div className="consolidation-dashboard-header-left">
            <div className="consolidation-dashboard-header-icon">
              <FiBarChart2 />
            </div>
            <div className="consolidation-dashboard-header-text">
              <h1 className="consolidation-dashboard-header-title">Dashboard Consolidado</h1>
              <p className="consolidation-dashboard-header-subtitle">Visão geral completa do negócio com análises em tempo real</p>
            </div>
          </div>
          <div className="consolidation-dashboard-header-actions">
            <div className="consolidation-dashboard-header-badge">
              <FiCalendar className="consolidation-dashboard-header-badge-icon" />
              <span>Visão {filters.viewMode === "consolidated" ? "Consolidada" : "Individual"}</span>
            </div>
            <button className="action-btn refresh-btn" onClick={handleRefresh} disabled={loading}>
              <FiRefreshCw size={16} className={loading ? "spinning" : ""} />
              Atualizar
            </button>
            <div className="export-dropdown">
              <button className="action-btn export-btn">
                <FiDownload size={16} />
                Exportar
              </button>
              <div className="dropdown-menu">
                <button onClick={() => handleExport("excel")}>Exportar para Excel</button>
                <button onClick={() => handleExport("pdf")}>Exportar para PDF</button>
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

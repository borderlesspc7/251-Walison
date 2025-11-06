import React, { useState, useEffect } from "react";
import "./DashboardStatistics.css";
import {
  FiDownload,
  FiRefreshCw,
  FiSettings,
  FiBarChart2,
  FiCalendar,
} from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import StatisticsFiltersComponent from "./Filter/Filter";
import JetpackStatsBlock from "./JetpackStatsBlock/JetpackStatsBlock";
import InstagramStatsBlock from "./InstagramStatsBlock/InstagramStatsBlock";
import { dashboardStatisticsService } from "../../services/dashboardStatistics";
import type {
  StatisticsFilters as StatisticsFiltersType,
  JetpackStats,
  InstagramStats,
} from "../../types/dashboardStatistics";

const DashboardStatistics: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<StatisticsFiltersType>({
    period: "month",
    startDate: undefined,
    endDate: undefined,
  });

  // Estados dos dados
  const [jetpackStats, setJetpackStats] = useState<JetpackStats | null>(null);
  const [instagramStats, setInstagramStats] = useState<InstagramStats | null>(
    null
  );

  // Carregar dados do dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [jetpack, instagram] = await Promise.all([
        dashboardStatisticsService.getJetpackStats(filters),
        dashboardStatisticsService.getInstagramStats(filters),
      ]);

      setJetpackStats(jetpack);
      setInstagramStats(instagram);
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
  const handleFiltersChange = (newFilters: StatisticsFiltersType) => {
    setFilters(newFilters);
  };

  // Limpar filtros
  const handleClearFilters = (defaultFilters: StatisticsFiltersType) => {
    setFilters(defaultFilters);
  };

  // Exportar dados
  const handleExport = async (format: "excel" | "pdf") => {
    try {
      // TODO: Implementar exportação
      console.log(`Exportando dados em formato ${format}`, {
        filters,
        jetpackStats,
        instagramStats,
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
    <div className="dashboard-statistics">
      {/* Header moderno unificado */}
      <div className="statistics-dashboard-header">
        <div className="statistics-dashboard-header-content">
          <div className="statistics-dashboard-header-left">
            <div className="statistics-dashboard-header-icon">
              <FiBarChart2 />
            </div>
            <div className="statistics-dashboard-header-text">
              <h1 className="statistics-dashboard-header-title">
                Sprint Dashboard - Estatísticas
              </h1>
              <p className="statistics-dashboard-header-subtitle">
                Integração com Jetpack Stats e Instagram - Análise de
                performance e tráfego pago
              </p>
            </div>
          </div>
          <div className="statistics-dashboard-header-actions">
            <div className="statistics-dashboard-header-badge">
              <FiCalendar className="statistics-dashboard-header-badge-icon" />
              <span>
                Período:{" "}
                {filters.period === "month"
                  ? "Mensal"
                  : filters.period === "year"
                  ? "Anual"
                  : "Personalizado"}
              </span>
            </div>
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
      <div className="dashboard-filters-wrapper">
        <StatisticsFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={() =>
            handleClearFilters({
              period: "month",
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
            {/* Jetpack Stats */}
            {jetpackStats && (
              <div className="dashboard-section">
                <JetpackStatsBlock data={jetpackStats} loading={false} />
              </div>
            )}

            {/* Instagram Stats */}
            {instagramStats && (
              <div className="dashboard-section">
                <InstagramStatsBlock data={instagramStats} loading={false} />
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
                : "Personalizado"}
            </span>
            <span className="stat-item">
              <strong>Fonte:</strong> Jetpack Stats + Instagram API (Mock)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStatistics;

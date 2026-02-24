import React, { useState, useEffect, useCallback } from "react";
import { FiRefreshCw, FiAlertCircle, FiActivity, FiCalendar, FiDownload } from "react-icons/fi";
import { useToast } from "../../hooks/useToast";
import Filter from "./Filter/Filter";
import TopIndicators from "./TopIndicators/TopIndicators";
import ProcessBlock from "./ProcessBlock/ProcessBlock";
import * as processDashboardService from "../../services/processDashboardService";
import { excelExportService } from "../../services/excelExportService";
import type {
  ProcessDashboardData,
  ProcessFilters,
} from "../../types/processDashboard";
import "./DashboardManagement.css";

const DashboardManagement: React.FC = () => {
  const { showSuccess, showError, showInfo } = useToast();
  const [filters, setFilters] = useState<ProcessFilters>({
    dateRange: {
      start: new Date(new Date().setDate(1)), // Primeiro dia do mês
      end: new Date(new Date().setMonth(new Date().getMonth() + 1, 0)), // Último dia do mês
    },
    showOnlyActive: false,
    showOnlyOverdue: false,
  });

  const [dashboardData, setDashboardData] =
    useState<ProcessDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Função para buscar dados do dashboard
  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      const [reservations, processes, notifications] = await Promise.all([
        processDashboardService.getFutureReservations(filters),
        processDashboardService.getConciergeProcesses(filters),
        processDashboardService.getNotifications(filters),
      ]);

      const metrics = processDashboardService.calculateProcessMetrics(
        reservations,
        processes
      );
      const charts = processDashboardService.generateChartsData(
        reservations,
        processes
      );

      const data: ProcessDashboardData = {
        reservations,
        conciergeProcesses: processes,
        notifications,
        metrics,
        charts,
      };

      setDashboardData(data);
    } catch (err) {
      console.error("Erro ao buscar dados do dashboard:", err);
      setError(
        "Erro ao carregar dados do dashboard. Por favor, tente novamente."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  // Buscar dados ao montar e quando filtros mudarem
  useEffect(() => {
    setLoading(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Função para atualizar filtros
  const handleFilterChange = (newFilters: ProcessFilters) => {
    setFilters(newFilters);
  };

  // Função para refresh manual
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Função para exportar
  const handleExport = async (format: "excel" | "pdf") => {
    try {
      if (format === "excel") {
        // Verificar se há dados para exportar
        if (!dashboardData) {
          showError("Erro ao exportar", "Não há dados disponíveis para exportação");
          return;
        }

        // Gerar nome do arquivo com data
        const dateStr = new Date().toISOString().split("T")[0];
        const filename = `dashboard-processos-${dateStr}.xlsx`;

        // Exportar
        excelExportService.exportDashboardProcesses(
          dashboardData,
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

  return (
    <div className="dashboard-management">
      {/* Header moderno unificado */}
      <div className="process-dashboard-header">
        <div className="process-dashboard-header-content">
          <div className="process-dashboard-header-left">
            <div className="process-dashboard-header-icon">
              <FiActivity />
            </div>
            <div className="process-dashboard-header-text">
              <h1 className="process-dashboard-header-title">Dashboard de Processos</h1>
              <p className="process-dashboard-header-subtitle">
                Acompanhe reservas futuras e processos de concierge em tempo real
              </p>
            </div>
          </div>
          <div className="process-dashboard-header-actions">
            <div className="process-dashboard-header-badge">
              <FiCalendar className="process-dashboard-header-badge-icon" />
              <span>Período atual</span>
            </div>
            <button
              className="process-dashboard-refresh-btn"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <FiRefreshCw size={18} className={refreshing ? "spinning" : ""} />
              {refreshing ? "Atualizando..." : "Atualizar"}
            </button>
            <div className="export-dropdown">
              <button
                className="action-btn export-btn"
                onClick={() => handleExport("excel")}
                disabled={loading || !dashboardData}
              >
                <FiDownload size={16} />
                Exportar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Filter
        filters={filters}
        onFiltersChange={handleFilterChange}
        onClearFilters={() =>
          setFilters({
            dateRange: {
              start: new Date(new Date().setDate(1)),
              end: new Date(new Date().setMonth(new Date().getMonth() + 1, 0)),
            },
            showOnlyActive: false,
            showOnlyOverdue: false,
          })
        }
      />

      {/* Mensagem de erro */}
      {error && (
        <div className="error-banner">
          <FiAlertCircle size={20} />
          <span>{error}</span>
          <button onClick={handleRefresh}>Tentar novamente</button>
        </div>
      )}

      {/* Conteúdo do Dashboard */}
      <div className="dashboard-content">
        {/* Indicadores principais */}
        <TopIndicators metrics={dashboardData?.metrics} loading={loading} />

        {/* Bloco de Processos */}
        <ProcessBlock
          processes={dashboardData?.conciergeProcesses || []}
          loading={loading}
          onRefresh={handleRefresh}
        />

        {/* Seção de Reservas Futuras */}
        <div className="reservations-block">
          <div className="block-header">
            <h2>Próximas Reservas</h2>
            <span className="reservation-count">
              {dashboardData?.reservations.length || 0} reserva(s)
            </span>
          </div>

          {loading ? (
            <div className="reservations-list">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="reservation-card loading">
                  <div className="skeleton-content"></div>
                </div>
              ))}
            </div>
          ) : dashboardData && dashboardData.reservations.length > 0 ? (
            <div className="reservations-list">
              {dashboardData.reservations.map((reservation) => {
                const checkInDate = new Date(reservation.checkIn);
                const checkOutDate = new Date(reservation.checkOut);
                const daysUntil = Math.ceil(
                  (checkInDate.getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                );
                const isUrgent = daysUntil <= 10;

                return (
                  <div
                    key={reservation.id}
                    className={`reservation-card ${isUrgent ? "urgent" : ""}`}
                  >
                    <div className="reservation-info">
                      <div className="client-details">
                        <h3>{reservation.clientName}</h3>
                        <p className="house-name">{reservation.houseName}</p>
                      </div>

                      <div className="date-details">
                        <div className="date-row">
                          <span className="date-label">Check-in:</span>
                          <span className="date-value">
                            {checkInDate.toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        <div className="date-row">
                          <span className="date-label">Check-out:</span>
                          <span className="date-value">
                            {checkOutDate.toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>

                      <div className="reservation-meta">
                        <span className="total-days">
                          {reservation.totalDays} diária(s)
                        </span>
                        {isUrgent && (
                          <span className="urgent-badge">
                            {daysUntil} dia(s) restante(s)
                          </span>
                        )}
                        {reservation.conciergeRequired && (
                          <span className="concierge-badge">
                            Concierge necessário
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="reservation-status">
                      <span className={`status-badge ${reservation.status}`}>
                        {reservation.status === "confirmed"
                          ? "Confirmado"
                          : reservation.status === "pending"
                          ? "Pendente"
                          : "Cancelado"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <p>
                Nenhuma reserva futura encontrada para os filtros selecionados.
              </p>
            </div>
          )}
        </div>

        {/* Seção de Notificações */}
        {dashboardData && dashboardData.notifications.length > 0 && (
          <div className="notifications-block">
            <div className="block-header">
              <h2>Notificações</h2>
              <span className="notification-count">
                {dashboardData.notifications.filter((n) => !n.isRead).length}{" "}
                não lida(s)
              </span>
            </div>

            <div className="notifications-list">
              {dashboardData.notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-card ${
                    notification.isRead ? "read" : "unread"
                  } ${notification.priority}`}
                >
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span className="notification-date">
                      {new Date(notification.createdAt).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  {!notification.isRead && (
                    <div className="unread-indicator"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardManagement;

import React, { useState, useEffect, useCallback } from "react";
import { FiAlertCircle, FiTarget, FiCalendar, FiDownload } from "react-icons/fi";
import { GoalsFilters } from "./GoalsFilters/GoalsFilters";
import { SalesThermometer } from "./SalesThermometer/SalesThermometer";
import { MonthlyGoalsChart } from "./MonthlyGoalsChart/MonthlyGoalsChart";
import { CategoryBreakdown } from "./CategoryBreakdown/CategoryBreakdown";
import type {
  GoalFilters,
  GoalsDashboardData,
  GoalCategory,
} from "../../types/dashboardGoals";
import * as goalsDashboardService from "../../services/goalsDashboardService";
import { useToast } from "../../hooks/useToast";
import { excelExportService } from "../../services/excelExportService";
import "./DashboardGoals.css";

export const DashboardGoals: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const [filters, setFilters] = useState<GoalFilters>({
    year: currentYear,
    period: "annual",
    categories: [
      "rental_sales",
      "contracts_quantity",
      "supplier_commission",
      "concierge",
      "house_sales",
    ],
  });

  const [dashboardData, setDashboardData] = useState<GoalsDashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await goalsDashboardService.getGoalsDashboardData(filters);
      setDashboardData(data);
    } catch (err) {
      console.error("Erro ao carregar dados do dashboard:", err);
      setError(
        "Erro ao carregar dados do dashboard. Por favor, tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleFiltersChange = (newFilters: GoalFilters) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const handleExport = async () => {
    if (!dashboardData) {
      showError("Exportação", "Não há dados disponíveis para exportar.");
      return;
    }

    try {
      const now = new Date();
      const dateStr = now.toLocaleDateString("pt-BR").replace(/\//g, "-");
      const filename = `dashboard-metas-${filters.year}-${dateStr}.xlsx`;

      excelExportService.exportDashboardGoals(
        dashboardData,
        filters,
        filename
      );

      showSuccess("Exportação Concluída", "Dashboard exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar dashboard:", error);
      showError(
        "Erro na Exportação",
        "Não foi possível exportar o dashboard. Tente novamente."
      );
    }
  };

  const getFilteredMonthlyData = () => {
    if (!dashboardData?.chartsData.monthlyTrend) return [];

    let filtered = [...dashboardData.chartsData.monthlyTrend];
    if (filters.period === "monthly" && filters.startMonth) {
      filtered = filtered.filter((item) => {
        const monthNumber = getMonthNumber(item.month);
        return monthNumber === filters.startMonth;
      });
    } else if (
      filters.period === "quarterly" &&
      filters.startMonth &&
      filters.endMonth
    ) {
      filtered = filtered.filter((item) => {
        const monthNumber = getMonthNumber(item.month);
        return (
          monthNumber >= filters.startMonth! && monthNumber <= filters.endMonth!
        );
      });
    }

    return filtered;
  };

  const getMonthNumber = (monthName: string): number => {
    const months: Record<string, number> = {
      janeiro: 1,
      fevereiro: 2,
      março: 3,
      abril: 4,
      maio: 5,
      junho: 6,
      julho: 7,
      agosto: 8,
      setembro: 9,
      outubro: 10,
      novembro: 11,
      dezembro: 12,
    };
    return months[monthName.toLowerCase()] || 1;
  };

  const getFilteredCategoryData = () => {
    if (!dashboardData?.chartsData.categoryComparison) return [];

    return dashboardData.chartsData.categoryComparison.filter((item) => {
      const categoryKey = item.category
        .toLowerCase()
        .replace(/\s+/g, "_") as unknown as GoalCategory;
      return filters.categories.includes(categoryKey);
    });
  };

  return (
    <div className="goals-dashboard-container">
      {/* Header Profissional */}
      <div className="goals-dashboard-header">
        <div className="goals-dashboard-header-content">
          <div className="goals-dashboard-header-left">
            <div className="goals-dashboard-header-icon">
              <FiTarget />
            </div>
            <div className="goals-dashboard-header-text">
              <h1 className="goals-dashboard-header-title">
                Dashboard de Metas
              </h1>
              <p className="goals-dashboard-header-subtitle">
                Acompanhe o desempenho das metas e objetivos da empresa
              </p>
            </div>
          </div>
          <div className="goals-dashboard-header-right">
            <button
              className="export-btn"
              onClick={handleExport}
              disabled={isLoading || !dashboardData}
              title="Exportar para Excel"
            >
              <FiDownload />
              <span>Exportar</span>
            </button>
            <div className="goals-dashboard-header-badge">
              <FiCalendar className="goals-dashboard-header-badge-icon" />
              <span>Ano {filters.year}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <GoalsFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onRefresh={handleRefresh}
        loading={isLoading}
      />

      {/* Mensagem de Erro */}
      {error && (
        <div className="goals-dashboard-error">
          <FiAlertCircle className="goals-dashboard-error-icon" />
          <span>{error}</span>
        </div>
      )}

      {/* Conteúdo do Dashboard */}
      {!error && (
        <div className="goals-dashboard-content">
          <section className="goals-dashboard-section">
            <SalesThermometer
              data={
                dashboardData?.annualThermometer || {
                  year: filters.year,
                  totalGoal: 0,
                  totalAchieved: 0,
                  percentage: 0,
                  status: "below_target",
                  categories: [],
                }
              }
              isLoading={isLoading}
            />
          </section>

          <section className="goals-dashboard-section">
            <MonthlyGoalsChart
              data={getFilteredMonthlyData()}
              isLoading={isLoading}
            />
          </section>

          <section className="goals-dashboard-section">
            <CategoryBreakdown
              data={getFilteredCategoryData()}
              isLoading={isLoading}
            />
          </section>
        </div>
      )}

      {/* Empty State */}
      {!isLoading &&
        !error &&
        dashboardData &&
        dashboardData.annualThermometer.totalGoal === 0 && (
          <div className="goals-dashboard-empty">
            <FiTarget className="goals-dashboard-empty-icon" />
            <h3 className="goals-dashboard-empty-title">
              Nenhuma Meta Cadastrada
            </h3>
            <p className="goals-dashboard-empty-text">
              Para visualizar o Dashboard de Metas, é necessário cadastrar as
              metas anuais do ano {filters.year}. Configure as metas de vendas,
              contratos, comissões e concierge para acompanhar o desempenho da
              empresa.
            </p>
          </div>
        )}
    </div>
  );
};

import { saleService } from "./saleService";
import type { Sale } from "../types/sale";
import type {
  DashboardFilters,
  TopIndicators,
  FinancialData,
  CommercialIntelligence,
  MediaAnalysis,
  GenderAnalysis,
  OccupancyRateData,
  ContributionMarginByHouse,
  ChartDataPoint,
  QuickStats,
} from "../types/dashboardProcess";

// ===== FUNÇÕES AUXILIARES =====

// Calcular variação percentual
const calculateVariation = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Obter período anterior
const getPreviousPeriod = (
  startDate: Date,
  endDate: Date
): { start: Date; end: Date } => {
  const duration = endDate.getTime() - startDate.getTime();
  const previousEnd = new Date(startDate.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - duration);

  return { start: previousStart, end: previousEnd };
};

// Agrupar vendas por período
const groupSalesByPeriod = (
  sales: Sale[],
  groupBy: "day" | "month" | "quarter" | "year"
): Map<string, Sale[]> => {
  const groups = new Map<string, Sale[]>();

  sales.forEach((sale) => {
    let key: string;
    const date = sale.checkInDate;

    switch (groupBy) {
      case "day":
        key = date.toISOString().split("T")[0];
        break;
      case "month":
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
        break;
      case "quarter": {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        key = `${date.getFullYear()}-Q${quarter}`;
        break;
      }
      case "year":
        key = date.getFullYear().toString();
        break;
      default:
        key = date.toISOString().split("T")[0];
    }

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(sale);
  });

  return groups;
};

// ===== SERVICE PRINCIPAL =====

export const dashboardService = {
  // ===== INDICADORES DE TOPO =====
  async getTopIndicators(filters: DashboardFilters): Promise<TopIndicators> {
    try {
      // Buscar todas as vendas
      const allSales = await saleService.getAll();

      // Filtrar vendas por período
      let filteredSales = this.filterSalesByPeriod(allSales, filters);

      // Filtrar por empresa se especificado
      if (filters.company !== "all") {
        filteredSales = filteredSales.filter(
          (sale) => sale.company === filters.company
        );
      }

      // Filtrar por casa se especificado
      if (filters.houseId) {
        filteredSales = filteredSales.filter(
          (sale) => sale.houseId === filters.houseId
        );
      }

      // Obter período anterior para comparação
      const currentStartDate = filters.startDate
        ? new Date(filters.startDate)
        : new Date();
      const currentEndDate = filters.endDate
        ? new Date(filters.endDate)
        : new Date();

      const previousPeriod = getPreviousPeriod(
        currentStartDate,
        currentEndDate
      );

      const previousSales = this.filterSalesByPeriod(allSales, {
        ...filters,
        startDate: previousPeriod.start.toISOString(),
        endDate: previousPeriod.end.toISOString(),
      });

      // Calcular contratos ativos
      const activeContracts = filteredSales.filter(
        (sale) => sale.status === "confirmed" || sale.status === "pending"
      ).length;

      const previousActiveContracts = previousSales.filter(
        (sale) => sale.status === "confirmed" || sale.status === "pending"
      ).length;

      // Calcular reservas futuras
      const futureReservations = filteredSales
        .filter(
          (sale) => sale.checkInDate > new Date() && sale.status !== "cancelled"
        )
        .map((sale) => ({
          id: sale.id,
          clientName: sale.clientName,
          houseName: sale.houseName,
          checkInDate: sale.checkInDate,
          checkOutDate: sale.checkOutDate,
          numberOfNights: sale.numberOfNights,
          contractValue: sale.contractValue,
        }))
        .sort((a, b) => a.checkInDate.getTime() - b.checkInDate.getTime());

      // Calcular diárias fechadas
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const monthlySales = filteredSales.filter(
        (sale) =>
          sale.checkInDate.getMonth() === currentMonth &&
          sale.checkInDate.getFullYear() === currentYear
      );

      const yearlySales = filteredSales.filter(
        (sale) => sale.checkInDate.getFullYear() === currentYear
      );

      const totalDailyRatesMonth = monthlySales.reduce(
        (sum, sale) => sum + sale.netValue,
        0
      );
      const totalDailyRatesYear = yearlySales.reduce(
        (sum, sale) => sum + sale.netValue,
        0
      );

      // Calcular contratos fechados
      const closedContractsMonth = monthlySales.filter(
        (sale) => sale.status === "completed"
      ).length;
      const closedContractsYear = yearlySales.filter(
        (sale) => sale.status === "completed"
      ).length;

      // Calcular ticket médio
      const totalRevenue = filteredSales.reduce(
        (sum, sale) => sum + sale.totalRevenue,
        0
      );
      const averageTicket =
        filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;

      return {
        activeContracts: {
          count: activeContracts,
          variation: calculateVariation(
            activeContracts,
            previousActiveContracts
          ),
        },
        futureReservations: {
          count: futureReservations.length,
          reservations: futureReservations.slice(0, 10), // Apenas as 10 próximas
        },
        totalDailyRates: {
          month: {
            value: totalDailyRatesMonth,
            variation: 0, // Calcular com dados do mês anterior
          },
          year: {
            value: totalDailyRatesYear,
            variation: 0, // Calcular com dados do ano anterior
          },
        },
        totalContracts: {
          month: {
            count: closedContractsMonth,
            variation: 0,
          },
          year: {
            count: closedContractsYear,
            variation: 0,
          },
        },
        averageTicket: {
          byHouse: averageTicket,
          bySupplier: 0, // Implementar lógica específica
          byConcierge: 0, // Implementar lógica específica
          total: averageTicket,
        },
      };
    } catch (error) {
      console.error("Erro ao buscar indicadores de topo:", error);
      throw new Error("Falha ao carregar indicadores de topo");
    }
  },

  // ===== DADOS FINANCEIROS =====
  async getFinancialData(filters: DashboardFilters): Promise<FinancialData> {
    try {
      const allSales = await saleService.getAll();
      let filteredSales = this.filterSalesByPeriod(allSales, filters);

      // Filtrar por empresa e casa
      if (filters.company !== "all") {
        filteredSales = filteredSales.filter(
          (sale) => sale.company === filters.company
        );
      }
      if (filters.houseId) {
        filteredSales = filteredSales.filter(
          (sale) => sale.houseId === filters.houseId
        );
      }

      // Calcular vendas totais
      const totalSales = filteredSales.reduce(
        (sum, sale) => sum + sale.totalRevenue,
        0
      );

      // Calcular comissões totais
      const totalCommissions = filteredSales.reduce(
        (sum, sale) => sum + sale.salesCommission + sale.totalAdditionalSales,
        0
      );

      // Calcular comissões de fornecedores
      const supplierCommissions = filteredSales.reduce(
        (sum, sale) => sum + sale.totalAdditionalSales,
        0
      );

      // Calcular concierge
      const concierge = filteredSales.reduce(
        (sum, sale) => sum + sale.conciergeValue,
        0
      );

      // Calcular pagamentos a governantas
      const housekeeperPayments = filteredSales.reduce(
        (sum, sale) => sum + sale.housekeeperValue,
        0
      );

      // Calcular margem de contribuição por casa
      const marginByHouse = await this.calculateContributionMarginByHouse(
        filteredSales
      );

      // Gerar dados para gráficos
      const salesChartData = this.generateChartData(
        filteredSales,
        "totalRevenue"
      );
      const commissionsChartData = this.generateChartData(
        filteredSales,
        "salesCommission"
      );

      return {
        totalSales: {
          current: totalSales,
          previous: 0, // Calcular com período anterior
          variation: 0,
          chartData: salesChartData,
        },
        totalCommissions: {
          current: totalCommissions,
          previous: 0,
          variation: 0,
          chartData: commissionsChartData,
        },
        supplierCommissions: {
          current: supplierCommissions,
          previous: 0,
          variation: 0,
        },
        concierge: {
          current: concierge,
          previous: 0,
          variation: 0,
        },
        housekeeperPayments: {
          current: housekeeperPayments,
          previous: 0,
          variation: 0,
        },
        contributionMargin: {
          byHouse: marginByHouse,
          total: {
            current: marginByHouse.reduce(
              (sum, house) => sum + house.margin,
              0
            ),
            previous: 0,
            variation: 0,
          },
        },
      };
    } catch (error) {
      console.error("Erro ao buscar dados financeiros:", error);
      throw new Error("Falha ao carregar dados financeiros");
    }
  },

  // ===== INTELIGÊNCIA COMERCIAL =====
  async getCommercialIntelligence(
    filters: DashboardFilters
  ): Promise<CommercialIntelligence> {
    try {
      const allSales = await saleService.getAll();
      let filteredSales = this.filterSalesByPeriod(allSales, filters);

      // Filtrar por empresa e casa
      if (filters.company !== "all") {
        filteredSales = filteredSales.filter(
          (sale) => sale.company === filters.company
        );
      }
      if (filters.houseId) {
        filteredSales = filteredSales.filter(
          (sale) => sale.houseId === filters.houseId
        );
      }

      // Análise por mídia
      const salesByMedia = this.analyzeSalesByMedia(filteredSales);

      // Análise por gênero
      const salesByGender = this.analyzeSalesByGender(filteredSales);

      // Taxa de ocupação
      const occupancyRate = await this.calculateOccupancyRate();

      return {
        salesByMedia,
        salesByGender,
        occupancyRate,
      };
    } catch (error) {
      console.error("Erro ao buscar inteligência comercial:", error);
      throw new Error("Falha ao carregar inteligência comercial");
    }
  },

  // ===== FUNÇÕES AUXILIARES INTERNAS =====

  // Filtrar vendas por período
  filterSalesByPeriod(sales: Sale[], filters: DashboardFilters): Sale[] {
    if (!filters.startDate && !filters.endDate) return sales;

    return sales.filter((sale) => {
      const saleDate = sale.checkInDate;
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;

      if (startDate && saleDate < startDate) return false;
      if (endDate && saleDate > endDate) return false;
      return true;
    });
  },

  // Calcular margem de contribuição por casa
  async calculateContributionMarginByHouse(
    sales: Sale[]
  ): Promise<ContributionMarginByHouse[]> {
    const houseMap = new Map<string, Sale[]>();

    // Agrupar vendas por casa
    sales.forEach((sale) => {
      if (!houseMap.has(sale.houseId)) {
        houseMap.set(sale.houseId, []);
      }
      houseMap.get(sale.houseId)!.push(sale);
    });

    const margins: ContributionMarginByHouse[] = [];

    for (const [houseId, houseSales] of houseMap) {
      const totalRevenue = houseSales.reduce(
        (sum, sale) => sum + sale.totalRevenue,
        0
      );
      const totalCosts = houseSales.reduce(
        (sum, sale) =>
          sum +
          sale.salesCommission +
          sale.housekeeperValue +
          sale.totalAdditionalSales,
        0
      );
      const margin = totalRevenue - totalCosts;
      const marginPercentage =
        totalRevenue > 0 ? (margin / totalRevenue) * 100 : 0;

      margins.push({
        houseId,
        houseName: houseSales[0].houseName,
        totalRevenue,
        totalCosts,
        margin,
        marginPercentage,
      });
    }

    return margins.sort((a, b) => b.margin - a.margin);
  },

  // Gerar dados para gráficos
  generateChartData(sales: Sale[], metric: keyof Sale): ChartDataPoint[] {
    const groups = groupSalesByPeriod(sales, "month");
    const chartData: ChartDataPoint[] = [];

    groups.forEach((salesGroup, period) => {
      const value = salesGroup.reduce((sum, sale) => {
        const saleValue = sale[metric] as number;
        return sum + (saleValue || 0);
      }, 0);

      chartData.push({
        period,
        value,
        label: this.formatPeriodLabel(period, "month"),
      });
    });

    return chartData.sort((a, b) => a.period.localeCompare(b.period));
  },

  // Analisar vendas por mídia
  analyzeSalesByMedia(sales: Sale[]): MediaAnalysis[] {
    const mediaMap = new Map<string, { count: number; revenue: number }>();
    const totalSales = sales.length;

    sales.forEach((sale) => {
      const source = sale.saleOrigin;
      if (!mediaMap.has(source)) {
        mediaMap.set(source, { count: 0, revenue: 0 });
      }
      const data = mediaMap.get(source)!;
      data.count++;
      data.revenue += sale.totalRevenue;
    });

    const analysis: MediaAnalysis[] = [];
    const sourceLabels: Record<string, string> = {
      instagram: "Instagram",
      facebook: "Facebook",
      google: "Google",
      indicacao: "Indicação",
      whatsapp: "WhatsApp",
      site: "Site",
      outros: "Outros",
    };

    mediaMap.forEach((data, source) => {
      analysis.push({
        source: source as
          | "instagram"
          | "facebook"
          | "google"
          | "indicacao"
          | "whatsapp"
          | "site"
          | "outros",
        sourceLabel: sourceLabels[source] || source,
        count: data.count,
        percentage: totalSales > 0 ? (data.count / totalSales) * 100 : 0,
        revenue: data.revenue,
      });
    });

    return analysis.sort((a, b) => b.count - a.count);
  },

  // Analisar vendas por gênero
  analyzeSalesByGender(sales: Sale[]): GenderAnalysis[] {
    const genderMap = new Map<string, { count: number; revenue: number }>();
    const totalSales = sales.length;

    sales.forEach((sale) => {
      const gender = sale.clientGender || "not_informed";
      if (!genderMap.has(gender)) {
        genderMap.set(gender, { count: 0, revenue: 0 });
      }
      const data = genderMap.get(gender)!;
      data.count++;
      data.revenue += sale.totalRevenue;
    });

    const analysis: GenderAnalysis[] = [];
    const genderLabels: Record<string, string> = {
      male: "Masculino",
      female: "Feminino",
      other: "Outro",
      not_informed: "Não informado",
    };

    genderMap.forEach((data, gender) => {
      analysis.push({
        gender: gender as "male" | "female" | "other" | "not_informed",
        genderLabel: genderLabels[gender] || gender,
        count: data.count,
        percentage: totalSales > 0 ? (data.count / totalSales) * 100 : 0,
        revenue: data.revenue,
      });
    });

    return analysis.sort((a, b) => b.count - a.count);
  },

  // Calcular taxa de ocupação
  async calculateOccupancyRate(): Promise<OccupancyRateData[]> {
    // Esta função precisa de lógica mais complexa
    // Por enquanto, retornamos dados mock
    const months = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];

    return months.map((month, index) => ({
      month,
      monthNumber: index + 1,
      year: new Date().getFullYear(),
      totalDays: 30, // Simplificado
      occupiedDays: Math.floor(Math.random() * 30),
      rate: Math.floor(Math.random() * 100),
      revenue: Math.floor(Math.random() * 50000),
    }));
  },

  // Formatar label do período
  formatPeriodLabel(period: string, type: string): string {
    if (type === "month") {
      const [year, month] = period.split("-");
      const monthNames = [
        "Jan",
        "Fev",
        "Mar",
        "Abr",
        "Mai",
        "Jun",
        "Jul",
        "Ago",
        "Set",
        "Out",
        "Nov",
        "Dez",
      ];
      return `${monthNames[parseInt(month) - 1]}/${year}`;
    }
    return period;
  },

  // Obter estatísticas rápidas
  async getQuickStats(filters: DashboardFilters): Promise<QuickStats> {
    const allSales = await saleService.getAll();
    const filteredSales = this.filterSalesByPeriod(allSales, filters);

    const totalRevenue = filteredSales.reduce(
      (sum, sale) => sum + sale.totalRevenue,
      0
    );
    const totalContracts = filteredSales.length;
    const averageTicket =
      totalContracts > 0 ? totalRevenue / totalContracts : 0;

    // Encontrar casa com melhor performance
    const housePerformance = new Map<string, number>();
    filteredSales.forEach((sale) => {
      const current = housePerformance.get(sale.houseId) || 0;
      housePerformance.set(sale.houseId, current + sale.totalRevenue);
    });

    const topHouse = Array.from(housePerformance.entries()).sort(
      (a, b) => b[1] - a[1]
    )[0];

    // Encontrar mídia com melhor performance
    const mediaPerformance = new Map<string, number>();
    filteredSales.forEach((sale) => {
      const current = mediaPerformance.get(sale.saleOrigin) || 0;
      mediaPerformance.set(sale.saleOrigin, current + 1);
    });

    const topMedia = Array.from(mediaPerformance.entries()).sort(
      (a, b) => b[1] - a[1]
    )[0];

    return {
      totalRevenue,
      totalContracts,
      averageTicket,
      occupancyRate: 0, // Implementar cálculo real
      topPerformingHouse: topHouse ? topHouse[0] : "",
      topMediaSource: topMedia ? topMedia[0] : "",
    };
  },
};

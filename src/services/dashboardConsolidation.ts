import { saleService } from "./saleService";
import { clientService } from "./clientService";
import { houseService } from "./houseService";
import type { Sale } from "../types/sale";
import type {
  DashboardFilters,
  TopIndicators,
  FinancialData,
  CommercialIntelligence,
  MediaAnalysis,
  GenderAnalysis,
  OccupancyRateData,
  HouseRentalStat,
  SeasonalityStat,
  ClientOriginStat,
  ClientReturnStats,
  GuestStats,
  SupplierSpendPerGuest,
  AverageTicketByHouse,
  AverageTicketByClient,
  RevenueComparison,
  ContributionMarginByHouse,
  ChartDataPoint,
  QuickStats,
} from "../types/dashboardConsolidation";

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

const resolvePeriodRange = (
  filters: DashboardFilters
): { start: Date; end: Date } => {
  if (filters.startDate && filters.endDate) {
    return {
      start: new Date(filters.startDate),
      end: new Date(filters.endDate),
    };
  }

  const now = new Date();
  if (filters.period === "year") {
    return {
      start: new Date(now.getFullYear(), 0, 1),
      end: new Date(now.getFullYear(), 11, 31, 23, 59, 59),
    };
  }

  if (filters.period === "quarter") {
    const quarter = Math.floor(now.getMonth() / 3);
    const startMonth = quarter * 3;
    const endMonth = startMonth + 2;
    return {
      start: new Date(now.getFullYear(), startMonth, 1),
      end: new Date(now.getFullYear(), endMonth + 1, 0, 23, 59, 59),
    };
  }

  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
  };
};

const getMonthRange = (year: number, month: number) => {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);
  return { start, end };
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

export const dashboardService = {
  async getTopIndicators(filters: DashboardFilters): Promise<TopIndicators> {
    try {
      const allSales = await saleService.getAll();

      const applyCompanyAndHouse = (sales: Sale[]) => {
        let result = [...sales];
        if (filters.company !== "all") {
          result = result.filter((sale) => sale.company === filters.company);
        }
        if (filters.houseId) {
          result = result.filter((sale) => sale.houseId === filters.houseId);
        }
        return result;
      };

      const filteredSales = applyCompanyAndHouse(
        this.filterSalesByPeriod(allSales, filters)
      );

      const currentRange = resolvePeriodRange(filters);
      const previousPeriod = getPreviousPeriod(
        currentRange.start,
        currentRange.end
      );

      const previousSales = applyCompanyAndHouse(
        this.filterSalesByPeriod(allSales, {
          ...filters,
          startDate: previousPeriod.start.toISOString(),
          endDate: previousPeriod.end.toISOString(),
        })
      );

      const activeContracts = filteredSales.filter(
        (sale) => sale.status === "confirmed" || sale.status === "pending"
      ).length;

      const previousActiveContracts = previousSales.filter(
        (sale) => sale.status === "confirmed" || sale.status === "pending"
      ).length;

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

      const now = new Date();
      const currentMonthRange = getMonthRange(now.getFullYear(), now.getMonth());
      const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const previousMonthRange = getMonthRange(
        previousMonthDate.getFullYear(),
        previousMonthDate.getMonth()
      );

      const currentYearRange = {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now.getFullYear(), 11, 31, 23, 59, 59),
      };
      const previousYearRange = {
        start: new Date(now.getFullYear() - 1, 0, 1),
        end: new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59),
      };

      const companyHouseSales = applyCompanyAndHouse(allSales);

      const monthlySales = companyHouseSales.filter(
        (sale) =>
          sale.checkInDate >= currentMonthRange.start &&
          sale.checkInDate <= currentMonthRange.end
      );
      const previousMonthlySales = companyHouseSales.filter(
        (sale) =>
          sale.checkInDate >= previousMonthRange.start &&
          sale.checkInDate <= previousMonthRange.end
      );

      const yearlySales = companyHouseSales.filter(
        (sale) =>
          sale.checkInDate >= currentYearRange.start &&
          sale.checkInDate <= currentYearRange.end
      );
      const previousYearlySales = companyHouseSales.filter(
        (sale) =>
          sale.checkInDate >= previousYearRange.start &&
          sale.checkInDate <= previousYearRange.end
      );

      const totalDailyRatesMonth = monthlySales.reduce(
        (sum, sale) => sum + sale.netValue,
        0
      );
      const totalDailyRatesMonthPrev = previousMonthlySales.reduce(
        (sum, sale) => sum + sale.netValue,
        0
      );

      const totalDailyRatesYear = yearlySales.reduce(
        (sum, sale) => sum + sale.netValue,
        0
      );
      const totalDailyRatesYearPrev = previousYearlySales.reduce(
        (sum, sale) => sum + sale.netValue,
        0
      );

      const closedContractsMonth = monthlySales.filter(
        (sale) => sale.status === "completed"
      ).length;
      const closedContractsMonthPrev = previousMonthlySales.filter(
        (sale) => sale.status === "completed"
      ).length;

      const closedContractsYear = yearlySales.filter(
        (sale) => sale.status === "completed"
      ).length;
      const closedContractsYearPrev = previousYearlySales.filter(
        (sale) => sale.status === "completed"
      ).length;

      const totalRevenue = filteredSales.reduce(
        (sum, sale) => sum + sale.totalRevenue,
        0
      );
      const averageTicket =
        filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;

      const averageTicketByHouse = (() => {
        const houseMap = new Map<string, { total: number; count: number }>();
        filteredSales.forEach((sale) => {
          const current = houseMap.get(sale.houseId) || {
            total: 0,
            count: 0,
          };
          houseMap.set(sale.houseId, {
            total: current.total + sale.totalRevenue,
            count: current.count + 1,
          });
        });

        const houseAverages = Array.from(houseMap.values()).map((entry) =>
          entry.count > 0 ? entry.total / entry.count : 0
        );
        if (houseAverages.length === 0) return 0;
        return (
          houseAverages.reduce((sum, value) => sum + value, 0) /
          houseAverages.length
        );
      })();

      const averageTicketBySupplier =
        filteredSales.length > 0
          ? filteredSales.reduce(
              (sum, sale) => sum + sale.totalAdditionalSales,
              0
            ) / filteredSales.length
          : 0;

      const averageTicketByConcierge =
        filteredSales.length > 0
          ? filteredSales.reduce((sum, sale) => sum + sale.conciergeValue, 0) /
            filteredSales.length
          : 0;

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
            variation: calculateVariation(
              totalDailyRatesMonth,
              totalDailyRatesMonthPrev
            ),
          },
          year: {
            value: totalDailyRatesYear,
            variation: calculateVariation(
              totalDailyRatesYear,
              totalDailyRatesYearPrev
            ),
          },
        },
        totalContracts: {
          month: {
            count: closedContractsMonth,
            variation: calculateVariation(
              closedContractsMonth,
              closedContractsMonthPrev
            ),
          },
          year: {
            count: closedContractsYear,
            variation: calculateVariation(
              closedContractsYear,
              closedContractsYearPrev
            ),
          },
        },
        averageTicket: {
          byHouse: averageTicketByHouse,
          bySupplier: averageTicketBySupplier,
          byConcierge: averageTicketByConcierge,
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
      const applyCompanyAndHouse = (sales: Sale[]) => {
        let result = [...sales];
        if (filters.company !== "all") {
          result = result.filter((sale) => sale.company === filters.company);
        }
        if (filters.houseId) {
          result = result.filter((sale) => sale.houseId === filters.houseId);
        }
        return result;
      };

      let filteredSales = applyCompanyAndHouse(
        this.filterSalesByPeriod(allSales, filters)
      );

      const currentRange = resolvePeriodRange(filters);
      const previousPeriod = getPreviousPeriod(
        currentRange.start,
        currentRange.end
      );

      const previousSales = applyCompanyAndHouse(
        this.filterSalesByPeriod(allSales, {
          ...filters,
          startDate: previousPeriod.start.toISOString(),
          endDate: previousPeriod.end.toISOString(),
        })
      );

      const calculateTotals = (sales: Sale[]) => {
        const totalSalesValue = sales.reduce(
          (sum, sale) => sum + sale.totalRevenue,
          0
        );
        const totalCommissionsValue = sales.reduce(
          (sum, sale) => sum + sale.salesCommission + sale.totalAdditionalSales,
          0
        );
        const supplierCommissionsValue = sales.reduce(
          (sum, sale) => sum + sale.totalAdditionalSales,
          0
        );
        const conciergeValue = sales.reduce(
          (sum, sale) => sum + sale.conciergeValue,
          0
        );
        const housekeeperPaymentsValue = sales.reduce(
          (sum, sale) => sum + sale.housekeeperValue,
          0
        );
        const contributionMarginValue = sales.reduce(
          (sum, sale) => sum + sale.contributionMargin,
          0
        );

        return {
          totalSalesValue,
          totalCommissionsValue,
          supplierCommissionsValue,
          conciergeValue,
          housekeeperPaymentsValue,
          contributionMarginValue,
        };
      };

      const currentTotals = calculateTotals(filteredSales);
      const previousTotals = calculateTotals(previousSales);

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
          current: currentTotals.totalSalesValue,
          previous: previousTotals.totalSalesValue,
          variation: calculateVariation(
            currentTotals.totalSalesValue,
            previousTotals.totalSalesValue
          ),
          chartData: salesChartData,
        },
        totalCommissions: {
          current: currentTotals.totalCommissionsValue,
          previous: previousTotals.totalCommissionsValue,
          variation: calculateVariation(
            currentTotals.totalCommissionsValue,
            previousTotals.totalCommissionsValue
          ),
          chartData: commissionsChartData,
        },
        supplierCommissions: {
          current: currentTotals.supplierCommissionsValue,
          previous: previousTotals.supplierCommissionsValue,
          variation: calculateVariation(
            currentTotals.supplierCommissionsValue,
            previousTotals.supplierCommissionsValue
          ),
        },
        concierge: {
          current: currentTotals.conciergeValue,
          previous: previousTotals.conciergeValue,
          variation: calculateVariation(
            currentTotals.conciergeValue,
            previousTotals.conciergeValue
          ),
        },
        housekeeperPayments: {
          current: currentTotals.housekeeperPaymentsValue,
          previous: previousTotals.housekeeperPaymentsValue,
          variation: calculateVariation(
            currentTotals.housekeeperPaymentsValue,
            previousTotals.housekeeperPaymentsValue
          ),
        },
        contributionMargin: {
          byHouse: marginByHouse,
          total: {
            current: currentTotals.contributionMarginValue,
            previous: previousTotals.contributionMarginValue,
            variation: calculateVariation(
              currentTotals.contributionMarginValue,
              previousTotals.contributionMarginValue
            ),
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
      const applyCompanyAndHouse = (sales: Sale[]) => {
        let result = [...sales];
        if (filters.company !== "all") {
          result = result.filter((sale) => sale.company === filters.company);
        }
        if (filters.houseId) {
          result = result.filter((sale) => sale.houseId === filters.houseId);
        }
        return result;
      };

      const filteredSales = applyCompanyAndHouse(
        this.filterSalesByPeriod(allSales, filters)
      );

      // Análise por mídia
      const salesByMedia = this.analyzeSalesByMedia(filteredSales);

      // Análise por gênero
      const salesByGender = this.analyzeSalesByGender(filteredSales);

      // Taxa de ocupação
      const occupancyRate = await this.calculateOccupancyRate(
        filteredSales,
        filters
      );

      const insights = await this.buildCommercialInsights(
        allSales,
        filteredSales,
        !filters.houseId
      );

      return {
        salesByMedia,
        salesByGender,
        occupancyRate,
        insights,
      };
    } catch (error) {
      console.error("Erro ao buscar inteligência comercial:", error);
      throw new Error("Falha ao carregar inteligência comercial");
    }
  },

  // ===== FUNÇÕES AUXILIARES INTERNAS =====

  // Filtrar vendas por período
  filterSalesByPeriod(sales: Sale[], filters: DashboardFilters): Sale[] {
    const { start, end } = resolvePeriodRange(filters);

    return sales.filter((sale) => {
      const saleDate = sale.checkInDate;
      if (saleDate < start) return false;
      if (saleDate > end) return false;
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

  async buildCommercialInsights(
    allSales: Sale[],
    filteredSales: Sale[],
    includeAllHouses: boolean
  ): Promise<CommercialIntelligence["insights"]> {
    const houseStatsMap = new Map<string, HouseRentalStat>();
    filteredSales.forEach((sale) => {
      const current = houseStatsMap.get(sale.houseId) || {
        houseId: sale.houseId,
        houseName: sale.houseName,
        totalSales: 0,
        totalNights: 0,
        totalRevenue: 0,
      };
      houseStatsMap.set(sale.houseId, {
        ...current,
        totalSales: current.totalSales + 1,
        totalNights: current.totalNights + sale.numberOfNights,
        totalRevenue: current.totalRevenue + sale.totalRevenue,
      });
    });

    if (includeAllHouses) {
      const allHouses = await houseService.getAll();
      allHouses.forEach((house) => {
        if (!houseStatsMap.has(house.id)) {
          houseStatsMap.set(house.id, {
            houseId: house.id,
            houseName: house.houseName,
            totalSales: 0,
            totalNights: 0,
            totalRevenue: 0,
          });
        }
      });
    }

    const houseStats = Array.from(houseStatsMap.values()).sort(
      (a, b) => b.totalNights - a.totalNights
    );

    const nightsByHouse = houseStats.slice(0, 10);
    const mostRented = houseStats.slice(0, 5);
    const leastRented = [...houseStats]
      .sort((a, b) => a.totalNights - b.totalNights)
      .slice(0, 5);

    const seasonalityMap = new Map<string, SeasonalityStat>();
    const monthLabels = [
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

    filteredSales.forEach((sale) => {
      const monthNumber = sale.checkInDate.getMonth();
      const year = sale.checkInDate.getFullYear();
      const key = `${year}-${monthNumber}`;
      const current = seasonalityMap.get(key) || {
        month: monthLabels[monthNumber],
        monthNumber: monthNumber + 1,
        year,
        totalNights: 0,
        totalRevenue: 0,
      };
      seasonalityMap.set(key, {
        ...current,
        totalNights: current.totalNights + sale.numberOfNights,
        totalRevenue: current.totalRevenue + sale.totalRevenue,
      });
    });

    const seasonality = Array.from(seasonalityMap.values()).sort(
      (a, b) =>
        a.year === b.year
          ? a.monthNumber - b.monthNumber
          : a.year - b.year
    );

    const clients = await clientService.getAll();
    const clientMap = new Map(clients.map((client) => [client.id, client]));
    const totalSalesCount = filteredSales.length;
    const cityCounts = new Map<string, number>();
    const stateCounts = new Map<string, number>();
    const countryCounts = new Map<string, number>();

    filteredSales.forEach((sale) => {
      const client = clientMap.get(sale.clientId);
      const city = client?.address?.city || "Não informado";
      const state = client?.address?.state || "Não informado";
      const country = "Não informado";

      cityCounts.set(city, (cityCounts.get(city) || 0) + 1);
      stateCounts.set(state, (stateCounts.get(state) || 0) + 1);
      countryCounts.set(country, (countryCounts.get(country) || 0) + 1);
    });

    const buildOriginStats = (counts: Map<string, number>): ClientOriginStat[] =>
      Array.from(counts.entries())
        .map(([label, count]) => ({
          label,
          count,
          percentage: totalSalesCount > 0 ? (count / totalSalesCount) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    const salesPerClient = new Map<string, number>();
    allSales.forEach((sale) => {
      salesPerClient.set(
        sale.clientId,
        (salesPerClient.get(sale.clientId) || 0) + 1
      );
    });

    const uniqueClients = new Set(filteredSales.map((sale) => sale.clientId));
    let recurringClients = 0;
    uniqueClients.forEach((clientId) => {
      if ((salesPerClient.get(clientId) || 0) > 1) {
        recurringClients += 1;
      }
    });

    const newClients = Math.max(uniqueClients.size - recurringClients, 0);
    const recurringRate =
      uniqueClients.size > 0
        ? (recurringClients / uniqueClients.size) * 100
        : 0;

    const totalGuests = filteredSales.reduce(
      (sum, sale) => sum + (sale.numberOfGuests || 0),
      0
    );
    const totalStays = filteredSales.length;
    const averageGuestsPerStay =
      totalStays > 0 ? totalGuests / totalStays : 0;

    const totalAdditionalSales = filteredSales.reduce(
      (sum, sale) => sum + sale.totalAdditionalSales,
      0
    );
    const averageSupplierSpendPerGuest =
      totalGuests > 0 ? totalAdditionalSales / totalGuests : 0;

    const averageTicketByHouseMap = new Map<
      string,
      { total: number; count: number; houseName: string }
    >();
    filteredSales.forEach((sale) => {
      const current = averageTicketByHouseMap.get(sale.houseId) || {
        total: 0,
        count: 0,
        houseName: sale.houseName,
      };
      averageTicketByHouseMap.set(sale.houseId, {
        total: current.total + sale.totalRevenue,
        count: current.count + 1,
        houseName: current.houseName,
      });
    });

    const averageTicketByHouse: AverageTicketByHouse[] = Array.from(
      averageTicketByHouseMap.entries()
    )
      .map(([houseId, data]) => ({
        houseId,
        houseName: data.houseName,
        totalSales: data.count,
        averageTicket: data.count > 0 ? data.total / data.count : 0,
      }))
      .sort((a, b) => b.averageTicket - a.averageTicket)
      .slice(0, 5);

    const averageTicketByClientMap = new Map<
      string,
      { total: number; count: number; clientName: string }
    >();
    filteredSales.forEach((sale) => {
      const current = averageTicketByClientMap.get(sale.clientId) || {
        total: 0,
        count: 0,
        clientName: sale.clientName,
      };
      averageTicketByClientMap.set(sale.clientId, {
        total: current.total + sale.totalRevenue,
        count: current.count + 1,
        clientName: current.clientName,
      });
    });

    const averageTicketByClient: AverageTicketByClient[] = Array.from(
      averageTicketByClientMap.entries()
    )
      .map(([clientId, data]) => ({
        clientId,
        clientName: data.clientName,
        totalSales: data.count,
        averageTicket: data.count > 0 ? data.total / data.count : 0,
      }))
      .sort((a, b) => b.averageTicket - a.averageTicket)
      .slice(0, 5);

    const grossRevenue = filteredSales.reduce(
      (sum, sale) => sum + sale.totalRevenue,
      0
    );
    const netRevenue = filteredSales.reduce(
      (sum, sale) => sum + sale.contributionMargin,
      0
    );

    const revenueComparison: RevenueComparison = {
      grossRevenue,
      netRevenue,
    };

    const guestStats: GuestStats = {
      totalGuests,
      totalStays,
      averageGuestsPerStay,
    };

    const supplierSpendPerGuest: SupplierSpendPerGuest = {
      totalAdditionalSales,
      averagePerGuest: averageSupplierSpendPerGuest,
    };

    const clientReturn: ClientReturnStats = {
      newClients,
      recurringClients,
      recurringRate,
    };

    return {
      nightsByHouse,
      houseRanking: {
        mostRented,
        leastRented,
      },
      seasonality,
      clientOrigins: {
        cities: buildOriginStats(cityCounts),
        states: buildOriginStats(stateCounts),
        countries: buildOriginStats(countryCounts),
      },
      clientReturn,
      guestStats,
      supplierSpendPerGuest,
      averageTicketBy: {
        houses: averageTicketByHouse,
        clients: averageTicketByClient,
      },
      revenueComparison,
    };
  },

  // Calcular taxa de ocupação
  async calculateOccupancyRate(
    sales: Sale[],
    filters: DashboardFilters
  ): Promise<OccupancyRateData[]> {
    const range = resolvePeriodRange(filters);
    const monthLabels = [
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

    const houses = filters.houseId ? 1 : (await houseService.getAll()).length;
    const months: OccupancyRateData[] = [];
    const monthCursor = new Date(
      range.start.getFullYear(),
      range.start.getMonth(),
      1
    );

    const occupiedMap = new Map<string, { occupied: number; revenue: number }>();

    sales.forEach((sale) => {
      const totalNights = sale.numberOfNights || 0;
      const revenuePerNight = totalNights > 0 ? sale.totalRevenue / totalNights : 0;
      const start = new Date(
        sale.checkInDate.getFullYear(),
        sale.checkInDate.getMonth(),
        sale.checkInDate.getDate()
      );
      const end = new Date(
        sale.checkOutDate.getFullYear(),
        sale.checkOutDate.getMonth(),
        sale.checkOutDate.getDate()
      );

      for (let cursor = new Date(start); cursor < end; cursor.setDate(cursor.getDate() + 1)) {
        if (cursor < range.start || cursor > range.end) continue;
        const key = `${cursor.getFullYear()}-${cursor.getMonth()}`;
        const current = occupiedMap.get(key) || { occupied: 0, revenue: 0 };
        occupiedMap.set(key, {
          occupied: current.occupied + 1,
          revenue: current.revenue + revenuePerNight,
        });
      }
    });

    while (monthCursor <= range.end) {
      const year = monthCursor.getFullYear();
      const month = monthCursor.getMonth();
      const key = `${year}-${month}`;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const totalDays = daysInMonth * Math.max(houses, 0);
      const occupiedData = occupiedMap.get(key) || { occupied: 0, revenue: 0 };
      const rate = totalDays > 0 ? (occupiedData.occupied / totalDays) * 100 : 0;

      months.push({
        month: monthLabels[month],
        monthNumber: month + 1,
        year,
        totalDays,
        occupiedDays: occupiedData.occupied,
        rate,
        revenue: occupiedData.revenue,
      });

      monthCursor.setMonth(monthCursor.getMonth() + 1);
    }

    return months;
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

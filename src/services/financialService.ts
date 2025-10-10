import { saleService } from "./saleService";
import type { Sale } from "../types/sale";
import type {
  RevenueByHouse,
  CashFlowEntry,
  ContractsReport,
  RevenueBreakdown,
  DemographicReport,
  ComparativeReport,
  ComparativePeriod,
  TaxReport,
  FinancialFilters,
  FinancialSummary,
  ComparisonMetric,
} from "../types/financial";

// Configuração de alíquotas de impostos por empresa (ajuste conforme necessário)
const TAX_RATES = {
  exclusive: 6.0, // 6% - Simples Nacional
  giogio: 6.0, // 6%
  direta: 6.0, // 6%
};

const COMPANY_NAMES = {
  exclusive: "Exclusive Imóveis",
  giogio: "Gio Gio Temporadas",
  direta: "Venda Direta",
};

// Função auxiliar para filtrar vendas por período
const filterSalesByPeriod = (
  sales: Sale[],
  startDate?: Date,
  endDate?: Date
): Sale[] => {
  if (!startDate && !endDate) return sales;

  return sales.filter((sale) => {
    const saleDate = sale.checkInDate;
    if (startDate && saleDate < startDate) return false;
    if (endDate && saleDate > endDate) return false;
    return true;
  });
};

// Função auxiliar para filtrar por empresa
const filterSalesByCompany = (
  sales: Sale[],
  company?: "exclusive" | "giogio" | "direta" | "all"
): Sale[] => {
  if (!company || company === "all") return sales;
  return sales.filter((sale) => sale.company === company);
};

// Função auxiliar para agrupar por período
const groupByPeriod = (
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

// Função auxiliar para formatar período
const formatPeriodLabel = (key: string, groupBy: string): string => {
  if (groupBy === "day") {
    const [year, month, day] = key.split("-");
    return `${day}/${month}/${year}`;
  }
  if (groupBy === "month") {
    const [year, month] = key.split("-");
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
  return key;
};

export const financialService = {
  // 1. Receitas e despesas por casa
  async getRevenueByHouse(
    filters?: FinancialFilters
  ): Promise<RevenueByHouse[]> {
    try {
      let sales = await saleService.getAll();

      // Aplicar filtros
      sales = filterSalesByPeriod(sales, filters?.startDate, filters?.endDate);
      sales = filterSalesByCompany(sales, filters?.company);

      if (filters?.houseId) {
        sales = sales.filter((sale) => sale.houseId === filters.houseId);
      }

      // Filtrar apenas vendas não canceladas
      sales = sales.filter((sale) => sale.status !== "cancelled");

      // Agrupar por casa
      const houseMap = new Map<string, Sale[]>();
      sales.forEach((sale) => {
        if (!houseMap.has(sale.houseId)) {
          houseMap.set(sale.houseId, []);
        }
        houseMap.get(sale.houseId)!.push(sale);
      });

      // Calcular métricas por casa
      const results: RevenueByHouse[] = [];
      houseMap.forEach((houseSales, houseId) => {
        const dailyRatesRevenue = houseSales.reduce(
          (sum, sale) => sum + sale.netValue,
          0
        );
        const conciergeRevenue = houseSales.reduce(
          (sum, sale) => sum + sale.conciergeValue,
          0
        );
        const suppliersCommission = houseSales.reduce(
          (sum, sale) => sum + sale.totalAdditionalSales,
          0
        );
        const expenses = houseSales.reduce(
          (sum, sale) => sum + sale.housekeeperValue + sale.salesCommission,
          0
        );
        const numberOfNights = houseSales.reduce(
          (sum, sale) => sum + sale.numberOfNights,
          0
        );

        const grossRevenue =
          dailyRatesRevenue + conciergeRevenue + suppliersCommission;
        const netRevenue = grossRevenue - expenses;

        results.push({
          houseId,
          houseName: houseSales[0].houseName,
          houseAddress: houseSales[0].houseAddress,
          dailyRatesRevenue,
          conciergeRevenue,
          suppliersCommission,
          grossRevenue,
          expenses,
          netRevenue,
          numberOfSales: houseSales.length,
          numberOfNights,
        });
      });

      // Ordenar por receita líquida decrescente
      return results.sort((a, b) => b.netRevenue - a.netRevenue);
    } catch (error) {
      console.error("Erro ao calcular receitas por casa:", error);
      throw new Error("Falha ao gerar relatório de receitas por casa");
    }
  },

  // 2. Fluxo de caixa
  async getCashFlow(filters?: FinancialFilters): Promise<CashFlowEntry[]> {
    try {
      let sales = await saleService.getAll();

      // Aplicar filtros
      sales = filterSalesByPeriod(sales, filters?.startDate, filters?.endDate);
      sales = filterSalesByCompany(sales, filters?.company);
      sales = sales.filter((sale) => sale.status !== "cancelled");

      // Agrupar por período
      const groupBy = filters?.groupBy || "month";
      const groups = groupByPeriod(sales, groupBy);

      // Calcular fluxo de caixa
      const cashFlowEntries: CashFlowEntry[] = [];
      let accumulatedBalance = 0;

      // Ordenar chaves cronologicamente
      const sortedKeys = Array.from(groups.keys()).sort();

      sortedKeys.forEach((key) => {
        const periodSales = groups.get(key)!;

        const cashIn = periodSales.reduce(
          (sum, sale) => sum + sale.totalRevenue,
          0
        );
        const cashOut = periodSales.reduce(
          (sum, sale) => sum + sale.housekeeperValue + sale.salesCommission,
          0
        );
        const balance = cashIn - cashOut;
        accumulatedBalance += balance;

        // Criar data representativa do período
        const [year, month] = key.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);

        cashFlowEntries.push({
          period: formatPeriodLabel(key, groupBy),
          date,
          cashIn,
          cashOut,
          balance,
          accumulatedBalance,
        });
      });

      return cashFlowEntries;
    } catch (error) {
      console.error("Erro ao calcular fluxo de caixa:", error);
      throw new Error("Falha ao gerar relatório de fluxo de caixa");
    }
  },

  // 3. Contratos ativos x concluídos
  async getContractsReport(
    filters?: FinancialFilters
  ): Promise<ContractsReport> {
    try {
      let sales = await saleService.getAll();

      // Aplicar filtros
      sales = filterSalesByPeriod(sales, filters?.startDate, filters?.endDate);
      sales = filterSalesByCompany(sales, filters?.company);

      const active = sales.filter(
        (s) => s.status === "confirmed" || s.status === "pending"
      );
      const completed = sales.filter((s) => s.status === "completed");
      const pending = sales.filter((s) => s.status === "pending");
      const cancelled = sales.filter((s) => s.status === "cancelled");

      const calculateMetrics = (salesList: Sale[]) => {
        const totalRevenue = salesList.reduce(
          (sum, sale) => sum + sale.totalRevenue,
          0
        );
        const averageValue =
          salesList.length > 0 ? totalRevenue / salesList.length : 0;
        return { count: salesList.length, totalRevenue, averageValue };
      };

      return {
        active: calculateMetrics(active),
        completed: calculateMetrics(completed),
        pending: {
          count: pending.length,
          totalRevenue: pending.reduce((sum, s) => sum + s.totalRevenue, 0),
        },
        cancelled: {
          count: cancelled.length,
          lostRevenue: cancelled.reduce((sum, s) => sum + s.totalRevenue, 0),
        },
      };
    } catch (error) {
      console.error("Erro ao gerar relatório de contratos:", error);
      throw new Error("Falha ao gerar relatório de contratos");
    }
  },

  // 4. Receita Bruta e Líquida (Breakdown)
  async getRevenueBreakdown(
    filters?: FinancialFilters
  ): Promise<RevenueBreakdown> {
    try {
      let sales = await saleService.getAll();

      // Aplicar filtros
      sales = filterSalesByPeriod(sales, filters?.startDate, filters?.endDate);
      sales = filterSalesByCompany(sales, filters?.company);
      sales = sales.filter((sale) => sale.status !== "cancelled");

      const dailyRatesTotal = sales.reduce(
        (sum, sale) => sum + sale.netValue,
        0
      );
      const conciergeTotal = sales.reduce(
        (sum, sale) => sum + sale.conciergeValue,
        0
      );
      const suppliersTotal = sales.reduce(
        (sum, sale) => sum + sale.totalAdditionalSales,
        0
      );

      const totalRevenue = dailyRatesTotal + conciergeTotal + suppliersTotal;

      return {
        dailyRates: {
          total: dailyRatesTotal,
          percentage:
            totalRevenue > 0 ? (dailyRatesTotal / totalRevenue) * 100 : 0,
        },
        concierge: {
          total: conciergeTotal,
          percentage:
            totalRevenue > 0 ? (conciergeTotal / totalRevenue) * 100 : 0,
        },
        suppliersCommission: {
          total: suppliersTotal,
          percentage:
            totalRevenue > 0 ? (suppliersTotal / totalRevenue) * 100 : 0,
        },
        totalRevenue,
      };
    } catch (error) {
      console.error("Erro ao calcular breakdown de receitas:", error);
      throw new Error("Falha ao gerar relatório de receitas");
    }
  },

  // 5. Relatórios demográficos (por casa, gênero, localidade, origem)
  async getDemographicReport(
    type: "house" | "gender" | "location" | "origin",
    filters?: FinancialFilters
  ): Promise<DemographicReport[]> {
    try {
      let sales = await saleService.getAll();

      // Aplicar filtros
      sales = filterSalesByPeriod(sales, filters?.startDate, filters?.endDate);
      sales = filterSalesByCompany(sales, filters?.company);
      sales = sales.filter((sale) => sale.status !== "cancelled");

      // Agrupar por tipo
      const groups = new Map<string, Sale[]>();

      sales.forEach((sale) => {
        let key: string;
        switch (type) {
          case "house":
            key = sale.houseName;
            break;
          case "gender":
            key = sale.clientGender || "Não informado";
            break;
          case "location":
            key = sale.houseAddress.split(" - ")[1] || "Não informado"; // Cidade
            break;
          case "origin":
            key = sale.saleOrigin;
            break;
          default:
            key = "Outros";
        }

        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key)!.push(sale);
      });

      // Calcular totais
      const totalRevenue = sales.reduce((sum, s) => sum + s.totalRevenue, 0);

      // Gerar relatório
      const results: DemographicReport[] = [];
      groups.forEach((groupSales, value) => {
        const revenue = groupSales.reduce((sum, s) => sum + s.totalRevenue, 0);
        results.push({
          category: type,
          value,
          numberOfSales: groupSales.length,
          totalRevenue: revenue,
          percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
          averageTicket:
            groupSales.length > 0 ? revenue / groupSales.length : 0,
        });
      });

      // Ordenar por receita decrescente
      return results.sort((a, b) => b.totalRevenue - a.totalRevenue);
    } catch (error) {
      console.error("Erro ao gerar relatório demográfico:", error);
      throw new Error("Falha ao gerar relatório demográfico");
    }
  },

  // 6. Relatórios comparativos entre períodos
  async getComparativeReport(
    period1Start: Date,
    period1End: Date,
    period2Start: Date,
    period2End: Date,
    company?: "exclusive" | "giogio" | "direta" | "all"
  ): Promise<ComparativeReport> {
    try {
      const allSales = await saleService.getAll();

      // Filtrar vendas de cada período
      let period1Sales = filterSalesByPeriod(
        allSales,
        period1Start,
        period1End
      );
      let period2Sales = filterSalesByPeriod(
        allSales,
        period2Start,
        period2End
      );

      period1Sales = filterSalesByCompany(period1Sales, company);
      period2Sales = filterSalesByCompany(period2Sales, company);

      period1Sales = period1Sales.filter((s) => s.status !== "cancelled");
      period2Sales = period2Sales.filter((s) => s.status !== "cancelled");

      // Calcular métricas para cada período
      const calculateMetrics = (sales: Sale[]) => {
        const totalRevenue = sales.reduce((sum, s) => sum + s.totalRevenue, 0);
        return {
          totalSales: sales.length,
          totalRevenue,
          dailyRates: sales.reduce((sum, s) => sum + s.netValue, 0),
          concierge: sales.reduce((sum, s) => sum + s.conciergeValue, 0),
          suppliersCommission: sales.reduce(
            (sum, s) => sum + s.totalAdditionalSales,
            0
          ),
          averageTicket: sales.length > 0 ? totalRevenue / sales.length : 0,
          numberOfNights: sales.reduce((sum, s) => sum + s.numberOfNights, 0),
        };
      };

      const period1: ComparativePeriod = {
        label: `${period1Start.toLocaleDateString(
          "pt-BR"
        )} - ${period1End.toLocaleDateString("pt-BR")}`,
        startDate: period1Start,
        endDate: period1End,
        metrics: calculateMetrics(period1Sales),
      };

      const period2: ComparativePeriod = {
        label: `${period2Start.toLocaleDateString(
          "pt-BR"
        )} - ${period2End.toLocaleDateString("pt-BR")}`,
        startDate: period2Start,
        endDate: period2End,
        metrics: calculateMetrics(period2Sales),
      };

      // Calcular comparações
      const compare = (val1: number, val2: number): ComparisonMetric => {
        const absoluteChange = val2 - val1;
        const percentageChange = val1 !== 0 ? (absoluteChange / val1) * 100 : 0;
        const trend =
          absoluteChange > 0 ? "up" : absoluteChange < 0 ? "down" : "neutral";

        return { absoluteChange, percentageChange, trend };
      };

      return {
        period1,
        period2,
        comparison: {
          totalSales: compare(
            period1.metrics.totalSales,
            period2.metrics.totalSales
          ),
          totalRevenue: compare(
            period1.metrics.totalRevenue,
            period2.metrics.totalRevenue
          ),
          dailyRates: compare(
            period1.metrics.dailyRates,
            period2.metrics.dailyRates
          ),
          concierge: compare(
            period1.metrics.concierge,
            period2.metrics.concierge
          ),
          suppliersCommission: compare(
            period1.metrics.suppliersCommission,
            period2.metrics.suppliersCommission
          ),
          averageTicket: compare(
            period1.metrics.averageTicket,
            period2.metrics.averageTicket
          ),
          numberOfNights: compare(
            period1.metrics.numberOfNights,
            period2.metrics.numberOfNights
          ),
        },
      };
    } catch (error) {
      console.error("Erro ao gerar relatório comparativo:", error);
      throw new Error("Falha ao gerar relatório comparativo");
    }
  },

  // 7. Impostos pagos por empresa
  async getTaxReport(filters?: FinancialFilters): Promise<TaxReport[]> {
    try {
      const allSales = await saleService.getAll();

      // Aplicar filtros de período
      let sales = filterSalesByPeriod(
        allSales,
        filters?.startDate,
        filters?.endDate
      );
      sales = sales.filter((sale) => sale.status !== "cancelled");

      // Agrupar por empresa
      const companies: Array<"exclusive" | "giogio" | "direta"> = [
        "exclusive",
        "giogio",
        "direta",
      ];

      const results: TaxReport[] = [];

      companies.forEach((company) => {
        const companySales = sales.filter((s) => s.company === company);
        const grossRevenue = companySales.reduce(
          (sum, s) => sum + s.totalRevenue,
          0
        );
        const taxRate = TAX_RATES[company];
        const taxAmount = (grossRevenue * taxRate) / 100;
        const netRevenue = grossRevenue - taxAmount;

        results.push({
          company,
          companyName: COMPANY_NAMES[company],
          period:
            filters?.startDate && filters?.endDate
              ? `${filters.startDate.toLocaleDateString(
                  "pt-BR"
                )} - ${filters.endDate.toLocaleDateString("pt-BR")}`
              : "Todos os períodos",
          grossRevenue,
          taxableRevenue: grossRevenue, // Pode ser ajustado se houver deduções
          taxRate,
          taxAmount,
          netRevenue,
        });
      });

      return results;
    } catch (error) {
      console.error("Erro ao gerar relatório de impostos:", error);
      throw new Error("Falha ao gerar relatório de impostos");
    }
  },

  // 8. Resumo financeiro geral
  async getFinancialSummary(
    filters?: FinancialFilters
  ): Promise<FinancialSummary> {
    try {
      let sales = await saleService.getAll();

      // Aplicar filtros
      sales = filterSalesByPeriod(sales, filters?.startDate, filters?.endDate);
      sales = filterSalesByCompany(sales, filters?.company);
      sales = sales.filter((sale) => sale.status !== "cancelled");

      const totalRevenue = sales.reduce((sum, s) => sum + s.totalRevenue, 0);
      const totalExpenses = sales.reduce(
        (sum, s) => sum + s.housekeeperValue + s.salesCommission,
        0
      );
      const netProfit = totalRevenue - totalExpenses;
      const profitMargin =
        totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      return {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin,
        numberOfSales: sales.length,
        averageTicket: sales.length > 0 ? totalRevenue / sales.length : 0,
        dailyRatesRevenue: sales.reduce((sum, s) => sum + s.netValue, 0),
        conciergeRevenue: sales.reduce((sum, s) => sum + s.conciergeValue, 0),
        suppliersCommissionRevenue: sales.reduce(
          (sum, s) => sum + s.totalAdditionalSales,
          0
        ),
      };
    } catch (error) {
      console.error("Erro ao calcular resumo financeiro:", error);
      throw new Error("Falha ao gerar resumo financeiro");
    }
  },

  // Função auxiliar para formatar moeda
  formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  },

  // Função auxiliar para formatar porcentagem
  formatPercentage(value: number): string {
    return `${value.toFixed(2)}%`;
  },
};

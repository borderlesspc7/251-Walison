import * as XLSX from "xlsx";
import type {
  RevenueByHouse,
  CashFlowEntry,
  ContractsReport,
  DemographicReport,
  ComparativeReport,
  TaxReport,
  FinancialSummary,
} from "../types/financial";
import type {
  TopIndicators,
  FinancialData,
  CommercialIntelligence,
  DashboardFilters,
} from "../types/dashboardConsolidation";
import type {
  JetpackStats,
  InstagramStats,
  StatisticsFilters,
} from "../types/dashboardStatistics";
import type {
  ProcessDashboardData,
  ProcessFilters,
  FutureReservation,
  ConciergeProcess,
  Notification,
  ProcessMetrics,
} from "../types/processDashboard";
import type {
  GoalsDashboardData,
  GoalFilters,
  GoalStatus,
} from "../types/dashboardGoals";

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

export const excelExportService = {
  // Exportar receitas por casa
  exportRevenueByHouse(
    data: RevenueByHouse[],
    filename: string = "receitas-por-casa.xlsx"
  ) {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((item) => ({
        Casa: item.houseName,
        Endereço: item.houseAddress,
        Vendas: item.numberOfSales,
        Noites: item.numberOfNights,
        Diárias: formatCurrency(item.dailyRatesRevenue),
        Concierge: formatCurrency(item.conciergeRevenue),
        "Comissões Fornecedores": formatCurrency(item.suppliersCommission),
        "Receita Bruta": formatCurrency(item.grossRevenue),
        Despesas: formatCurrency(item.expenses),
        "Receita Líquida": formatCurrency(item.netRevenue),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Receitas por Casa");
    XLSX.writeFile(workbook, filename);
  },

  // Exportar fluxo de caixa
  exportCashFlow(
    data: CashFlowEntry[],
    filename: string = "fluxo-de-caixa.xlsx"
  ) {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((item) => ({
        Período: item.period,
        Entradas: formatCurrency(item.cashIn),
        Saídas: formatCurrency(item.cashOut),
        "Saldo do Período": formatCurrency(item.balance),
        "Saldo Acumulado": formatCurrency(item.accumulatedBalance),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fluxo de Caixa");
    XLSX.writeFile(workbook, filename);
  },

  // Exportar relatório de contratos
  exportContractsReport(
    data: ContractsReport,
    filename: string = "relatorio-contratos.xlsx"
  ) {
    const summaryData = [
      {
        Status: "Ativos",
        Quantidade: data.active.count,
        "Receita Total": formatCurrency(data.active.totalRevenue),
        "Ticket Médio": formatCurrency(data.active.averageValue),
      },
      {
        Status: "Concluídos",
        Quantidade: data.completed.count,
        "Receita Total": formatCurrency(data.completed.totalRevenue),
        "Ticket Médio": formatCurrency(data.completed.averageValue),
      },
      {
        Status: "Pendentes",
        Quantidade: data.pending.count,
        "Receita Total": formatCurrency(data.pending.totalRevenue),
        "Ticket Médio": "-",
      },
      {
        Status: "Cancelados",
        Quantidade: data.cancelled.count,
        "Receita Perdida": formatCurrency(data.cancelled.lostRevenue),
        "Ticket Médio": "-",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(summaryData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contratos");
    XLSX.writeFile(workbook, filename);
  },

  // Exportar relatório demográfico
  exportDemographicReport(
    data: DemographicReport[],
    type: string,
    filename?: string
  ) {
    const typeNames: Record<string, string> = {
      house: "Casa",
      gender: "Gênero",
      location: "Localidade",
      origin: "Origem",
    };

    const worksheet = XLSX.utils.json_to_sheet(
      data.map((item) => ({
        [typeNames[item.category] || "Categoria"]: item.value,
        "Número de Vendas": item.numberOfSales,
        "Receita Total": formatCurrency(item.totalRevenue),
        Percentual: formatPercentage(item.percentage),
        "Ticket Médio": formatCurrency(item.averageTicket),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      `Por ${typeNames[type] || "Categoria"}`
    );
    XLSX.writeFile(workbook, filename || `vendas-por-${type}.xlsx`);
  },

  // Exportar relatório comparativo
  exportComparativeReport(
    data: ComparativeReport,
    filename: string = "relatorio-comparativo.xlsx"
  ) {
    const comparisonData = [
      {
        Métrica: "Total de Vendas",
        [data.period1.label]: data.period1.metrics.totalSales,
        [data.period2.label]: data.period2.metrics.totalSales,
        Variação: data.comparison.totalSales.absoluteChange,
        "Variação %": formatPercentage(
          data.comparison.totalSales.percentageChange
        ),
      },
      {
        Métrica: "Receita Total",
        [data.period1.label]: formatCurrency(data.period1.metrics.totalRevenue),
        [data.period2.label]: formatCurrency(data.period2.metrics.totalRevenue),
        Variação: formatCurrency(data.comparison.totalRevenue.absoluteChange),
        "Variação %": formatPercentage(
          data.comparison.totalRevenue.percentageChange
        ),
      },
      {
        Métrica: "Diárias",
        [data.period1.label]: formatCurrency(data.period1.metrics.dailyRates),
        [data.period2.label]: formatCurrency(data.period2.metrics.dailyRates),
        Variação: formatCurrency(data.comparison.dailyRates.absoluteChange),
        "Variação %": formatPercentage(
          data.comparison.dailyRates.percentageChange
        ),
      },
      {
        Métrica: "Concierge",
        [data.period1.label]: formatCurrency(data.period1.metrics.concierge),
        [data.period2.label]: formatCurrency(data.period2.metrics.concierge),
        Variação: formatCurrency(data.comparison.concierge.absoluteChange),
        "Variação %": formatPercentage(
          data.comparison.concierge.percentageChange
        ),
      },
      {
        Métrica: "Comissões Fornecedores",
        [data.period1.label]: formatCurrency(
          data.period1.metrics.suppliersCommission
        ),
        [data.period2.label]: formatCurrency(
          data.period2.metrics.suppliersCommission
        ),
        Variação: formatCurrency(
          data.comparison.suppliersCommission.absoluteChange
        ),
        "Variação %": formatPercentage(
          data.comparison.suppliersCommission.percentageChange
        ),
      },
      {
        Métrica: "Ticket Médio",
        [data.period1.label]: formatCurrency(
          data.period1.metrics.averageTicket
        ),
        [data.period2.label]: formatCurrency(
          data.period2.metrics.averageTicket
        ),
        Variação: formatCurrency(data.comparison.averageTicket.absoluteChange),
        "Variação %": formatPercentage(
          data.comparison.averageTicket.percentageChange
        ),
      },
      {
        Métrica: "Noites Vendidas",
        [data.period1.label]: data.period1.metrics.numberOfNights,
        [data.period2.label]: data.period2.metrics.numberOfNights,
        Variação: data.comparison.numberOfNights.absoluteChange,
        "Variação %": formatPercentage(
          data.comparison.numberOfNights.percentageChange
        ),
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(comparisonData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Comparativo");
    XLSX.writeFile(workbook, filename);
  },

  // Exportar relatório de impostos
  exportTaxReport(data: TaxReport[], filename: string = "impostos.xlsx") {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((item) => ({
        Empresa: item.companyName,
        Período: item.period,
        "Receita Bruta": formatCurrency(item.grossRevenue),
        "Receita Tributável": formatCurrency(item.taxableRevenue),
        Alíquota: formatPercentage(item.taxRate),
        "Valor do Imposto": formatCurrency(item.taxAmount),
        "Receita Líquida": formatCurrency(item.netRevenue),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Impostos");
    XLSX.writeFile(workbook, filename);
  },

  // Exportar resumo financeiro
  exportFinancialSummary(
    data: FinancialSummary,
    filename: string = "resumo-financeiro.xlsx"
  ) {
    const summaryData = [
      { Métrica: "Receita Total", Valor: formatCurrency(data.totalRevenue) },
      { Métrica: "Despesas Totais", Valor: formatCurrency(data.totalExpenses) },
      { Métrica: "Lucro Líquido", Valor: formatCurrency(data.netProfit) },
      {
        Métrica: "Margem de Lucro",
        Valor: formatPercentage(data.profitMargin),
      },
      { Métrica: "Número de Vendas", Valor: data.numberOfSales.toString() },
      { Métrica: "Ticket Médio", Valor: formatCurrency(data.averageTicket) },
      {
        Métrica: "Receita Diárias",
        Valor: formatCurrency(data.dailyRatesRevenue),
      },
      {
        Métrica: "Receita Concierge",
        Valor: formatCurrency(data.conciergeRevenue),
      },
      {
        Métrica: "Comissões Fornecedores",
        Valor: formatCurrency(data.suppliersCommissionRevenue),
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(summaryData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Resumo");
    XLSX.writeFile(workbook, filename);
  },

  // Exportar relatório completo (múltiplas abas)
  exportCompleteReport(
    revenueByHouse: RevenueByHouse[],
    cashFlow: CashFlowEntry[],
    contracts: ContractsReport,
    taxReport: TaxReport[],
    summary: FinancialSummary,
    filename: string = "relatorio-completo.xlsx"
  ) {
    const workbook = XLSX.utils.book_new();

    // Aba 1: Resumo
    const summarySheet = XLSX.utils.json_to_sheet([
      { Métrica: "Receita Total", Valor: formatCurrency(summary.totalRevenue) },
      {
        Métrica: "Despesas Totais",
        Valor: formatCurrency(summary.totalExpenses),
      },
      { Métrica: "Lucro Líquido", Valor: formatCurrency(summary.netProfit) },
      {
        Métrica: "Margem de Lucro",
        Valor: formatPercentage(summary.profitMargin),
      },
      { Métrica: "Número de Vendas", Valor: summary.numberOfSales.toString() },
      {
        Métrica: "Ticket Médio",
        Valor: formatCurrency(summary.averageTicket),
      },
    ]);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumo");

    // Aba 2: Receitas por Casa
    const revenueSheet = XLSX.utils.json_to_sheet(
      revenueByHouse.map((item) => ({
        Casa: item.houseName,
        Diárias: formatCurrency(item.dailyRatesRevenue),
        Concierge: formatCurrency(item.conciergeRevenue),
        Comissões: formatCurrency(item.suppliersCommission),
        "Receita Bruta": formatCurrency(item.grossRevenue),
        Despesas: formatCurrency(item.expenses),
        "Receita Líquida": formatCurrency(item.netRevenue),
      }))
    );
    XLSX.utils.book_append_sheet(workbook, revenueSheet, "Receitas por Casa");

    // Aba 3: Fluxo de Caixa
    const cashFlowSheet = XLSX.utils.json_to_sheet(
      cashFlow.map((item) => ({
        Período: item.period,
        Entradas: formatCurrency(item.cashIn),
        Saídas: formatCurrency(item.cashOut),
        Saldo: formatCurrency(item.balance),
      }))
    );
    XLSX.utils.book_append_sheet(workbook, cashFlowSheet, "Fluxo de Caixa");

    // Aba 4: Contratos
    const contractsSheet = XLSX.utils.json_to_sheet([
      {
        Status: "Ativos",
        Quantidade: contracts.active.count,
        Receita: formatCurrency(contracts.active.totalRevenue),
      },
      {
        Status: "Concluídos",
        Quantidade: contracts.completed.count,
        Receita: formatCurrency(contracts.completed.totalRevenue),
      },
      {
        Status: "Cancelados",
        Quantidade: contracts.cancelled.count,
        Receita: formatCurrency(contracts.cancelled.lostRevenue),
      },
    ]);
    XLSX.utils.book_append_sheet(workbook, contractsSheet, "Contratos");

    // Aba 5: Impostos
    const taxSheet = XLSX.utils.json_to_sheet(
      taxReport.map((item) => ({
        Empresa: item.companyName,
        "Receita Bruta": formatCurrency(item.grossRevenue),
        Alíquota: formatPercentage(item.taxRate),
        "Valor Imposto": formatCurrency(item.taxAmount),
        "Receita Líquida": formatCurrency(item.netRevenue),
      }))
    );
    XLSX.utils.book_append_sheet(workbook, taxSheet, "Impostos");

    XLSX.writeFile(workbook, filename);
  },

  // Exportar Dashboard de Consolidação
  exportDashboardConsolidation(
    topIndicators: TopIndicators | null,
    financialData: FinancialData | null,
    commercialData: CommercialIntelligence | null,
    filters: DashboardFilters,
    filename: string = "dashboard-consolidacao.xlsx"
  ) {
    if (!topIndicators || !financialData || !commercialData) {
      throw new Error("Dados insuficientes para exportação");
    }

    const workbook = XLSX.utils.book_new();

    // ABA 1: Resumo Executivo
    const getPeriodLabel = () => {
      if (filters.period === "month") return "Mensal";
      if (filters.period === "year") return "Anual";
      return "Personalizado";
    };

    const getCompanyLabel = () => {
      if (filters.company === "all") return "Todas";
      if (filters.company === "exclusive") return "Exclusive";
      if (filters.company === "giogio") return "Gio Gio";
      if (filters.company === "direta") return "Direta";
      return filters.company;
    };

    const summarySheet = XLSX.utils.json_to_sheet([
      { Campo: "RELATÓRIO DE CONSOLIDAÇÃO", Valor: "" },
      { Campo: "Período", Valor: getPeriodLabel() },
      { Campo: "Empresa", Valor: getCompanyLabel() },
      { Campo: "Data de Geração", Valor: new Date().toLocaleString("pt-BR") },
      { Campo: "", Valor: "" },
      { Campo: "INDICADORES PRINCIPAIS", Valor: "" },
      {
        Campo: "Contratos Ativos",
        Valor: topIndicators.activeContracts.count.toString(),
      },
      {
        Campo: "Variação Contratos",
        Valor: formatPercentage(topIndicators.activeContracts.variation),
      },
      {
        Campo: "Reservas Futuras",
        Valor: topIndicators.futureReservations.count.toString(),
      },
      {
        Campo: "Total Diárias (Mês)",
        Valor: formatCurrency(topIndicators.totalDailyRates.month.value),
      },
      {
        Campo: "Variação Diárias (Mês)",
        Valor: formatPercentage(topIndicators.totalDailyRates.month.variation),
      },
      {
        Campo: "Total Diárias (Ano)",
        Valor: formatCurrency(topIndicators.totalDailyRates.year.value),
      },
      {
        Campo: "Variação Diárias (Ano)",
        Valor: formatPercentage(topIndicators.totalDailyRates.year.variation),
      },
      {
        Campo: "Contratos (Mês)",
        Valor: topIndicators.totalContracts.month.count.toString(),
      },
      {
        Campo: "Contratos (Ano)",
        Valor: topIndicators.totalContracts.year.count.toString(),
      },
      {
        Campo: "Ticket Médio Casa",
        Valor: formatCurrency(topIndicators.averageTicket.byHouse),
      },
      {
        Campo: "Ticket Médio Fornecedor",
        Valor: formatCurrency(topIndicators.averageTicket.bySupplier),
      },
      {
        Campo: "Ticket Médio Concierge",
        Valor: formatCurrency(topIndicators.averageTicket.byConcierge),
      },
      {
        Campo: "Ticket Médio Total",
        Valor: formatCurrency(topIndicators.averageTicket.total),
      },
    ]);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumo");

    // ABA 2: Reservas Futuras
    if (topIndicators.futureReservations.reservations.length > 0) {
      const reservationsSheet = XLSX.utils.json_to_sheet(
        topIndicators.futureReservations.reservations.map((res) => ({
          Cliente: res.clientName,
          Casa: res.houseName,
          "Check-in": new Date(res.checkInDate).toLocaleDateString("pt-BR"),
          "Check-out": new Date(res.checkOutDate).toLocaleDateString("pt-BR"),
          Noites: res.numberOfNights,
          "Valor Contrato": formatCurrency(res.contractValue),
        }))
      );
      XLSX.utils.book_append_sheet(
        workbook,
        reservationsSheet,
        "Reservas Futuras"
      );
    }

    // ABA 3: Dados Financeiros
    const financialSheet = XLSX.utils.json_to_sheet([
      { Métrica: "VENDAS TOTAIS", Atual: "", Anterior: "", Variação: "" },
      {
        Métrica: "Valor Atual",
        Atual: formatCurrency(financialData.totalSales.current),
        Anterior: formatCurrency(financialData.totalSales.previous),
        Variação: formatPercentage(financialData.totalSales.variation),
      },
      { Métrica: "", Atual: "", Anterior: "", Variação: "" },
      { Métrica: "COMISSÕES TOTAIS", Atual: "", Anterior: "", Variação: "" },
      {
        Métrica: "Valor Atual",
        Atual: formatCurrency(financialData.totalCommissions.current),
        Anterior: formatCurrency(financialData.totalCommissions.previous),
        Variação: formatPercentage(financialData.totalCommissions.variation),
      },
      { Métrica: "", Atual: "", Anterior: "", Variação: "" },
      {
        Métrica: "COMISSÕES FORNECEDORES",
        Atual: "",
        Anterior: "",
        Variação: "",
      },
      {
        Métrica: "Valor Atual",
        Atual: formatCurrency(financialData.supplierCommissions.current),
        Anterior: formatCurrency(financialData.supplierCommissions.previous),
        Variação: formatPercentage(financialData.supplierCommissions.variation),
      },
      { Métrica: "", Atual: "", Anterior: "", Variação: "" },
      { Métrica: "CONCIERGE", Atual: "", Anterior: "", Variação: "" },
      {
        Métrica: "Valor Atual",
        Atual: formatCurrency(financialData.concierge.current),
        Anterior: formatCurrency(financialData.concierge.previous),
        Variação: formatPercentage(financialData.concierge.variation),
      },
      { Métrica: "", Atual: "", Anterior: "", Variação: "" },
      {
        Métrica: "PAGAMENTOS CAMAREIRAS",
        Atual: "",
        Anterior: "",
        Variação: "",
      },
      {
        Métrica: "Valor Atual",
        Atual: formatCurrency(financialData.housekeeperPayments.current),
        Anterior: formatCurrency(financialData.housekeeperPayments.previous),
        Variação: formatPercentage(financialData.housekeeperPayments.variation),
      },
      { Métrica: "", Atual: "", Anterior: "", Variação: "" },
      { Métrica: "MARGEM DE CONTRIBUIÇÃO", Atual: "", Anterior: "", Variação: "" },
      {
        Métrica: "Valor Atual",
        Atual: formatCurrency(financialData.contributionMargin.total.current),
        Anterior: formatCurrency(financialData.contributionMargin.total.previous),
        Variação: formatPercentage(
          financialData.contributionMargin.total.variation
        ),
      },
    ]);
    XLSX.utils.book_append_sheet(workbook, financialSheet, "Dados Financeiros");

    // ABA 4: Margem por Casa
    if (financialData.contributionMargin.byHouse.length > 0) {
      const marginSheet = XLSX.utils.json_to_sheet(
        financialData.contributionMargin.byHouse.map((house) => ({
          Casa: house.houseName,
          "Receita Total": formatCurrency(house.totalRevenue),
          "Custos Totais": formatCurrency(house.totalCosts),
          Margem: formatCurrency(house.margin),
          "Margem %": formatPercentage(house.marginPercentage),
        }))
      );
      XLSX.utils.book_append_sheet(workbook, marginSheet, "Margem por Casa");
    }

    // ABA 5: Vendas por Mídia
    if (commercialData.salesByMedia.length > 0) {
      const mediaSheet = XLSX.utils.json_to_sheet(
        commercialData.salesByMedia.map((media) => ({
          Origem: media.sourceLabel,
          Quantidade: media.count,
          Percentual: formatPercentage(media.percentage),
          Receita: formatCurrency(media.revenue),
        }))
      );
      XLSX.utils.book_append_sheet(workbook, mediaSheet, "Vendas por Mídia");
    }

    // ABA 6: Vendas por Gênero
    if (commercialData.salesByGender.length > 0) {
      const genderSheet = XLSX.utils.json_to_sheet(
        commercialData.salesByGender.map((gender) => ({
          Gênero: gender.genderLabel,
          Quantidade: gender.count,
          Percentual: formatPercentage(gender.percentage),
          Receita: formatCurrency(gender.revenue),
        }))
      );
      XLSX.utils.book_append_sheet(workbook, genderSheet, "Vendas por Gênero");
    }

    // ABA 7: Taxa de Ocupação
    if (commercialData.occupancyRate.length > 0) {
      const occupancySheet = XLSX.utils.json_to_sheet(
        commercialData.occupancyRate.map((item) => ({
          Mês: item.month,
          Ano: item.year,
          "Dias Totais": item.totalDays,
          "Dias Ocupados": item.occupiedDays,
          "Taxa de Ocupação": formatPercentage(item.rate),
          Receita: formatCurrency(item.revenue),
        }))
      );
      XLSX.utils.book_append_sheet(workbook, occupancySheet, "Taxa de Ocupação");
    }

    // ABA 8: Gráfico de Vendas (dados tabulares)
    if (financialData.totalSales.chartData.length > 0) {
      const salesChartSheet = XLSX.utils.json_to_sheet(
        financialData.totalSales.chartData.map((point) => ({
          Período: point.label || point.period,
          Valor: formatCurrency(point.value),
        }))
      );
      XLSX.utils.book_append_sheet(
        workbook,
        salesChartSheet,
        "Evolução de Vendas"
      );
    }

    // ABA 9: Gráfico de Comissões (dados tabulares)
    if (financialData.totalCommissions.chartData.length > 0) {
      const commissionsChartSheet = XLSX.utils.json_to_sheet(
        financialData.totalCommissions.chartData.map((point) => ({
          Período: point.label || point.period,
          Valor: formatCurrency(point.value),
        }))
      );
      XLSX.utils.book_append_sheet(
        workbook,
        commissionsChartSheet,
        "Evolução de Comissões"
      );
    }

    XLSX.writeFile(workbook, filename);
  },

  // Exportar Dashboard de Estatísticas
  exportDashboardStatistics(
    jetpackStats: JetpackStats | null,
    instagramStats: InstagramStats | null,
    filters: StatisticsFilters,
    filename: string = "dashboard-estatisticas.xlsx"
  ) {
    if (!jetpackStats || !instagramStats) {
      throw new Error("Dados insuficientes para exportação");
    }

    const workbook = XLSX.utils.book_new();

    // Helper para período
    const getPeriodLabel = () => {
      if (filters.period === "month") return "Mensal";
      if (filters.period === "year") return "Anual";
      if (filters.startDate && filters.endDate) {
        return `${filters.startDate} a ${filters.endDate}`;
      }
      return "Personalizado";
    };

    // ABA 1: Resumo Executivo
    const summarySheet = XLSX.utils.json_to_sheet([
      { Campo: "DASHBOARD DE ESTATÍSTICAS", Valor: "" },
      { Campo: "Período", Valor: getPeriodLabel() },
      { Campo: "Data de Geração", Valor: new Date().toLocaleString("pt-BR") },
      { Campo: "", Valor: "" },
      { Campo: "JETPACK STATS - RESUMO", Valor: "" },
      {
        Campo: "Visualizações (Atual)",
        Valor: jetpackStats.views.current.toLocaleString("pt-BR"),
      },
      {
        Campo: "Visualizações (Anterior)",
        Valor: jetpackStats.views.previous.toLocaleString("pt-BR"),
      },
      {
        Campo: "Variação Visualizações",
        Valor: formatPercentage(jetpackStats.views.variation),
      },
      {
        Campo: "Visitantes (Atual)",
        Valor: jetpackStats.visitors.current.toLocaleString("pt-BR"),
      },
      {
        Campo: "Visitantes (Anterior)",
        Valor: jetpackStats.visitors.previous.toLocaleString("pt-BR"),
      },
      {
        Campo: "Variação Visitantes",
        Valor: formatPercentage(jetpackStats.visitors.variation),
      },
      {
        Campo: "Curtidas (Atual)",
        Valor: jetpackStats.likes.current.toLocaleString("pt-BR"),
      },
      {
        Campo: "Comentários (Atual)",
        Valor: jetpackStats.comments.current.toLocaleString("pt-BR"),
      },
      { Campo: "", Valor: "" },
      { Campo: "INSTAGRAM STATS - RESUMO", Valor: "" },
      {
        Campo: "Visualizações (Atual)",
        Valor: instagramStats.views.current.toLocaleString("pt-BR"),
      },
      {
        Campo: "Variação Visualizações",
        Valor: formatPercentage(instagramStats.views.variation),
      },
      {
        Campo: "Não Seguidores (%)",
        Valor: formatPercentage(instagramStats.views.nonFollowersPercentage),
      },
      {
        Campo: "Seguidores (Atual)",
        Valor: instagramStats.followers.current.toLocaleString("pt-BR"),
      },
      {
        Campo: "Ganhos no Período",
        Valor: instagramStats.followers.gainedThisMonth.toLocaleString("pt-BR"),
      },
      {
        Campo: "Taxa de Engajamento",
        Valor: formatPercentage(instagramStats.engagement.engagementRate),
      },
      {
        Campo: "Investimento Total",
        Valor: formatCurrency(instagramStats.paidTraffic.totalInvested),
      },
      {
        Campo: "ROI Tráfego Pago",
        Valor: formatPercentage(instagramStats.paidTraffic.roi),
      },
    ]);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumo");

    // ABA 2: Jetpack - Páginas Principais
    if (jetpackStats.topPages.length > 0) {
      const topPagesSheet = XLSX.utils.json_to_sheet(
        jetpackStats.topPages.map((page) => ({
          Página: page.page,
          URL: page.url,
          Visualizações: page.views.toLocaleString("pt-BR"),
        }))
      );
      XLSX.utils.book_append_sheet(
        workbook,
        topPagesSheet,
        "Jetpack - Páginas"
      );
    }

    // ABA 3: Jetpack - Principais Referências
    if (jetpackStats.topReferrers.length > 0) {
      const topReferrersSheet = XLSX.utils.json_to_sheet(
        jetpackStats.topReferrers.map((ref) => ({
          Referência: ref.referrer,
          Visualizações: ref.views.toLocaleString("pt-BR"),
        }))
      );
      XLSX.utils.book_append_sheet(
        workbook,
        topReferrersSheet,
        "Jetpack - Referências"
      );
    }

    // ABA 4: Instagram - Performance
    const instagramPerformanceSheet = XLSX.utils.json_to_sheet([
      { Métrica: "VISUALIZAÇÕES", Valor: "" },
      {
        Métrica: "Atual",
        Valor: instagramStats.views.current.toLocaleString("pt-BR"),
      },
      {
        Métrica: "Anterior",
        Valor: instagramStats.views.previous.toLocaleString("pt-BR"),
      },
      {
        Métrica: "Variação",
        Valor: formatPercentage(instagramStats.views.variation),
      },
      {
        Métrica: "Não Seguidores",
        Valor: instagramStats.views.nonFollowersViews.toLocaleString("pt-BR"),
      },
      {
        Métrica: "% Não Seguidores",
        Valor: formatPercentage(instagramStats.views.nonFollowersPercentage),
      },
      { Métrica: "", Valor: "" },
      { Métrica: "SEGUIDORES", Valor: "" },
      {
        Métrica: "Atual",
        Valor: instagramStats.followers.current.toLocaleString("pt-BR"),
      },
      {
        Métrica: "Anterior",
        Valor: instagramStats.followers.previous.toLocaleString("pt-BR"),
      },
      {
        Métrica: "Variação",
        Valor: formatPercentage(instagramStats.followers.variation),
      },
      {
        Métrica: "Ganhos no Período",
        Valor: instagramStats.followers.gainedThisMonth.toLocaleString("pt-BR"),
      },
    ]);
    XLSX.utils.book_append_sheet(
      workbook,
      instagramPerformanceSheet,
      "Instagram - Performance"
    );

    // ABA 5: Instagram - Engajamento
    const engagementSheet = XLSX.utils.json_to_sheet([
      {
        Métrica: "Curtidas",
        Valor: instagramStats.engagement.likes.toLocaleString("pt-BR"),
      },
      {
        Métrica: "Comentários",
        Valor: instagramStats.engagement.comments.toLocaleString("pt-BR"),
      },
      {
        Métrica: "Salvamentos",
        Valor: instagramStats.engagement.saves.toLocaleString("pt-BR"),
      },
      {
        Métrica: "Compartilhamentos",
        Valor: instagramStats.engagement.shares.toLocaleString("pt-BR"),
      },
      {
        Métrica: "Taxa de Engajamento",
        Valor: formatPercentage(instagramStats.engagement.engagementRate),
      },
    ]);
    XLSX.utils.book_append_sheet(
      workbook,
      engagementSheet,
      "Instagram - Engajamento"
    );

    // ABA 6: Instagram - Tráfego Pago
    const paidTrafficSheet = XLSX.utils.json_to_sheet([
      {
        Métrica: "Investimento Total",
        Valor: formatCurrency(instagramStats.paidTraffic.totalInvested),
      },
      {
        Métrica: "Visualizações Geradas",
        Valor: instagramStats.paidTraffic.viewsFromPaid.toLocaleString("pt-BR"),
      },
      {
        Métrica: "Seguidores Ganhos",
        Valor: instagramStats.paidTraffic.followersFromPaid.toLocaleString(
          "pt-BR"
        ),
      },
      {
        Métrica: "Contratos Gerados",
        Valor: instagramStats.paidTraffic.contractsFromInstagram.toLocaleString(
          "pt-BR"
        ),
      },
      {
        Métrica: "Custo por Visualização",
        Valor: formatCurrency(instagramStats.paidTraffic.costPerView),
      },
      {
        Métrica: "Custo por Seguidor",
        Valor: formatCurrency(instagramStats.paidTraffic.costPerFollower),
      },
      {
        Métrica: "Custo por Contrato",
        Valor: formatCurrency(instagramStats.paidTraffic.costPerContract),
      },
      {
        Métrica: "ROI (Retorno sobre Investimento)",
        Valor: formatPercentage(instagramStats.paidTraffic.roi),
      },
    ]);
    XLSX.utils.book_append_sheet(
      workbook,
      paidTrafficSheet,
      "Instagram - Tráfego Pago"
    );

    // ABA 7: Instagram - Top Postagens
    if (instagramStats.topPosts.length > 0) {
      const topPostsSheet = XLSX.utils.json_to_sheet(
        instagramStats.topPosts.map((post, index) => ({
          "#": index + 1,
          Legenda: post.caption,
          Visualizações: post.views.toLocaleString("pt-BR"),
          Curtidas: post.likes.toLocaleString("pt-BR"),
          Comentários: post.comments.toLocaleString("pt-BR"),
          "Taxa de Engajamento": formatPercentage(post.engagementRate),
        }))
      );
      XLSX.utils.book_append_sheet(
        workbook,
        topPostsSheet,
        "Instagram - Top Posts"
      );
    }

    // ABA 8: Jetpack - Evolução de Visualizações
    if (jetpackStats.views.chartData.length > 0) {
      const viewsChartSheet = XLSX.utils.json_to_sheet(
        jetpackStats.views.chartData.map((point) => ({
          Período: point.label || point.period,
          Visualizações: point.value.toLocaleString("pt-BR"),
        }))
      );
      XLSX.utils.book_append_sheet(
        workbook,
        viewsChartSheet,
        "Jetpack - Evolução Views"
      );
    }

    // ABA 9: Jetpack - Evolução de Visitantes
    if (jetpackStats.visitors.chartData.length > 0) {
      const visitorsChartSheet = XLSX.utils.json_to_sheet(
        jetpackStats.visitors.chartData.map((point) => ({
          Período: point.label || point.period,
          Visitantes: point.value.toLocaleString("pt-BR"),
        }))
      );
      XLSX.utils.book_append_sheet(
        workbook,
        visitorsChartSheet,
        "Jetpack - Evolução Visits"
      );
    }

    // ABA 10: Instagram - Evolução de Visualizações
    if (instagramStats.views.chartData.length > 0) {
      const instaViewsChartSheet = XLSX.utils.json_to_sheet(
        instagramStats.views.chartData.map((point) => ({
          Período: point.label || point.period,
          Visualizações: point.value.toLocaleString("pt-BR"),
        }))
      );
      XLSX.utils.book_append_sheet(
        workbook,
        instaViewsChartSheet,
        "Instagram - Evolução Views"
      );
    }

    // ABA 11: Instagram - Evolução de Seguidores
    if (instagramStats.followers.chartData.length > 0) {
      const instaFollowersChartSheet = XLSX.utils.json_to_sheet(
        instagramStats.followers.chartData.map((point) => ({
          Período: point.label || point.period,
          Seguidores: point.value.toLocaleString("pt-BR"),
        }))
      );
      XLSX.utils.book_append_sheet(
        workbook,
        instaFollowersChartSheet,
        "Instagram - Evolução Seg"
      );
    }

    // ABA 12: Instagram - Evolução Investimento
    if (instagramStats.paidTraffic.chartData.length > 0) {
      const paidTrafficChartSheet = XLSX.utils.json_to_sheet(
        instagramStats.paidTraffic.chartData.map((point) => ({
          Período: point.label || point.period,
          Investimento: formatCurrency(point.value),
        }))
      );
      XLSX.utils.book_append_sheet(
        workbook,
        paidTrafficChartSheet,
        "Instagram - Invest Pago"
      );
    }

    XLSX.writeFile(workbook, filename);
  },

  // Exportar Dashboard de Processos
  exportDashboardProcesses(
    dashboardData: ProcessDashboardData | null,
    filters: ProcessFilters,
    filename: string = "dashboard-processos.xlsx"
  ) {
    if (!dashboardData) {
      throw new Error("Dados insuficientes para exportação");
    }

    const workbook = XLSX.utils.book_new();

    // Helper para formatações
    const formatDate = (date: Date | undefined) => {
      if (!date) return "-";
      return new Date(date).toLocaleString("pt-BR");
    };

    const formatDateOnly = (date: Date | undefined) => {
      if (!date) return "-";
      return new Date(date).toLocaleDateString("pt-BR");
    };

    const getStatusLabel = (status: string) => {
      const labels: Record<string, string> = {
        pending: "Pendente",
        in_progress: "Em Andamento",
        completed: "Concluído",
        cancelled: "Cancelado",
        confirmed: "Confirmado",
      };
      return labels[status] || status;
    };

    const getPriorityLabel = (priority: string) => {
      const labels: Record<string, string> = {
        low: "Baixa",
        medium: "Média",
        high: "Alta",
        urgent: "Urgente",
      };
      return labels[priority] || priority;
    };

    const getStepLabel = (step: string) => {
      const labels: Record<string, string> = {
        menu_sent: "Cardápio Enviado",
        menu_received: "Cardápio Recebido",
        shopping_list: "Lista de Compras",
        client_approval: "Aprovação Cliente",
        supplier_sent: "Enviado Fornecedor",
        payment_sent: "Pagamento Enviado",
        invoices_received: "Notas Recebidas",
        receipts_sent: "Comprovantes Enviados",
      };
      return labels[step] || step;
    };

    // ABA 1: Resumo Executivo
    const summarySheet = XLSX.utils.json_to_sheet([
      { Campo: "DASHBOARD DE PROCESSOS", Valor: "" },
      {
        Campo: "Período",
        Valor: `${formatDateOnly(filters.dateRange.start)} a ${formatDateOnly(
          filters.dateRange.end
        )}`,
      },
      { Campo: "Data de Geração", Valor: new Date().toLocaleString("pt-BR") },
      { Campo: "", Valor: "" },
      { Campo: "MÉTRICAS PRINCIPAIS", Valor: "" },
      {
        Campo: "Total de Reservas",
        Valor: dashboardData.metrics.totalReservations.toString(),
      },
      {
        Campo: "Processos Ativos",
        Valor: dashboardData.metrics.activeConciergeProcesses.toString(),
      },
      {
        Campo: "Processos Concluídos",
        Valor: dashboardData.metrics.completedProcesses.toString(),
      },
      {
        Campo: "Processos Atrasados",
        Valor: dashboardData.metrics.overdueProcesses.toString(),
      },
      {
        Campo: "Tempo Médio (horas)",
        Valor: dashboardData.metrics.averageProcessTime.toFixed(1),
      },
      {
        Campo: "Taxa de Conclusão",
        Valor: formatPercentage(dashboardData.metrics.completionRate),
      },
      { Campo: "", Valor: "" },
      { Campo: "ESTE MÊS", Valor: "" },
      {
        Campo: "Novas Reservas",
        Valor: dashboardData.metrics.thisMonth.newReservations.toString(),
      },
      {
        Campo: "Processos Concluídos",
        Valor: dashboardData.metrics.thisMonth.completedProcesses.toString(),
      },
      {
        Campo: "Tempo Médio (horas)",
        Valor: dashboardData.metrics.thisMonth.averageTime.toFixed(1),
      },
      { Campo: "", Valor: "" },
      { Campo: "MÊS ANTERIOR", Valor: "" },
      {
        Campo: "Novas Reservas",
        Valor: dashboardData.metrics.lastMonth.newReservations.toString(),
      },
      {
        Campo: "Processos Concluídos",
        Valor: dashboardData.metrics.lastMonth.completedProcesses.toString(),
      },
      {
        Campo: "Tempo Médio (horas)",
        Valor: dashboardData.metrics.lastMonth.averageTime.toFixed(1),
      },
    ]);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumo");

    // ABA 2: Reservas Futuras
    if (dashboardData.reservations.length > 0) {
      const reservationsSheet = XLSX.utils.json_to_sheet(
        dashboardData.reservations.map((res) => ({
          Cliente: res.clientName,
          Email: res.clientEmail,
          Telefone: res.clientPhone,
          Casa: res.houseName,
          "Check-in": formatDateOnly(res.checkIn),
          "Check-out": formatDateOnly(res.checkOut),
          Dias: res.totalDays,
          "Valor Total": formatCurrency(res.totalValue),
          "Concierge Requerido": res.conciergeRequired ? "Sim" : "Não",
          Status: getStatusLabel(res.status),
          "Criado em": formatDate(res.createdAt),
        }))
      );
      XLSX.utils.book_append_sheet(
        workbook,
        reservationsSheet,
        "Reservas Futuras"
      );
    }

    // ABA 3: Processos de Concierge
    if (dashboardData.conciergeProcesses.length > 0) {
      const processesSheet = XLSX.utils.json_to_sheet(
        dashboardData.conciergeProcesses.map((process) => ({
          ID: process.id,
          Cliente: process.clientName,
          Casa: process.houseName,
          "Check-in": formatDateOnly(process.checkIn),
          "Check-out": formatDateOnly(process.checkOut),
          "Etapa Atual": getStepLabel(process.currentStep),
          Status: getStatusLabel(process.status),
          Prioridade: getPriorityLabel(process.priority),
          "Duração Total (h)": process.metrics.totalDuration.toFixed(1),
          "Etapas Concluídas": `${process.metrics.completedSteps}/${process.metrics.totalSteps}`,
          "Etapas Atrasadas": process.metrics.overdueSteps,
          "Criado em": formatDate(process.createdAt),
          "Atualizado em": formatDate(process.updatedAt),
        }))
      );
      XLSX.utils.book_append_sheet(
        workbook,
        processesSheet,
        "Processos Concierge"
      );
    }

    // ABA 4: Detalhamento de Etapas
    if (dashboardData.conciergeProcesses.length > 0) {
      const stepsData: any[] = [];
      dashboardData.conciergeProcesses.forEach((process) => {
        // Adicionar cabeçalho do processo
        stepsData.push({
          Processo: `${process.clientName} - ${process.houseName}`,
          Etapa: "",
          Concluída: "",
          "Data Conclusão": "",
          Observações: "",
        });

        // Adicionar cada etapa
        const steps = [
          { key: "menuSent", label: "Cardápio Enviado", data: process.steps.menuSent },
          { key: "menuReceived", label: "Cardápio Recebido", data: process.steps.menuReceived },
          { key: "shoppingList", label: "Lista de Compras", data: process.steps.shoppingList },
          { key: "clientApproval", label: "Aprovação Cliente", data: process.steps.clientApproval },
          { key: "supplierSent", label: "Enviado Fornecedor", data: process.steps.supplierSent },
          { key: "paymentSent", label: "Pagamento Enviado", data: process.steps.paymentSent },
          { key: "invoicesReceived", label: "Notas Recebidas", data: process.steps.invoicesReceived },
          { key: "receiptsSent", label: "Comprovantes Enviados", data: process.steps.receiptsSent },
        ];

        steps.forEach(({ label, data }) => {
          stepsData.push({
            Processo: "",
            Etapa: label,
            Concluída: data.completed ? "Sim" : "Não",
            "Data Conclusão": formatDate(data.completedAt),
            Observações: data.notes || "-",
          });
        });

        // Linha em branco
        stepsData.push({
          Processo: "",
          Etapa: "",
          Concluída: "",
          "Data Conclusão": "",
          Observações: "",
        });
      });

      const stepsSheet = XLSX.utils.json_to_sheet(stepsData);
      XLSX.utils.book_append_sheet(workbook, stepsSheet, "Detalhamento Etapas");
    }

    // ABA 5: Performance por Casa
    if (dashboardData.metrics.byHouse.length > 0) {
      const houseSheet = XLSX.utils.json_to_sheet(
        dashboardData.metrics.byHouse.map((house) => ({
          Casa: house.houseName,
          "Total Processos": house.totalProcesses,
          "Processos Concluídos": house.completedProcesses,
          "Tempo Médio (h)": house.averageTime.toFixed(1),
          "Taxa de Conclusão": formatPercentage(house.completionRate),
        }))
      );
      XLSX.utils.book_append_sheet(workbook, houseSheet, "Performance por Casa");
    }

    // ABA 6: Performance por Etapa
    if (dashboardData.charts.stepPerformance.length > 0) {
      const stepPerfSheet = XLSX.utils.json_to_sheet(
        dashboardData.charts.stepPerformance.map((step) => ({
          Etapa: step.stepLabel,
          "Tempo Médio (h)": step.averageTime.toFixed(1),
          "Taxa de Conclusão": formatPercentage(step.completionRate),
          "Total de Processos": step.totalProcesses,
        }))
      );
      XLSX.utils.book_append_sheet(
        workbook,
        stepPerfSheet,
        "Performance por Etapa"
      );
    }

    // ABA 7: Notificações
    if (dashboardData.notifications.length > 0) {
      const notificationsSheet = XLSX.utils.json_to_sheet(
        dashboardData.notifications.map((notif) => ({
          Tipo: notif.type.replace("_", " "),
          Título: notif.title,
          Mensagem: notif.message,
          Prioridade: getPriorityLabel(notif.priority),
          Lida: notif.isRead ? "Sim" : "Não",
          "Ação Requerida": notif.actionRequired ? "Sim" : "Não",
          "Criada em": formatDate(notif.createdAt),
          "Agendada para": formatDate(notif.scheduledFor),
        }))
      );
      XLSX.utils.book_append_sheet(
        workbook,
        notificationsSheet,
        "Notificações"
      );
    }

    // ABA 8: Evolução de Conclusão
    if (dashboardData.charts.processCompletion.length > 0) {
      const completionChartSheet = XLSX.utils.json_to_sheet(
        dashboardData.charts.processCompletion.map((point) => ({
          Data: point.date,
          Concluídos: point.completed,
          Pendentes: point.pending,
          Atrasados: point.overdue,
        }))
      );
      XLSX.utils.book_append_sheet(
        workbook,
        completionChartSheet,
        "Evolução Conclusão"
      );
    }

    XLSX.writeFile(workbook, filename);
  },

  // Exportar Dashboard de Metas
  exportDashboardGoals(
    dashboardData: GoalsDashboardData,
    filters: GoalFilters,
    filename: string = "dashboard-metas.xlsx"
  ) {
    if (!dashboardData) {
      throw new Error("Dados do dashboard não fornecidos");
    }

    const workbook = XLSX.utils.book_new();

    const getStatusLabel = (status: GoalStatus): string => {
      const labels = {
        below_target: "Abaixo da Meta",
        on_track: "No Caminho",
        exceeded: "Meta Superada",
      };
      return labels[status] || status;
    };

    const getPeriodLabel = (period: string): string => {
      const labels = {
        monthly: "Mensal",
        quarterly: "Trimestral",
        annual: "Anual",
      };
      return labels[period as keyof typeof labels] || period;
    };

    // ABA 1: Resumo
    const summaryData = [
      { Campo: "Ano", Valor: filters.year },
      { Campo: "Período", Valor: getPeriodLabel(filters.period) },
      {
        Campo: "Meta Total Anual",
        Valor: formatCurrency(dashboardData.annualThermometer.totalGoal),
      },
      {
        Campo: "Total Realizado",
        Valor: formatCurrency(dashboardData.annualThermometer.totalAchieved),
      },
      {
        Campo: "Percentual de Atingimento",
        Valor: formatPercentage(dashboardData.annualThermometer.percentage),
      },
      {
        Campo: "Status Geral",
        Valor: getStatusLabel(dashboardData.annualThermometer.status),
      },
      {
        Campo: "Categorias Monitoradas",
        Valor: filters.categories.join(", "),
      },
      {
        Campo: "Última Atualização",
        Valor: dashboardData.lastUpdate.toLocaleString("pt-BR"),
      },
    ];

    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumo");

    // ABA 2: Termômetro Anual
    const thermometerSheet = XLSX.utils.json_to_sheet(
      dashboardData.annualThermometer.categories.map((cat) => ({
        Categoria: cat.categoryLabel,
        Meta: formatCurrency(cat.goal),
        Realizado: formatCurrency(cat.achieved),
        "Percentual (%)": formatPercentage(cat.percentage),
        Status: getStatusLabel(cat.status),
        Diferença: formatCurrency(cat.difference),
        "% da Receita Total": cat.revenuePercentage
          ? formatPercentage(cat.revenuePercentage)
          : "-",
      }))
    );
    XLSX.utils.book_append_sheet(
      workbook,
      thermometerSheet,
      "Termômetro Anual"
    );

    // ABA 3: Dados Mensais
    if (dashboardData.monthlyData.length > 0) {
      const monthlySheet = XLSX.utils.json_to_sheet(
        dashboardData.monthlyData.map((monthly) => ({
          Mês: monthly.monthLabel,
          "Meta: Vendas Locação": formatCurrency(monthly.goals.rentalSales),
          "Realizado: Vendas Locação": formatCurrency(
            monthly.achieved.rentalSales
          ),
          "Meta: Qtd Contratos": monthly.goals.contractsQuantity,
          "Realizado: Qtd Contratos": monthly.achieved.contractsQuantity,
          "Meta: Comissão Fornecedor": formatCurrency(
            monthly.goals.supplierCommission
          ),
          "Realizado: Comissão Fornecedor": formatCurrency(
            monthly.achieved.supplierCommission
          ),
          "Meta: Concierge": formatCurrency(monthly.goals.concierge),
          "Realizado: Concierge": formatCurrency(monthly.achieved.concierge),
          "Meta: Vendas de Imóveis": formatCurrency(monthly.goals.houseSales),
          "Realizado: Vendas de Imóveis": formatCurrency(
            monthly.achieved.houseSales
          ),
          "Receita Total": formatCurrency(monthly.totalRevenue),
        }))
      );
      XLSX.utils.book_append_sheet(workbook, monthlySheet, "Dados Mensais");
    }

    // ABA 4: Breakdown por Categoria (das comparações mensais agregadas)
    if (dashboardData.monthlyData.length > 0) {
      const categoryBreakdown: {
        [category: string]: {
          totalGoal: number;
          totalAchieved: number;
          count: number;
        };
      } = {};

      dashboardData.monthlyData.forEach((monthly) => {
        monthly.comparisons.forEach((comp) => {
          if (!categoryBreakdown[comp.categoryLabel]) {
            categoryBreakdown[comp.categoryLabel] = {
              totalGoal: 0,
              totalAchieved: 0,
              count: 0,
            };
          }
          categoryBreakdown[comp.categoryLabel].totalGoal += comp.goal;
          categoryBreakdown[comp.categoryLabel].totalAchieved += comp.achieved;
          categoryBreakdown[comp.categoryLabel].count += 1;
        });
      });

      const breakdownData = Object.entries(categoryBreakdown).map(
        ([category, data]) => ({
          Categoria: category,
          "Meta Total": formatCurrency(data.totalGoal),
          "Realizado Total": formatCurrency(data.totalAchieved),
          "Percentual Médio": formatPercentage(
            (data.totalAchieved / data.totalGoal) * 100
          ),
          "Nº de Meses": data.count,
        })
      );

      const breakdownSheet = XLSX.utils.json_to_sheet(breakdownData);
      XLSX.utils.book_append_sheet(
        workbook,
        breakdownSheet,
        "Breakdown por Categoria"
      );
    }

    // ABA 5: Evolução Mensal
    if (dashboardData.chartsData.monthlyTrend.length > 0) {
      const trendSheet = XLSX.utils.json_to_sheet(
        dashboardData.chartsData.monthlyTrend.map((trend) => ({
          Mês: trend.month,
          "Meta: Vendas Locação": formatCurrency(trend.rentalSalesGoal),
          "Realizado: Vendas Locação": formatCurrency(
            trend.rentalSalesAchieved
          ),
          "Meta: Contratos": trend.contractsGoal,
          "Realizado: Contratos": trend.contractsAchieved,
          "Meta: Comissão": formatCurrency(trend.supplierCommissionGoal),
          "Realizado: Comissão": formatCurrency(
            trend.supplierCommissionAchieved
          ),
          "Meta: Concierge": formatCurrency(trend.conciergeGoal),
          "Realizado: Concierge": formatCurrency(trend.conciergeAchieved),
          "Meta: Vendas Imóveis": formatCurrency(trend.houseSalesGoal),
          "Realizado: Vendas Imóveis": formatCurrency(
            trend.houseSalesAchieved
          ),
        }))
      );
      XLSX.utils.book_append_sheet(workbook, trendSheet, "Evolução Mensal");
    }

    // ABA 6: Comparação por Categoria (do chartsData)
    if (dashboardData.chartsData.categoryComparison.length > 0) {
      const categoryCompSheet = XLSX.utils.json_to_sheet(
        dashboardData.chartsData.categoryComparison.map((cat) => ({
          Categoria: cat.category,
          Meta: formatCurrency(cat.goal),
          Realizado: formatCurrency(cat.achieved),
          "Percentual (%)": formatPercentage(cat.percentage),
        }))
      );
      XLSX.utils.book_append_sheet(
        workbook,
        categoryCompSheet,
        "Comparação Categorias"
      );
    }

    XLSX.writeFile(workbook, filename);
  },
};

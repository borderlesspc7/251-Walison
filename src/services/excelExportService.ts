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
};

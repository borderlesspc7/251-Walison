// Tipos para o módulo financeiro e relatórios

export interface RevenueByHouse {
  houseId: string;
  houseName: string;
  houseAddress: string;
  dailyRatesRevenue: number; // Receita de diárias (netValue)
  conciergeRevenue: number; // Receita de concierge
  suppliersCommission: number; // Comissões de fornecedores
  grossRevenue: number; // Receita bruta total
  expenses: number; // Despesas (governanta + comissão vendas)
  netRevenue: number; // Receita líquida (bruta - despesas)
  numberOfSales: number; // Quantidade de vendas
  numberOfNights: number; // Total de noites vendidas
}

export interface CashFlowEntry {
  period: string; // Formato: "2024-01" ou "01/01/2024"
  date: Date;
  cashIn: number; // Entradas (receitas totais)
  cashOut: number; // Saídas (despesas)
  balance: number; // Saldo do período
  accumulatedBalance: number; // Saldo acumulado
}

export interface ContractsReport {
  active: {
    count: number;
    totalRevenue: number;
    averageValue: number;
  };
  completed: {
    count: number;
    totalRevenue: number;
    averageValue: number;
  };
  pending: {
    count: number;
    totalRevenue: number;
  };
  cancelled: {
    count: number;
    lostRevenue: number;
  };
}

export interface RevenueBreakdown {
  dailyRates: {
    total: number;
    percentage: number;
  };
  concierge: {
    total: number;
    percentage: number;
  };
  suppliersCommission: {
    total: number;
    percentage: number;
  };
  totalRevenue: number;
}

export interface DemographicReport {
  category: string; // Nome da categoria (casa, gênero, localidade, origem)
  value: string; // Valor específico (ex: "Casa Beach", "Masculino", "Instagram")
  numberOfSales: number;
  totalRevenue: number;
  percentage: number;
  averageTicket: number;
}

export interface ComparativePeriod {
  label: string; // Ex: "Jan/2024"
  startDate: Date;
  endDate: Date;
  metrics: {
    totalSales: number;
    totalRevenue: number;
    dailyRates: number;
    concierge: number;
    suppliersCommission: number;
    averageTicket: number;
    numberOfNights: number;
  };
}

export interface ComparativeReport {
  period1: ComparativePeriod;
  period2: ComparativePeriod;
  comparison: {
    totalSales: ComparisonMetric;
    totalRevenue: ComparisonMetric;
    dailyRates: ComparisonMetric;
    concierge: ComparisonMetric;
    suppliersCommission: ComparisonMetric;
    averageTicket: ComparisonMetric;
    numberOfNights: ComparisonMetric;
  };
}

export interface ComparisonMetric {
  absoluteChange: number;
  percentageChange: number;
  trend: "up" | "down" | "neutral";
}

export interface TaxReport {
  company: "exclusive" | "giogio" | "direta";
  companyName: string;
  period: string;
  grossRevenue: number;
  taxableRevenue: number;
  taxRate: number; // Alíquota em %
  taxAmount: number; // Valor do imposto
  netRevenue: number; // Receita após impostos
}

export interface FinancialFilters {
  startDate?: Date;
  endDate?: Date;
  company?: "exclusive" | "giogio" | "direta" | "all";
  houseId?: string;
  reportType?:
    | "revenue-by-house"
    | "cash-flow"
    | "contracts"
    | "breakdown"
    | "demographic"
    | "comparative"
    | "tax";
  groupBy?: "day" | "month" | "quarter" | "year";
  demographicType?: "house" | "gender" | "location" | "origin";
  comparisonPeriod?: {
    period1Start: Date;
    period1End: Date;
    period2Start: Date;
    period2End: Date;
  };
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number; // Em %
  numberOfSales: number;
  averageTicket: number;
  dailyRatesRevenue: number;
  conciergeRevenue: number;
  suppliersCommissionRevenue: number;
}

// Tipos para exportação Excel
export interface ExcelExportData {
  sheetName: string;
  headers: string[];
  data: Array<Record<string, any>>;
  totals?: Record<string, any>;
}

export interface ExcelReport {
  filename: string;
  sheets: ExcelExportData[];
}

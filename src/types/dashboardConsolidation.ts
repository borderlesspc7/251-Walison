export interface DashboardFilters {
  period: "month" | "year";
  company: "all" | "exclusive" | "giogio" | "direta";
  houseId?: string;
  viewMode: "consolidated" | "individual";
  comparisonMode: "previous-month" | "previous-year";
  startDate?: string;
  endDate?: string;
}

export interface FutureReservation {
  id: string;
  clientName: string;
  houseName: string;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfNights: number;
  contractValue: number;
}

export interface TopIndicators {
  activeContracts: {
    count: number;
    variation: number; // % em relação ao período anterior
  };
  futureReservations: {
    count: number;
    reservations: FutureReservation[];
  };
  totalDailyRates: {
    month: {
      value: number;
      variation: number;
    };
    year: {
      value: number;
      variation: number;
    };
  };
  totalContracts: {
    month: {
      count: number;
      variation: number;
    };
    year: {
      count: number;
      variation: number;
    };
  };
  averageTicket: {
    byHouse: number;
    bySupplier: number;
    byConcierge: number;
    total: number;
  };
}

export interface FinancialData {
  totalSales: {
    current: number;
    previous: number;
    variation: number;
    chartData: ChartDataPoint[];
  };
  totalCommissions: {
    current: number;
    previous: number;
    variation: number;
    chartData: ChartDataPoint[];
  };
  supplierCommissions: {
    current: number;
    previous: number;
    variation: number;
  };
  concierge: {
    current: number;
    previous: number;
    variation: number;
  };
  housekeeperPayments: {
    current: number;
    previous: number;
    variation: number;
  };
  contributionMargin: {
    byHouse: ContributionMarginByHouse[];
    total: {
      current: number;
      previous: number;
      variation: number;
    };
  };
}

export interface ContributionMarginByHouse {
  houseId: string;
  houseName: string;
  totalRevenue: number;
  totalCosts: number;
  margin: number;
  marginPercentage: number;
}

// ===== INTELIGÊNCIA COMERCIAL =====
export interface CommercialIntelligence {
  salesByMedia: MediaAnalysis[];
  salesByGender: GenderAnalysis[];
  occupancyRate: OccupancyRateData[];
}

export interface MediaAnalysis {
  source:
    | "instagram"
    | "facebook"
    | "google"
    | "indicacao"
    | "whatsapp"
    | "site"
    | "outros";
  sourceLabel: string;
  count: number;
  percentage: number;
  revenue: number;
}

export interface GenderAnalysis {
  gender: "male" | "female" | "other" | "not_informed";
  genderLabel: string;
  count: number;
  percentage: number;
  revenue: number;
}

export interface OccupancyRateData {
  month: string;
  monthNumber: number;
  year: number;
  totalDays: number;
  occupiedDays: number;
  rate: number; // porcentagem
  revenue: number;
}

// ===== GRÁFICOS =====
export interface ChartDataPoint {
  period: string;
  value: number;
  label?: string;
}

export interface ChartConfig {
  type: "line" | "bar" | "pie" | "doughnut";
  title: string;
  height?: number;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
}

// ===== DADOS CONSOLIDADOS =====
export interface DashboardData {
  filters: DashboardFilters;
  topIndicators: TopIndicators;
  financialData: FinancialData;
  commercialIntelligence: CommercialIntelligence;
  lastUpdated: Date;
}

// ===== EXPORTAÇÃO =====
export interface ExportOptions {
  format: "excel" | "pdf" | "image";
  includeCharts: boolean;
  includeData: boolean;
  filename?: string;
}

// ===== COMPARAÇÕES =====
export interface ComparisonData {
  current: {
    period: string;
    data: unknown;
  };
  previous: {
    period: string;
    data: unknown;
  };
  variation: {
    absolute: number;
    percentage: number;
    trend: "up" | "down" | "neutral";
  };
}

// ===== HOUSES (para filtros) =====
export interface DashboardHouse {
  id: string;
  name: string;
  isActive: boolean;
}

// ===== PERÍODOS =====
export interface PeriodOption {
  value: string;
  label: string;
  startDate: Date;
  endDate: Date;
}

// ===== ESTATÍSTICAS RÁPIDAS =====
export interface QuickStats {
  totalRevenue: number;
  totalContracts: number;
  averageTicket: number;
  occupancyRate: number;
  topPerformingHouse: string;
  topMediaSource: string;
}

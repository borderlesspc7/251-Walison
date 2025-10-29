import { Timestamp } from "firebase/firestore";

export type GoalPeriod = "monthly" | "quarterly" | "annual";
export type GoalCategory =
  | "rental_sales"
  | "contracts_quantity"
  | "supplier_commission"
  | "concierge"
  | "house_sales";

export type GoalStatus = "below_target" | "on_track" | "exceeded";

export interface AnnualGoal {
  id: string;
  year: number;
  rentalSalesGoal: number;
  contractsQuantityGoal: number;
  supplierCommissionGoal: number;
  conciergeGoal: number;
  houseSalesGoal: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export interface MonthlyGoal {
  id: string;
  year: number;
  month: number;
  rentalSalesGoal: number;
  contractsQuantityGoal: number;
  supplierCommissionGoal: number;
  conciergeGoal: number;
  houseSalesGoal: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MonthlyAchievement {
  year: number;
  month: number;
  rentalSalesAchieved: number;
  contractsQuantityAchieved: number;
  supplierCommissionAchieved: number;
  conciergeAchieved: number;
  houseSalesAchieved: number;
  totalRevenue: number;
}

export interface GoalComparison {
  category: GoalCategory;
  categoryLabel: string;
  goal: number;
  achieved: number;
  percentage: number;
  status: GoalStatus;
  difference: number;
  revenuePercentage?: number;
}

export interface AnnualThermometer {
  year: number;
  totalGoal: number;
  totalAchieved: number;
  percentage: number;
  status: GoalStatus;
  categories: GoalComparison[];
}

export interface MonthlyGoalData {
  year: number;
  month: number;
  monthLabel: string;
  goals: {
    rentalSales: number;
    contractsQuantity: number;
    supplierCommission: number;
    concierge: number;
    houseSales: number;
  };
  achieved: {
    rentalSales: number;
    contractsQuantity: number;
    supplierCommission: number;
    concierge: number;
    houseSales: number;
  };
  comparisons: GoalComparison[];
  totalRevenue: number;
}

export interface GoalFilters {
  year: number;
  period: GoalPeriod;
  startMonth?: number;
  endMonth?: number;
  categories: GoalCategory[];
}

export interface MonthlyChartData {
  month: string;
  rentalSalesGoal: number;
  rentalSalesAchieved: number;
  contractsGoal: number;
  contractsAchieved: number;
  supplierCommissionGoal: number;
  supplierCommissionAchieved: number;
  conciergeGoal: number;
  conciergeAchieved: number;
  houseSalesGoal: number;
  houseSalesAchieved: number;
}

export interface CategoryChartData {
  category: string;
  goal: number;
  achieved: number;
  percentage: number;
}

export interface GoalsChartsData {
  monthlyTrend: MonthlyChartData[];
  categoryComparison: CategoryChartData[];
  thermometerData: {
    percentage: number;
    achieved: number;
    goal: number;
    remaining: number;
  };
}

export interface GoalsDashboardData {
  annualThermometer: AnnualThermometer;
  monthlyData: MonthlyGoalData[];
  chartsData: GoalsChartsData;
  filters: GoalFilters;
  lastUpdate: Date;
}

export interface GoalAction {
  type: "update_annual_goal" | "update_monthly_goal" | "export_report";
  userId: string;
  timestamp: Date;
  details: string;
}

export interface GoalReport {
  id: string;
  title: string;
  period: GoalPeriod;
  year: number;
  startMonth?: number;
  endMonth?: number;
  data: GoalsDashboardData;
  generatedAt: Date;
  generatedBy: string;
}

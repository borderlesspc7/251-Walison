import {
  collection,
  doc,
  getDocs,
  query,
  where,
  Timestamp,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import type {
  AnnualGoal,
  MonthlyGoal,
  MonthlyAchievement,
  GoalComparison,
  AnnualThermometer,
  MonthlyGoalData,
  GoalsChartsData,
  GoalsDashboardData,
  GoalFilters,
  GoalStatus,
  GoalCategory,
  MonthlyChartData,
  CategoryChartData,
} from "../types/dashboardGoals";

const MONTH_LABELS = [
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

const MONTH_LABELS_SHORT = [
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

const CATEGORY_LABELS: Record<GoalCategory, string> = {
  rental_sales: "Vendas de Locações",
  contracts_quantity: "Quantidade de Contratos",
  supplier_commission: "Comissão Fornecedores",
  concierge: "Concierge",
  house_sales: "Vendas de Casas",
};

const convertToTimestamp = (date: Date): Timestamp => Timestamp.fromDate(date);

const calculateGoalStatus = (achieved: number, goal: number): GoalStatus => {
  if (goal === 0) return "on_track";
  const percentage = (achieved / goal) * 100;
  if (percentage >= 100) return "exceeded";
  if (percentage >= 70) return "on_track";
  return "below_target";
};

export const getAnnualGoal = async (
  year: number
): Promise<AnnualGoal | null> => {
  try {
    const goalsRef = collection(db, "annualGoals");
    const q = query(goalsRef, where("year", "==", year));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as AnnualGoal;
  } catch (error) {
    console.error("Erro ao buscar meta anual:", error);
    throw new Error("Falha ao buscar meta anual");
  }
};

export const getMonthlyGoals = async (year: number): Promise<MonthlyGoal[]> => {
  try {
    const goalsRef = collection(db, "monthlyGoals");
    const q = query(goalsRef, where("year", "==", year));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MonthlyGoal[];
  } catch (error) {
    console.error("Erro ao buscar metas mensais:", error);
    throw new Error("Falha ao buscar metas mensais");
  }
};

export const calculateMonthlyAchievements = async (
  year: number,
  month: number
): Promise<MonthlyAchievement> => {
  try {
    const salesRef = collection(db, "sales");
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const salesQuery = query(
      salesRef,
      where("checkInDate", ">=", convertToTimestamp(startDate)),
      where("checkInDate", "<=", convertToTimestamp(endDate))
    );

    const salesSnapshot = await getDocs(salesQuery);

    let rentalSalesAchieved = 0;
    let contractsQuantityAchieved = 0;
    let supplierCommissionAchieved = 0;
    let conciergeAchieved = 0;
    let houseSalesAchieved = 0;
    let totalRevenue = 0;

    salesSnapshot.docs.forEach((doc) => {
      const sale = doc.data();

      const contractValue = sale.contractValue || 0;
      rentalSalesAchieved += contractValue;

      if (sale.status !== "cancelled") {
        contractsQuantityAchieved += 1;
      }

      const conciergeValue = sale.conciergeValue || 0;
      conciergeAchieved += conciergeValue;

      const additionalSales = sale.totalAdditionalSales || 0;
      houseSalesAchieved += additionalSales;

      const employeeCommission = sale.employeeCommission || 0;
      const salesCommission = sale.salesCommission || 0;
      supplierCommissionAchieved += employeeCommission + salesCommission;

      const revenue = sale.totalRevenue || 0;
      totalRevenue += revenue;
    });

    return {
      year,
      month,
      rentalSalesAchieved,
      contractsQuantityAchieved,
      supplierCommissionAchieved,
      conciergeAchieved,
      houseSalesAchieved,
      totalRevenue,
    };
  } catch (error) {
    console.error("Erro ao calcular realizados mensais:", error);
    throw new Error("Falha ao calcular realizados");
  }
};

export const compareGoalVsAchieved = (
  category: GoalCategory,
  goal: number,
  achieved: number,
  totalRevenue?: number
): GoalComparison => {
  const percentage = goal > 0 ? (achieved / goal) * 100 : 0;
  const difference = achieved - goal;
  const status = calculateGoalStatus(achieved, goal);

  const comparison: GoalComparison = {
    category,
    categoryLabel: CATEGORY_LABELS[category],
    goal,
    achieved,
    percentage,
    status,
    difference,
  };

  if (category === "house_sales" && totalRevenue && totalRevenue > 0) {
    comparison.revenuePercentage = (achieved / totalRevenue) * 100;
  }

  return comparison;
};

export const generateAnnualThermometer = async (
  year: number
): Promise<AnnualThermometer> => {
  try {
    const annualGoal = await getAnnualGoal(year);

    if (!annualGoal) {
      // Retorna dados vazios se não houver meta cadastrada
      return {
        year,
        totalGoal: 0,
        totalAchieved: 0,
        percentage: 0,
        status: "below_target",
        categories: [],
      };
    }

    let totalAchieved = 0;
    const categories: GoalComparison[] = [];

    const monthlyAchievements: MonthlyAchievement[] = [];
    for (let month = 1; month <= 12; month++) {
      const achievement = await calculateMonthlyAchievements(year, month);
      monthlyAchievements.push(achievement);
    }

    const rentalSalesTotal = monthlyAchievements.reduce(
      (sum, m) => sum + m.rentalSalesAchieved,
      0
    );
    const contractsTotal = monthlyAchievements.reduce(
      (sum, m) => sum + m.contractsQuantityAchieved,
      0
    );
    const supplierCommissionTotal = monthlyAchievements.reduce(
      (sum, m) => sum + m.supplierCommissionAchieved,
      0
    );
    const conciergeTotal = monthlyAchievements.reduce(
      (sum, m) => sum + m.conciergeAchieved,
      0
    );
    const houseSalesTotal = monthlyAchievements.reduce(
      (sum, m) => sum + m.houseSalesAchieved,
      0
    );
    const totalRevenueYear = monthlyAchievements.reduce(
      (sum, m) => sum + m.totalRevenue,
      0
    );

    categories.push(
      compareGoalVsAchieved(
        "rental_sales",
        annualGoal.rentalSalesGoal,
        rentalSalesTotal
      )
    );
    categories.push(
      compareGoalVsAchieved(
        "contracts_quantity",
        annualGoal.contractsQuantityGoal,
        contractsTotal
      )
    );
    categories.push(
      compareGoalVsAchieved(
        "supplier_commission",
        annualGoal.supplierCommissionGoal,
        supplierCommissionTotal
      )
    );
    categories.push(
      compareGoalVsAchieved(
        "concierge",
        annualGoal.conciergeGoal,
        conciergeTotal
      )
    );
    categories.push(
      compareGoalVsAchieved(
        "house_sales",
        annualGoal.houseSalesGoal,
        houseSalesTotal,
        totalRevenueYear
      )
    );

    const totalGoal =
      annualGoal.rentalSalesGoal +
      annualGoal.contractsQuantityGoal +
      annualGoal.supplierCommissionGoal +
      annualGoal.conciergeGoal +
      annualGoal.houseSalesGoal;

    totalAchieved =
      rentalSalesTotal +
      contractsTotal +
      supplierCommissionTotal +
      conciergeTotal +
      houseSalesTotal;

    const percentage = totalGoal > 0 ? (totalAchieved / totalGoal) * 100 : 0;
    const status = calculateGoalStatus(totalAchieved, totalGoal);

    return {
      year,
      totalGoal,
      totalAchieved,
      percentage,
      status,
      categories,
    };
  } catch (error) {
    console.error("Erro ao gerar termômetro anual:", error);
    // Retorna dados vazios em caso de erro
    return {
      year,
      totalGoal: 0,
      totalAchieved: 0,
      percentage: 0,
      status: "below_target",
      categories: [],
    };
  }
};

export const generateMonthlyGoalData = async (
  year: number,
  months: number[]
): Promise<MonthlyGoalData[]> => {
  try {
    const monthlyGoals = await getMonthlyGoals(year);
    const annualGoal = await getAnnualGoal(year);

    const monthlyData: MonthlyGoalData[] = [];

    for (const month of months) {
      const monthGoal = monthlyGoals.find((g) => g.month === month);
      const achievement = await calculateMonthlyAchievements(year, month);

      const goals = monthGoal
        ? {
            rentalSales: monthGoal.rentalSalesGoal,
            contractsQuantity: monthGoal.contractsQuantityGoal,
            supplierCommission: monthGoal.supplierCommissionGoal,
            concierge: monthGoal.conciergeGoal,
            houseSales: monthGoal.houseSalesGoal,
          }
        : {
            rentalSales: annualGoal ? annualGoal.rentalSalesGoal / 12 : 0,
            contractsQuantity: annualGoal
              ? annualGoal.contractsQuantityGoal / 12
              : 0,
            supplierCommission: annualGoal
              ? annualGoal.supplierCommissionGoal / 12
              : 0,
            concierge: annualGoal ? annualGoal.conciergeGoal / 12 : 0,
            houseSales: annualGoal ? annualGoal.houseSalesGoal / 12 : 0,
          };

      const achieved = {
        rentalSales: achievement.rentalSalesAchieved,
        contractsQuantity: achievement.contractsQuantityAchieved,
        supplierCommission: achievement.supplierCommissionAchieved,
        concierge: achievement.conciergeAchieved,
        houseSales: achievement.houseSalesAchieved,
      };

      const comparisons: GoalComparison[] = [
        compareGoalVsAchieved(
          "rental_sales",
          goals.rentalSales,
          achieved.rentalSales
        ),
        compareGoalVsAchieved(
          "contracts_quantity",
          goals.contractsQuantity,
          achieved.contractsQuantity
        ),
        compareGoalVsAchieved(
          "supplier_commission",
          goals.supplierCommission,
          achieved.supplierCommission
        ),
        compareGoalVsAchieved("concierge", goals.concierge, achieved.concierge),
        compareGoalVsAchieved(
          "house_sales",
          goals.houseSales,
          achieved.houseSales,
          achievement.totalRevenue
        ),
      ];

      monthlyData.push({
        year,
        month,
        monthLabel: MONTH_LABELS[month - 1],
        goals,
        achieved,
        comparisons,
        totalRevenue: achievement.totalRevenue,
      });
    }

    return monthlyData;
  } catch (error) {
    console.error("Erro ao gerar dados mensais:", error);
    // Retorna array vazio em caso de erro
    return [];
  }
};

export const generateChartsData = (
  monthlyData: MonthlyGoalData[],
  thermometer: AnnualThermometer
): GoalsChartsData => {
  // Dados de evolução mensal
  const monthlyTrend: MonthlyChartData[] = monthlyData.map((data) => ({
    month: MONTH_LABELS_SHORT[data.month - 1],
    rentalSalesGoal: data.goals.rentalSales,
    rentalSalesAchieved: data.achieved.rentalSales,
    contractsGoal: data.goals.contractsQuantity,
    contractsAchieved: data.achieved.contractsQuantity,
    supplierCommissionGoal: data.goals.supplierCommission,
    supplierCommissionAchieved: data.achieved.supplierCommission,
    conciergeGoal: data.goals.concierge,
    conciergeAchieved: data.achieved.concierge,
    houseSalesGoal: data.goals.houseSales,
    houseSalesAchieved: data.achieved.houseSales,
  }));

  // Comparação por categoria
  const categoryComparison: CategoryChartData[] = thermometer.categories.map(
    (cat) => ({
      category: cat.categoryLabel,
      goal: cat.goal,
      achieved: cat.achieved,
      percentage: cat.percentage,
    })
  );

  // Dados do termômetro
  const thermometerData = {
    percentage: thermometer.percentage,
    achieved: thermometer.totalAchieved,
    goal: thermometer.totalGoal,
    remaining: thermometer.totalGoal - thermometer.totalAchieved,
  };

  return {
    monthlyTrend,
    categoryComparison,
    thermometerData,
  };
};

export const getGoalsDashboardData = async (
  filters: GoalFilters
): Promise<GoalsDashboardData> => {
  try {
    const { year, period, startMonth, endMonth } = filters;

    // Determinar meses a buscar baseado no período
    let months: number[] = [];
    if (period === "annual") {
      months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    } else if (period === "quarterly" && startMonth && endMonth) {
      for (let m = startMonth; m <= endMonth; m++) {
        months.push(m);
      }
    } else if (period === "monthly" && startMonth) {
      months = [startMonth];
    }

    // Buscar dados
    const thermometer = await generateAnnualThermometer(year);
    const monthlyData = await generateMonthlyGoalData(year, months);
    const chartsData = generateChartsData(monthlyData, thermometer);

    return {
      annualThermometer: thermometer,
      monthlyData,
      chartsData,
      filters,
      lastUpdate: new Date(),
    };
  } catch (error) {
    console.error("Erro ao obter dados do dashboard:", error);

    // Retorna dados vazios em caso de erro, permitindo que o dashboard funcione
    const currentYear = new Date().getFullYear();
    return {
      annualThermometer: {
        year: filters?.year || currentYear,
        totalGoal: 0,
        totalAchieved: 0,
        percentage: 0,
        status: "below_target",
        categories: [],
      },
      monthlyData: [],
      chartsData: {
        monthlyTrend: [],
        categoryComparison: [],
        thermometerData: {
          percentage: 0,
          achieved: 0,
          goal: 0,
          remaining: 0,
        },
      },
      filters,
      lastUpdate: new Date(),
    };
  }
};

export const saveAnnualGoal = async (
  goalData: Omit<AnnualGoal, "id" | "createdAt" | "updatedAt">,
  userId: string
): Promise<void> => {
  try {
    const goalsRef = collection(db, "annualGoals");
    const existingGoal = await getAnnualGoal(goalData.year);

    if (existingGoal) {
      // Atualizar existente
      const goalDoc = doc(db, "annualGoals", existingGoal.id);
      await updateDoc(goalDoc, {
        ...goalData,
        updatedAt: convertToTimestamp(new Date()),
      });
    } else {
      // Criar nova
      await addDoc(goalsRef, {
        ...goalData,
        createdAt: convertToTimestamp(new Date()),
        updatedAt: convertToTimestamp(new Date()),
        createdBy: userId,
      });
    }
  } catch (error) {
    console.error("Erro ao salvar meta anual:", error);
    throw new Error("Falha ao salvar meta anual");
  }
};

export const saveMonthlyGoal = async (
  goalData: Omit<MonthlyGoal, "id" | "createdAt" | "updatedAt">
): Promise<void> => {
  try {
    const goalsRef = collection(db, "monthlyGoals");

    // Verificar se já existe meta para este mês/ano
    const q = query(
      goalsRef,
      where("year", "==", goalData.year),
      where("month", "==", goalData.month)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Atualizar existente
      const goalDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, "monthlyGoals", goalDoc.id), {
        ...goalData,
        updatedAt: convertToTimestamp(new Date()),
      });
    } else {
      // Criar nova
      await addDoc(goalsRef, {
        ...goalData,
        createdAt: convertToTimestamp(new Date()),
        updatedAt: convertToTimestamp(new Date()),
      });
    }
  } catch (error) {
    console.error("Erro ao salvar meta mensal:", error);
    throw new Error("Falha ao salvar meta mensal");
  }
};

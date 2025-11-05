import type {
  StatisticsFilters,
  JetpackStats,
  InstagramStats,
  ChartDataPoint,
} from "../types/dashboardStatistics";

// Função auxiliar para calcular variação percentual
const calculateVariation = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Gerar dados de gráfico mock
const generateMockChartData = (
  period: "month" | "year" | "custom",
  baseValue: number,
  days: number = 30
): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const today = new Date();
  const numPoints = period === "year" ? 12 : days; // 12 meses para anual, dias para mensal

  for (let i = numPoints - 1; i >= 0; i--) {
    let date: Date;
    if (period === "year") {
      date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    } else {
      date = new Date(today);
      date.setDate(date.getDate() - i);
    }
    
    const pointValue = baseValue / numPoints + (Math.random() * baseValue * 0.2 - baseValue * 0.1);
    
    data.push({
      period: date.toISOString().split("T")[0],
      value: Math.max(0, Math.floor(pointValue)),
      label: period === "year" 
        ? date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
        : date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
    });
  }

  return data;
};

export const dashboardStatisticsService = {
  // ===== JETPACK STATS =====
  async getJetpackStats(filters: StatisticsFilters): Promise<JetpackStats> {
    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Dados mock baseados no período
    const isMonth = filters.period === "month";
    const baseViews = isMonth ? 15000 : 180000;
    const baseVisitors = isMonth ? 8000 : 95000;

    const currentViews = baseViews + Math.floor(Math.random() * baseViews * 0.2);
    const previousViews = baseViews - Math.floor(Math.random() * baseViews * 0.1);
    
    const currentVisitors = baseVisitors + Math.floor(Math.random() * baseVisitors * 0.2);
    const previousVisitors = baseVisitors - Math.floor(Math.random() * baseVisitors * 0.1);

    const days = isMonth ? 30 : 12; // 12 meses para anual

    return {
      views: {
        current: currentViews,
        previous: previousViews,
        variation: calculateVariation(currentViews, previousViews),
        chartData: generateMockChartData(filters.period, currentViews, days),
      },
      visitors: {
        current: currentVisitors,
        previous: previousVisitors,
        variation: calculateVariation(currentVisitors, previousVisitors),
        chartData: generateMockChartData(filters.period, currentVisitors, days),
      },
      likes: {
        current: Math.floor(currentViews * 0.05),
        previous: Math.floor(previousViews * 0.04),
        variation: 12.5,
      },
      comments: {
        current: Math.floor(currentViews * 0.01),
        previous: Math.floor(previousViews * 0.008),
        variation: 15.0,
      },
      topPages: [
        { page: "Página Inicial", views: 4500, url: "/" },
        { page: "Sobre Nós", views: 3200, url: "/sobre" },
        { page: "Casas", views: 2800, url: "/casas" },
        { page: "Contato", views: 2100, url: "/contato" },
        { page: "Blog", views: 1800, url: "/blog" },
      ],
      topReferrers: [
        { referrer: "Google", views: 6200 },
        { referrer: "Instagram", views: 3800 },
        { referrer: "Facebook", views: 2100 },
        { referrer: "Direto", views: 1500 },
        { referrer: "Outros", views: 1400 },
      ],
    };
  },

  // ===== INSTAGRAM STATS =====
  async getInstagramStats(filters: StatisticsFilters): Promise<InstagramStats> {
    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Dados mock baseados no período
    const isMonth = filters.period === "month";
    const baseViews = isMonth ? 25000 : 300000;
    const baseFollowers = isMonth ? 5000 : 4800;
    const nonFollowersPercentage = 35 + Math.random() * 10; // 35-45%

    const currentViews = baseViews + Math.floor(Math.random() * baseViews * 0.2);
    const previousViews = baseViews - Math.floor(Math.random() * baseViews * 0.1);
    const nonFollowersViews = Math.floor(currentViews * (nonFollowersPercentage / 100));

    const currentFollowers = baseFollowers + Math.floor(Math.random() * 200);
    const previousFollowers = baseFollowers - Math.floor(Math.random() * 100);
    const gainedThisMonth = currentFollowers - previousFollowers;

    const days = isMonth ? 30 : 12; // 12 meses para anual

    // Dados de tráfego pago
    const totalInvested = isMonth ? 2500 + Math.random() * 500 : 30000 + Math.random() * 5000;
    const viewsFromPaid = Math.floor(totalInvested * 8); // ~8 views por real
    const followersFromPaid = Math.floor(totalInvested * 0.8); // ~0.8 seguidores por real
    const contractsFromInstagram = Math.floor(totalInvested / 150); // ~1 contrato a cada R$150
    const costPerView = viewsFromPaid > 0 ? totalInvested / viewsFromPaid : 0;
    const costPerFollower = followersFromPaid > 0 ? totalInvested / followersFromPaid : 0;
    const costPerContract = contractsFromInstagram > 0 ? totalInvested / contractsFromInstagram : 0;
    const revenueFromContracts = contractsFromInstagram * 2500; // Valor médio por contrato
    const roi = revenueFromContracts > 0 ? ((revenueFromContracts - totalInvested) / totalInvested) * 100 : 0;

    return {
      views: {
        current: currentViews,
        previous: previousViews,
        variation: calculateVariation(currentViews, previousViews),
        nonFollowersPercentage: Number(nonFollowersPercentage.toFixed(2)),
        nonFollowersViews,
        chartData: generateMockChartData(filters.period, currentViews, days),
      },
      followers: {
        current: currentFollowers,
        previous: previousFollowers,
        variation: calculateVariation(currentFollowers, previousFollowers),
        gainedThisMonth,
        chartData: generateMockChartData(filters.period, currentFollowers, days),
      },
      engagement: {
        likes: Math.floor(currentViews * 0.08),
        comments: Math.floor(currentViews * 0.015),
        saves: Math.floor(currentViews * 0.02),
        shares: Math.floor(currentViews * 0.005),
        engagementRate: 3.5 + Math.random() * 1.5, // 3.5-5%
      },
      paidTraffic: {
        totalInvested: Math.floor(totalInvested),
        viewsFromPaid,
        followersFromPaid,
        contractsFromInstagram,
        costPerView: Number(costPerView.toFixed(2)),
        costPerFollower: Number(costPerFollower.toFixed(2)),
        costPerContract: Number(costPerContract.toFixed(2)),
        roi: Number(roi.toFixed(2)),
        chartData: generateMockChartData(filters.period, totalInvested, days),
      },
      topPosts: [
        {
          id: "1",
          caption: "Casa de praia com vista incrível...",
          views: 5200,
          likes: 450,
          comments: 85,
          engagementRate: 10.3,
        },
        {
          id: "2",
          caption: "Novo lançamento disponível!",
          views: 4800,
          likes: 420,
          comments: 72,
          engagementRate: 10.2,
        },
        {
          id: "3",
          caption: "Dicas de decoração...",
          views: 4100,
          likes: 380,
          comments: 65,
          engagementRate: 10.9,
        },
        {
          id: "4",
          caption: "Depoimento de cliente satisfeito",
          views: 3900,
          likes: 350,
          comments: 58,
          engagementRate: 10.5,
        },
        {
          id: "5",
          caption: "Tour virtual disponível",
          views: 3600,
          likes: 320,
          comments: 52,
          engagementRate: 10.3,
        },
      ],
    };
  },
};


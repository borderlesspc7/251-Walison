export interface StatisticsFilters {
  period: "month" | "year" | "custom";
  startDate?: string;
  endDate?: string;
}

export interface JetpackStats {
  views: {
    current: number;
    previous: number;
    variation: number;
    chartData: ChartDataPoint[];
  };
  visitors: {
    current: number;
    previous: number;
    variation: number;
    chartData: ChartDataPoint[];
  };
  likes: {
    current: number;
    previous: number;
    variation: number;
  };
  comments: {
    current: number;
    previous: number;
    variation: number;
  };
  topPages: {
    page: string;
    views: number;
    url: string;
  }[];
  topReferrers: {
    referrer: string;
    views: number;
  }[];
}

export interface InstagramStats {
  views: {
    current: number;
    previous: number;
    variation: number;
    nonFollowersPercentage: number;
    nonFollowersViews: number;
    chartData: ChartDataPoint[];
  };
  followers: {
    current: number;
    previous: number;
    variation: number;
    gainedThisMonth: number;
    chartData: ChartDataPoint[];
  };
  engagement: {
    likes: number;
    comments: number;
    saves: number;
    shares: number;
    engagementRate: number;
  };
  paidTraffic: {
    totalInvested: number;
    viewsFromPaid: number;
    followersFromPaid: number;
    contractsFromInstagram: number;
    costPerView: number;
    costPerFollower: number;
    costPerContract: number;
    roi: number;
    chartData: ChartDataPoint[];
  };
  topPosts: {
    id: string;
    caption: string;
    views: number;
    likes: number;
    comments: number;
    engagementRate: number;
    imageUrl?: string;
  }[];
}

export interface ChartDataPoint {
  period: string;
  value: number;
  label?: string;
}

export interface DashboardStatisticsData {
  filters: StatisticsFilters;
  jetpackStats: JetpackStats;
  instagramStats: InstagramStats;
  lastUpdated: Date;
}


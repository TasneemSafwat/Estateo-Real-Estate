export interface AdminStats {
  totalProperties: number;
  totalUsers: number;
  activeListings: number;
  totalRevenue: number;
  averagePrice: number;
  /** Percentage change vs. the previous period. */
  propertyTrend: number;
  userTrend: number;
  listingTrend: number;
  revenueTrend: number;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
  deals: number;
}

export interface DistributionPoint {
  name: string;
  value: number;
}

export interface EngagementPoint {
  month: string;
  views: number;
  saved: number;
  inquiries: number;
}

export interface AdminDashboardData {
  stats: AdminStats;
  revenue: RevenuePoint[];
  distribution: DistributionPoint[];
  engagement: EngagementPoint[];
}

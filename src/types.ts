export interface StoreMasterRecord {
  storeId: string;
  storeName: string;
  region: string;
  city: string;
  storeFormat: string;
}

export interface CategorySales {
  category: string;
  sales: number;
  transactions: number;
  unitsSold?: number;
}

export interface MonthlyTrend {
  month: string; // e.g., "2026-07-01" or "Jul 25"
  sales: number;
  transactions: number;
  footfall?: number;
  target?: number;
}

export interface StorePerformance {
  storeName: string;
  city?: string;
  storeFormat?: string;
  sales: number;
  transactions: number;
  growth?: number; // e.g. 5.4%
  targetAttainment?: number; // % of target achieved, e.g. 98.4
  footfall?: number;
  conversionRate?: number; // e.g. 15.2%
  customerRating?: number; // e.g. 4.6
  stockouts?: number;
}

export interface RegionData {
  regionName: string;
  totalSales: number;
  totalTransactions: number;
  averageOrderValue: number;
  salesGrowth: number; // YoY growth percentage or trend
  categoryBreakdown: CategorySales[];
  monthlyTrend: MonthlyTrend[];
  topStores: StorePerformance[];
  lowStores: StorePerformance[];
  
  // Custom weekly excel fields aggregated
  totalFootfall?: number;
  conversionRate?: number; // %
  targetAttainment?: number; // %
  totalDiscount?: number;
  totalReturns?: number;
  avgRating?: number;
  totalStockouts?: number;
  marketingSpend?: number;
  marketingRoi?: number;
}

export interface SalesRow {
  week: string;
  region: string;
  storeName: string;
  city: string;
  storeFormat: string;
  category: string;
  sales: number;
  transactions: number;
  footfall: number;
  target: number;
  discount: number;
  returns: number;
  rating: number;
  stockouts: number;
  marketingSpend: number;
  unitsSold: number;
}

export interface SalesDataset {
  name: string;
  lastUpdated: string;
  regions: RegionData[];
  rawRows?: SalesRow[];
  aggregateKPIs: {
    totalSales: number;
    totalTransactions: number;
    aov: number;
    avgGrowth: number;
    
    // Aggregated metrics from user upload
    totalFootfall?: number;
    conversionRate?: number;
    targetAttainment?: number;
    totalStockouts?: number;
    avgRating?: number;
    marketingRoi?: number;
    discountPercentage?: number;
  };
}

export interface AIAnalysisResult {
  executiveSummary: string;
  regionalInsights: Array<{
    region: string;
    keyObservation: string;
    strength: string;
    actionItem: string;
  }>;
  categoryOpportunities: Array<{
    category: string;
    trend: 'growth' | 'declining' | 'stable';
    strategicAction: string;
  }>;
  criticalActionItems: string[];
}

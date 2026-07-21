import { SalesDataset, SalesRow } from './types';

export const DEFAULT_RETAIL_DATASET: SalesDataset = {
  name: "National Store Network (Standard Preset)",
  lastUpdated: "July 2026",
  regions: [
    {
      regionName: "Northeast",
      totalSales: 4850000,
      totalTransactions: 92000,
      averageOrderValue: 52.72,
      salesGrowth: 6.2,
      totalFootfall: 420000,
      conversionRate: 21.9,
      targetAttainment: 102.5,
      totalDiscount: 240000,
      totalReturns: 95000,
      avgRating: 4.4,
      totalStockouts: 12,
      marketingSpend: 150000,
      marketingRoi: 32.3, // Sales per marketing dollar
      categoryBreakdown: [
        { category: "Electronics", sales: 1650000, transactions: 21000 },
        { category: "Apparel", sales: 1350000, transactions: 34000 },
        { category: "Home & Kitchen", sales: 950000, transactions: 15000 },
        { category: "Groceries", sales: 550000, transactions: 14000 },
        { category: "Beauty", sales: 350000, transactions: 8000 }
      ],
      monthlyTrend: [
        { month: "Jul 25", sales: 360000, transactions: 6800 },
        { month: "Aug 25", sales: 375000, transactions: 7100 },
        { month: "Sep 25", sales: 390000, transactions: 7400 },
        { month: "Oct 25", sales: 380000, transactions: 7200 },
        { month: "Nov 25", sales: 440000, transactions: 8300 },
        { month: "Dec 25", sales: 510000, transactions: 9700 },
        { month: "Jan 26", sales: 350000, transactions: 6700 },
        { month: "Feb 26", sales: 365000, transactions: 6900 },
        { month: "Mar 26", sales: 410000, transactions: 7800 },
        { month: "Apr 26", sales: 400000, transactions: 7600 },
        { month: "May 26", sales: 420000, transactions: 8000 },
        { month: "Jun 26", sales: 450000, transactions: 8500 }
      ],
      topStores: [
        { storeName: "New York Midtown (NY-12)", city: "New York", storeFormat: "Flagship", sales: 1850000, transactions: 31000, growth: 11.4, targetAttainment: 108.5, footfall: 112000, conversionRate: 27.6, customerRating: 4.6, stockouts: 2 },
        { storeName: "Boston Back Bay (MA-04)", city: "Boston", storeFormat: "High Street", sales: 1450000, transactions: 27000, growth: 8.2, targetAttainment: 104.2, footfall: 95000, conversionRate: 28.4, customerRating: 4.5, stockouts: 4 },
        { storeName: "Philadelphia Downtown (PA-09)", city: "Philadelphia", storeFormat: "Standard Mall", sales: 980000, transactions: 21000, growth: 4.1, targetAttainment: 99.1, footfall: 120000, conversionRate: 17.5, customerRating: 4.2, stockouts: 6 }
      ],
      lowStores: [
        { storeName: "Providence Mall (RI-02)", city: "Providence", storeFormat: "Standard Mall", sales: 320000, transactions: 7500, growth: -2.1, targetAttainment: 91.0, footfall: 52000, conversionRate: 14.4, customerRating: 3.9, stockouts: 9 },
        { storeName: "Hartford Center (CT-07)", city: "Hartford", storeFormat: "Strip Mall", sales: 250000, transactions: 5500, growth: -4.8, targetAttainment: 85.4, footfall: 41000, conversionRate: 13.4, customerRating: 3.7, stockouts: 11 }
      ]
    },
    {
      regionName: "Midwest",
      totalSales: 3950000,
      totalTransactions: 81000,
      averageOrderValue: 48.77,
      salesGrowth: -1.8,
      totalFootfall: 510000,
      conversionRate: 15.8,
      targetAttainment: 94.6,
      totalDiscount: 210000,
      totalReturns: 112000,
      avgRating: 4.1,
      totalStockouts: 28,
      marketingSpend: 130000,
      marketingRoi: 30.3,
      categoryBreakdown: [
        { category: "Electronics", sales: 1150000, transactions: 15500 },
        { category: "Apparel", sales: 980000, transactions: 22000 },
        { category: "Home & Kitchen", sales: 1020000, transactions: 20000 },
        { category: "Groceries", sales: 480000, transactions: 14500 },
        { category: "Beauty", sales: 320000, transactions: 9000 }
      ],
      monthlyTrend: [
        { month: "Jul 25", sales: 340000, transactions: 7000 },
        { month: "Aug 25", sales: 330000, transactions: 6800 },
        { month: "Sep 25", sales: 315000, transactions: 6500 },
        { month: "Oct 25", sales: 310000, transactions: 6400 },
        { month: "Nov 25", sales: 360000, transactions: 7400 },
        { month: "Dec 25", sales: 410000, transactions: 8400 },
        { month: "Jan 26", sales: 280000, transactions: 5700 },
        { month: "Feb 26", sales: 295000, transactions: 6100 },
        { month: "Mar 26", sales: 320000, transactions: 6600 },
        { month: "Apr 26", sales: 310000, transactions: 6300 },
        { month: "May 26", sales: 330000, transactions: 6700 },
        { month: "Jun 26", sales: 340000, transactions: 7100 }
      ],
      topStores: [
        { storeName: "Chicago Loop (IL-01)", city: "Chicago", storeFormat: "Flagship", sales: 1650000, transactions: 31000, growth: 5.6, targetAttainment: 101.4, footfall: 155000, conversionRate: 20.0, customerRating: 4.4, stockouts: 5 },
        { storeName: "Minneapolis Downtown (MN-03)", city: "Minneapolis", storeFormat: "High Street", sales: 1150000, transactions: 24000, growth: 2.1, targetAttainment: 98.0, footfall: 120000, conversionRate: 20.0, customerRating: 4.2, stockouts: 8 }
      ],
      lowStores: [
        { storeName: "Detroit Suburbs (MI-11)", city: "Detroit", storeFormat: "Standard Mall", sales: 480000, transactions: 11000, growth: -8.4, targetAttainment: 89.2, footfall: 95000, conversionRate: 11.5, customerRating: 3.8, stockouts: 14 },
        { storeName: "Cleveland Central (OH-08)", city: "Cleveland", storeFormat: "Strip Mall", sales: 420000, transactions: 10000, growth: -6.1, targetAttainment: 87.0, footfall: 80000, conversionRate: 12.5, customerRating: 3.9, stockouts: 12 },
        { storeName: "Milwaukee Center (WI-05)", city: "Milwaukee", storeFormat: "Outlet", sales: 250000, transactions: 5000, growth: -12.5, targetAttainment: 79.5, footfall: 60000, conversionRate: 8.3, customerRating: 3.6, stockouts: 20 }
      ]
    },
    {
      regionName: "South",
      totalSales: 5200000,
      totalTransactions: 115000,
      averageOrderValue: 45.22,
      salesGrowth: 8.9,
      totalFootfall: 650000,
      conversionRate: 17.6,
      targetAttainment: 104.8,
      totalDiscount: 290000,
      totalReturns: 118000,
      avgRating: 4.5,
      totalStockouts: 9,
      marketingSpend: 160000,
      marketingRoi: 32.5,
      categoryBreakdown: [
        { category: "Electronics", sales: 1550000, transactions: 22000 },
        { category: "Apparel", sales: 1650000, transactions: 44000 },
        { category: "Home & Kitchen", sales: 1100000, transactions: 24000 },
        { category: "Groceries", sales: 580000, transactions: 17000 },
        { category: "Beauty", sales: 320000, transactions: 8000 }
      ],
      monthlyTrend: [
        { month: "Jul 25", sales: 380000, transactions: 8400 },
        { month: "Aug 25", sales: 395000, transactions: 8700 },
        { month: "Sep 25", sales: 410000, transactions: 9100 },
        { month: "Oct 25", sales: 405000, transactions: 9000 },
        { month: "Nov 25", sales: 460000, transactions: 10200 },
        { month: "Dec 25", sales: 550000, transactions: 12200 },
        { month: "Jan 26", sales: 380000, transactions: 8400 },
        { month: "Feb 26", sales: 400000, transactions: 8800 },
        { month: "Mar 26", sales: 440000, transactions: 9700 },
        { month: "Apr 26", sales: 435000, transactions: 9600 },
        { month: "May 26", sales: 460000, transactions: 10200 },
        { month: "Jun 26", sales: 480000, transactions: 10600 }
      ],
      topStores: [
        { storeName: "Dallas Galleria (TX-02)", city: "Dallas", storeFormat: "High Street", sales: 1950000, transactions: 41000, growth: 12.8, targetAttainment: 111.4, footfall: 180000, conversionRate: 22.7, customerRating: 4.7, stockouts: 1 },
        { storeName: "Atlanta Buckhead (GA-01)", city: "Atlanta", storeFormat: "Flagship", sales: 1550000, transactions: 32000, growth: 9.4, targetAttainment: 105.0, footfall: 140000, conversionRate: 22.8, customerRating: 4.6, stockouts: 3 },
        { storeName: "Miami Beach (FL-08)", city: "Miami", storeFormat: "Standard Mall", sales: 1150000, transactions: 28000, growth: 7.2, targetAttainment: 102.1, footfall: 160000, conversionRate: 17.5, customerRating: 4.4, stockouts: 5 }
      ],
      lowStores: [
        { storeName: "Memphis Center (TN-14)", city: "Memphis", storeFormat: "Strip Mall", sales: 330000, transactions: 8000, growth: -1.2, targetAttainment: 93.5, footfall: 85000, conversionRate: 9.4, customerRating: 4.0, stockouts: 4 },
        { storeName: "New Orleans Square (LA-03)", city: "New Orleans", storeFormat: "Outlet", sales: 220000, transactions: 6000, growth: -3.5, targetAttainment: 90.1, footfall: 70000, conversionRate: 8.5, customerRating: 3.8, stockouts: 8 }
      ]
    },
    {
      regionName: "West",
      totalSales: 4100000,
      totalTransactions: 78000,
      averageOrderValue: 52.56,
      salesGrowth: 4.5,
      totalFootfall: 480000,
      conversionRate: 16.2,
      targetAttainment: 98.7,
      totalDiscount: 190000,
      totalReturns: 72000,
      avgRating: 4.3,
      totalStockouts: 15,
      marketingSpend: 110000,
      marketingRoi: 37.2,
      categoryBreakdown: [
        { category: "Electronics", sales: 1320000, transactions: 17500 },
        { category: "Apparel", sales: 1100000, transactions: 24500 },
        { category: "Home & Kitchen", sales: 880000, transactions: 17000 },
        { category: "Groceries", sales: 450000, transactions: 11000 },
        { category: "Beauty", sales: 350000, transactions: 8000 }
      ],
      monthlyTrend: [
        { month: "Jul 25", sales: 310000, transactions: 5900 },
        { month: "Aug 25", sales: 320000, transactions: 6100 },
        { month: "Sep 25", sales: 330000, transactions: 6300 },
        { month: "Oct 25", sales: 325000, transactions: 6200 },
        { month: "Nov 25", sales: 365000, transactions: 6900 },
        { month: "Dec 25", sales: 430000, transactions: 8200 },
        { month: "Jan 26", sales: 300000, transactions: 5700 },
        { month: "Feb 26", sales: 315000, transactions: 6000 },
        { month: "Mar 26", sales: 345000, transactions: 6600 },
        { month: "Apr 26", sales: 340000, transactions: 6500 },
        { month: "May 26", sales: 360000, transactions: 6800 },
        { month: "Jun 26", sales: 380000, transactions: 7200 }
      ],
      topStores: [
        { storeName: "Denver Downtown (CO-05)", city: "Denver", storeFormat: "Flagship", sales: 1650000, transactions: 30000, growth: 8.5, targetAttainment: 104.5, footfall: 110000, conversionRate: 27.2, customerRating: 4.5, stockouts: 3 },
        { storeName: "Phoenix Biltmore (AZ-02)", city: "Phoenix", storeFormat: "High Street", sales: 1350000, transactions: 24000, growth: 6.1, targetAttainment: 101.0, footfall: 105000, conversionRate: 22.8, customerRating: 4.4, stockouts: 5 }
      ],
      lowStores: [
        { storeName: "Salt Lake Outlet (UT-09)", city: "Salt Lake", storeFormat: "Outlet", sales: 650000, transactions: 13000, growth: -1.8, targetAttainment: 93.0, footfall: 115000, conversionRate: 11.3, customerRating: 4.1, stockouts: 8 },
        { storeName: "Albuquerque Central (NM-04)", city: "Albuquerque", storeFormat: "Strip Mall", sales: 450000, transactions: 11000, growth: -4.2, targetAttainment: 89.5, footfall: 90000, conversionRate: 12.2, customerRating: 3.9, stockouts: 11 }
      ]
    },
    {
      regionName: "Pacific",
      totalSales: 6100000,
      totalTransactions: 105000,
      averageOrderValue: 58.10,
      salesGrowth: 9.3,
      totalFootfall: 490000,
      conversionRate: 21.4,
      targetAttainment: 107.1,
      totalDiscount: 310000,
      totalReturns: 84000,
      avgRating: 4.6,
      totalStockouts: 7,
      marketingSpend: 180000,
      marketingRoi: 33.8,
      categoryBreakdown: [
        { category: "Electronics", sales: 2200000, transactions: 26000 },
        { category: "Apparel", sales: 1650000, transactions: 37000 },
        { category: "Home & Kitchen", sales: 1150000, transactions: 21000 },
        { category: "Groceries", sales: 600000, transactions: 13000 },
        { category: "Beauty", sales: 500000, transactions: 8000 }
      ],
      monthlyTrend: [
        { month: "Jul 25", sales: 450000, transactions: 7800 },
        { month: "Aug 25", sales: 460000, transactions: 7900 },
        { month: "Sep 25", sales: 480000, transactions: 8300 },
        { month: "Oct 25", sales: 470000, transactions: 8100 },
        { month: "Nov 25", sales: 530000, transactions: 9100 },
        { month: "Dec 25", sales: 640000, transactions: 11000 },
        { month: "Jan 26", sales: 440000, transactions: 7600 },
        { month: "Feb 26", sales: 460000, transactions: 7900 },
        { month: "Mar 26", sales: 510000, transactions: 8800 },
        { month: "Apr 26", sales: 500000, transactions: 8600 },
        { month: "May 26", sales: 580000, transactions: 10000 },
        { month: "Jun 26", sales: 620000, transactions: 10700 }
      ],
      topStores: [
        { storeName: "Seattle Downtown (WA-02)", city: "Seattle", storeFormat: "Flagship", sales: 2450000, transactions: 41000, growth: 13.5, targetAttainment: 112.4, footfall: 130000, conversionRate: 31.5, customerRating: 4.8, stockouts: 1 },
        { storeName: "San Francisco Union Sq (CA-01)", city: "San Francisco", storeFormat: "Flagship", sales: 2150000, transactions: 36000, growth: 10.2, targetAttainment: 109.1, footfall: 115000, conversionRate: 31.3, customerRating: 4.7, stockouts: 2 },
        { storeName: "Los Angeles Grove (CA-08)", city: "Los Angeles", storeFormat: "High Street", sales: 1500000, transactions: 28000, growth: 6.4, targetAttainment: 103.5, footfall: 135000, conversionRate: 20.7, customerRating: 4.5, stockouts: 4 }
      ],
      lowStores: [
        { storeName: "Portland Suburbs (OR-12)", city: "Portland", storeFormat: "Standard Mall", sales: 620000, transactions: 11000, growth: -0.8, targetAttainment: 96.2, footfall: 65000, conversionRate: 16.9, customerRating: 4.2, stockouts: 6 },
        { storeName: "Tacoma Center (WA-07)", city: "Tacoma", storeFormat: "Strip Mall", sales: 380000, transactions: 7000, growth: -3.2, targetAttainment: 92.4, footfall: 45000, conversionRate: 15.5, customerRating: 4.0, stockouts: 9 }
      ]
    }
  ],
  aggregateKPIs: {
    totalSales: 24200000,
    totalTransactions: 471000,
    aov: 51.38,
    avgGrowth: 5.44,
    totalFootfall: 2550000,
    conversionRate: 18.5,
    targetAttainment: 101.2,
    totalStockouts: 71,
    avgRating: 4.38,
    marketingRoi: 33.15,
    discountPercentage: 5.1
  }
};

export function generatePresetRows(dataset: SalesDataset): SalesRow[] {
  const rows: SalesRow[] = [];
  
  for (const r of dataset.regions) {
    const regionName = r.regionName;
    const regionTotalSales = r.totalSales;
    const regionTotalTransactions = r.totalTransactions;
    
    // Combine top and low stores
    const stores = [...r.topStores, ...r.lowStores];
    const totalStoreSales = stores.reduce((sum, s) => sum + s.sales, 0) || 1;
    const totalStoreTransactions = stores.reduce((sum, s) => sum + s.transactions, 0) || 1;
    
    // Monthly trend distribution
    const totalMonthSales = r.monthlyTrend.reduce((sum, m) => sum + m.sales, 0) || 1;
    
    // Category distribution
    const totalCategorySales = r.categoryBreakdown.reduce((sum, c) => sum + c.sales, 0) || 1;
    
    // Generate records
    for (const store of stores) {
      const storeName = store.storeName;
      const city = store.city || "Various";
      const storeFormat = store.storeFormat || "Standard";
      
      const storeSalesShare = store.sales / totalStoreSales;
      const storeTransShare = store.transactions / totalStoreTransactions;
      
      for (const monthData of r.monthlyTrend) {
        const week = monthData.month; // e.g. "Jul 25"
        const monthSalesShare = monthData.sales / totalMonthSales;
        
        for (const catData of r.categoryBreakdown) {
          const category = catData.category;
          const catSalesShare = catData.sales / totalCategorySales;
          
          // Allocate values based on joint probabilities (shares)
          const sales = Math.round(regionTotalSales * storeSalesShare * monthSalesShare * catSalesShare);
          const transactions = Math.max(1, Math.round(regionTotalTransactions * storeTransShare * monthSalesShare * catSalesShare));
          
          // Estimate secondary values
          const conversionRate = (store.conversionRate || 18.5) / 100;
          
          // Target achievement can be derived
          const target = Math.round(sales / ((store.targetAttainment || 100) / 100));
          
          // Discount and returns are generally around a percentage
          let returnRate = 0.02; // default
          if (category === "Electronics") returnRate = 0.045;
          if (category === "Apparel") returnRate = 0.068; // Apparel is high return category
          if (category === "Beauty") returnRate = 0.012;
          
          let discountRate = 0.05;
          if (category === "Electronics") discountRate = 0.035;
          if (category === "Apparel") discountRate = 0.078;
          
          const discount = Math.round(sales * discountRate);
          const returns = Math.round(sales * returnRate);
          
          // Customer rating with a small shift based on store rating
          const baseRating = store.customerRating || 4.2;
          // deterministic pseudo-random offset
          const seed = storeName.length + week.length + category.length;
          const offset = ((seed % 10) - 5) / 10; // -0.5 to +0.4
          const rating = Math.max(1, Math.min(5, Math.round((baseRating + offset) * 10) / 10));
          
          // Stockouts: distribute store's stockouts over months and categories
          let stockouts = 0;
          if (store.stockouts && store.stockouts > 0) {
            const stockoutSeed = (seed * 7) % 100;
            if (stockoutSeed < 20 && (category === "Electronics" || category === "Apparel")) {
              stockouts = Math.round(store.stockouts / 2.5) || 1;
            }
          }
          
          // Footfall
          const footfall = Math.round(transactions / (conversionRate || 0.185));

          // Marketing Spend: divide regional spend
          const marketingSpend = Math.round((r.marketingSpend || 0) * storeSalesShare * monthSalesShare * catSalesShare);
          
          const unitsSold = Math.round(transactions * (1.2 + (seed % 5) / 10));
          
          rows.push({
            week,
            region: regionName,
            storeName,
            city,
            storeFormat,
            category,
            sales,
            transactions,
            footfall,
            target,
            discount,
            returns,
            rating,
            stockouts,
            marketingSpend,
            unitsSold
          });
        }
      }
    }
  }
  
  return rows;
}

DEFAULT_RETAIL_DATASET.rawRows = generatePresetRows(DEFAULT_RETAIL_DATASET);


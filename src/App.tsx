import { useState, useMemo, useEffect } from "react";
import { DEFAULT_RETAIL_DATASET } from "./data";
import { SalesDataset, StoreMasterRecord, SalesRow } from "./types";
import RegionSelector from "./components/RegionSelector";
import KPICard from "./components/KPICard";
import SalesCharts from "./components/SalesCharts";
import StoreLeaderboard from "./components/StoreLeaderboard";
import DataUploader from "./components/DataUploader";
import AIBriefing from "./components/AIBriefing";
import BIInsights from "./components/BIInsights";
import { DollarSign, ShoppingBag, Activity, TrendingUp, Store, Target, Percent, AlertTriangle, Star, RefreshCw, Download, FileSpreadsheet, ArrowDownRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [activeDataset, setActiveDataset] = useState<SalesDataset>(DEFAULT_RETAIL_DATASET);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [storeMasterRecords, setStoreMasterRecords] = useState<StoreMasterRecord[]>([]);

  // ==========================================
  // MULTIDIMENSIONAL CASCADING FILTER STATE
  // ==========================================
  const [filterWeek, setFilterWeek] = useState<string>("All");
  const [filterRegion, setFilterRegion] = useState<string>("All");
  const [filterStore, setFilterStore] = useState<string>("All");
  const [filterCity, setFilterCity] = useState<string>("All");
  const [filterFormat, setFilterFormat] = useState<string>("All");
  const [filterCategory, setFilterCategory] = useState<string>("All");

  // Keep selectedRegion synced with filterRegion for complete UI harmony
  useEffect(() => {
    if (selectedRegion) {
      setFilterRegion(selectedRegion);
    } else {
      setFilterRegion("All");
    }
  }, [selectedRegion]);

  const handleSelectRegion = (regionName: string | null) => {
    setSelectedRegion(regionName);
    setFilterRegion(regionName || "All");
  };

  const handleFilterRegionChange = (regionVal: string) => {
    setFilterRegion(regionVal);
    setSelectedRegion(regionVal === "All" ? null : regionVal);
  };

  // Extract region names
  const regionNames = useMemo(() => {
    return activeDataset.regions.map(r => r.regionName);
  }, [activeDataset]);

  // Reset Filters handler
  const handleResetFilters = () => {
    setFilterWeek("All");
    setFilterRegion("All");
    setFilterStore("All");
    setFilterCity("All");
    setFilterFormat("All");
    setFilterCategory("All");
    setSelectedRegion(null);
  };

  // ==========================================
  // REAL-TIME CASCADING POOL GENERATOR
  // ==========================================
  const filterOptions = useMemo(() => {
    const rows = activeDataset.rawRows || [];

    const getFilteredPool = (excludeKey: string) => {
      let pool = rows;
      if (excludeKey !== "week" && filterWeek !== "All") pool = pool.filter(r => r.week === filterWeek);
      if (excludeKey !== "region" && filterRegion !== "All") pool = pool.filter(r => r.region === filterRegion);
      if (excludeKey !== "store" && filterStore !== "All") pool = pool.filter(r => r.storeName === filterStore);
      if (excludeKey !== "city" && filterCity !== "All") pool = pool.filter(r => r.city === filterCity);
      if (excludeKey !== "format" && filterFormat !== "All") pool = pool.filter(r => r.storeFormat === filterFormat);
      if (excludeKey !== "category" && filterCategory !== "All") pool = pool.filter(r => r.category === filterCategory);
      return pool;
    };

    const weeks = Array.from(new Set(getFilteredPool("week").map(r => r.week))).sort();
    const regions = Array.from(new Set(getFilteredPool("region").map(r => r.region))).sort();
    const stores = Array.from(new Set(getFilteredPool("store").map(r => r.storeName))).sort();
    const cities = Array.from(new Set(getFilteredPool("city").map(r => r.city))).sort();
    const formats = Array.from(new Set(getFilteredPool("format").map(r => r.storeFormat))).sort();
    const categories = Array.from(new Set(getFilteredPool("category").map(r => r.category))).sort();

    return { weeks, regions, stores, cities, formats, categories };
  }, [activeDataset, filterWeek, filterRegion, filterStore, filterCity, filterFormat, filterCategory]);

  // ==========================================
  // MULTIDIMENSIONAL ACTIVE DATASET FILTERING
  // ==========================================
  const filteredRows = useMemo(() => {
    let rows = activeDataset.rawRows || [];

    if (filterWeek !== "All") {
      rows = rows.filter(r => r.week === filterWeek);
    }
    if (filterRegion !== "All") {
      rows = rows.filter(r => r.region === filterRegion);
    }
    if (filterStore !== "All") {
      rows = rows.filter(r => r.storeName === filterStore);
    }
    if (filterCity !== "All") {
      rows = rows.filter(r => r.city === filterCity);
    }
    if (filterFormat !== "All") {
      rows = rows.filter(r => r.storeFormat === filterFormat);
    }
    if (filterCategory !== "All") {
      rows = rows.filter(r => r.category === filterCategory);
    }

    return rows;
  }, [activeDataset, filterWeek, filterRegion, filterStore, filterCity, filterFormat, filterCategory]);

  // ==========================================
  // REAL-TIME METRIC COMPILATION STAGE
  // ==========================================
  const computedMetrics = useMemo(() => {
    let totalSales = 0;
    let totalTransactions = 0;
    let totalTarget = 0;
    let totalReturns = 0;
    let totalDiscount = 0;
    let totalFootfall = 0;
    let totalStockouts = 0;
    let ratingSum = 0;
    let ratingCount = 0;
    let totalMarketing = 0;

    filteredRows.forEach(r => {
      totalSales += r.sales;
      totalTransactions += r.transactions;
      totalTarget += r.target;
      totalReturns += r.returns;
      totalDiscount += r.discount;
      totalFootfall += r.footfall;
      totalStockouts += r.stockouts;
      totalMarketing += r.marketingSpend;
      if (r.rating > 0) {
        ratingSum += r.rating;
        ratingCount++;
      }
    });

    const aov = totalTransactions > 0 ? totalSales / totalTransactions : 0;
    const targetAttainment = totalTarget > 0 ? (totalSales / totalTarget) * 100 : 100;
    const returnRate = totalSales > 0 ? (totalReturns / totalSales) * 100 : 0;
    const discountPercentage = totalSales > 0 ? (totalDiscount / totalSales) * 100 : 0;
    const conversionRate = totalFootfall > 0 ? (totalTransactions / totalFootfall) * 100 : 0;
    const avgRating = ratingCount > 0 ? ratingSum / ratingCount : 4.2;
    const marketingRoi = totalMarketing > 0 ? totalSales / totalMarketing : 0;

    return {
      totalSales,
      totalTransactions,
      aov,
      targetAttainment,
      returnRate,
      discountPercentage,
      totalFootfall,
      conversionRate,
      totalStockouts,
      avgRating,
      marketingSpend: totalMarketing,
      marketingRoi,
      growth: activeDataset.aggregateKPIs.avgGrowth
    };
  }, [filteredRows, activeDataset]);

  // ==========================================
  // LEADERBOARDS CALCULATOR
  // ==========================================
  const storeLeaderboards = useMemo(() => {
    const map: Record<string, {
      sales: number;
      target: number;
      transactions: number;
      footfall: number;
      ratings: number[];
      stockouts: number;
      city: string;
      format: string;
    }> = {};

    filteredRows.forEach(r => {
      if (!map[r.storeName]) {
        map[r.storeName] = {
          sales: 0,
          target: 0,
          transactions: 0,
          footfall: 0,
          ratings: [],
          stockouts: 0,
          city: r.city,
          format: r.storeFormat
        };
      }
      const st = map[r.storeName];
      st.sales += r.sales;
      st.target += r.target;
      st.transactions += r.transactions;
      st.footfall += r.footfall;
      if (r.rating > 0) st.ratings.push(r.rating);
      st.stockouts += r.stockouts;
    });

    const sortedStores = Object.keys(map).map(storeName => {
      const st = map[storeName];
      const avgRating = st.ratings.length > 0 ? st.ratings.reduce((s, r) => s + r, 0) / st.ratings.length : 4.2;

      return {
        storeName,
        city: st.city || "Various",
        storeFormat: st.format || "Standard",
        sales: Math.round(st.sales),
        transactions: st.transactions,
        footfall: st.footfall,
        conversionRate: st.footfall > 0 ? Math.round((st.transactions / st.footfall) * 1000) / 10 : 0,
        targetAttainment: st.target > 0 ? Math.round((st.sales / st.target) * 1000) / 10 : 100,
        customerRating: Math.round(avgRating * 10) / 10,
        stockouts: st.stockouts,
        growth: st.target > 0 ? Math.round(((st.sales - st.target) / st.target) * 1000) / 10 : 2.5
      };
    }).sort((a, b) => b.sales - a.sales);

    const topStores = sortedStores.filter(s => s.targetAttainment >= 100).slice(0, 4);
    const lowStores = sortedStores.filter(s => s.targetAttainment < 100).sort((a, b) => a.targetAttainment - b.targetAttainment).slice(0, 4);

    const fallbackTop = sortedStores.slice(0, 4);
    const fallbackLow = [...sortedStores].reverse().slice(0, 3);

    return {
      topStores: topStores.length > 0 ? topStores : fallbackTop,
      lowStores: lowStores.length > 0 ? lowStores : (fallbackLow.length > 0 ? fallbackLow : [])
    };
  }, [filteredRows]);

  // ==========================================
  // OFFLINE HIGH-FIDELITY CSV EXPORTER
  // ==========================================
  const exportToCSV = () => {
    const headers = [
      "Week_Period", "Region", "Store_Name", "City", "Store_Format", "Category", 
      "Sales_USD", "Transactions", "Footfall", "Target_USD", "Discount_USD", 
      "Returns_USD", "Customer_Rating", "Stockout_Incidents", "Marketing_Spend_USD", "Units_Sold"
    ];

    const csvContent = [
      headers.join(","),
      ...filteredRows.map(r => [
        `"${r.week}"`,
        `"${r.region}"`,
        `"${r.storeName}"`,
        `"${r.city}"`,
        `"${r.storeFormat}"`,
        `"${r.category}"`,
        r.sales,
        r.transactions,
        r.footfall,
        r.target,
        r.discount,
        r.returns,
        r.rating,
        r.stockouts,
        r.marketingSpend,
        r.unitsSold
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `filtered_retail_sales_${activeDataset.name.toLowerCase().replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDatasetLoaded = (newDataset: SalesDataset) => {
    setActiveDataset(newDataset);
    handleResetFilters();
  };

  const handleResetDefault = () => {
    setActiveDataset(DEFAULT_RETAIL_DATASET);
    handleResetFilters();
  };

  const hasOperationsMetrics = computedMetrics.totalFootfall !== undefined || computedMetrics.targetAttainment !== undefined;

  return (
    <div id="app-root-container" className="min-h-screen bg-slate-50/60 text-slate-800 antialiased font-sans pb-16">
      
      {/* Platform Header */}
      <header id="platform-header" className="bg-white border-b border-slate-100 py-5 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-sm flex items-center justify-center">
              <Store size={22} />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                Retail Sales Intelligence
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-[10px] font-bold text-indigo-600 uppercase tracking-widest border border-indigo-100">BI Pro</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">Network optimization & generative summaries</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <div className="h-9 w-px bg-slate-100"></div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Operational Audit</span>
              <span className="text-xs font-semibold text-slate-700">Active Session Network</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Stage */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Step 1: Data Uploader */}
        <DataUploader
          onDatasetLoaded={handleDatasetLoaded}
          onResetDefault={handleResetDefault}
          currentDatasetName={activeDataset.name}
          storeMasterRecords={storeMasterRecords}
          onStoreMasterLoaded={setStoreMasterRecords}
          onResetStoreMaster={() => setStoreMasterRecords([])}
        />

        {/* Step 1.5: MULTIDIMENSIONAL FILTER CARD DECK */}
        <div id="bi-filters-deck" className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileSpreadsheet size={16} className="text-indigo-600" />
                Multi-Dimensional BI Filtering Rails
              </h3>
              <p className="text-[11px] text-slate-400">Cascading select scopes apply instantaneously to all database summaries</p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-600 hover:text-slate-800 hover:bg-slate-100 font-bold text-xs border border-slate-100 transition-all cursor-pointer active:scale-95"
              >
                <RefreshCw size={13} />
                Reset Filters
              </button>
              <button
                onClick={exportToCSV}
                disabled={filteredRows.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download size={13} />
                Export Filtered Data (CSV)
              </button>
            </div>
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* 1. Week */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Week / Period</label>
              <div className="relative">
                <select
                  value={filterWeek}
                  onChange={(e) => setFilterWeek(e.target.value)}
                  className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition-all"
                >
                  <option value="All">All Weeks ({filterOptions.weeks.length})</option>
                  {filterOptions.weeks.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2. Region */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Region Group</label>
              <div className="relative">
                <select
                  value={filterRegion}
                  onChange={(e) => handleFilterRegionChange(e.target.value)}
                  className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition-all"
                >
                  <option value="All">All Regions ({filterOptions.regions.length})</option>
                  {filterOptions.regions.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. City */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">City Franchise</label>
              <div className="relative">
                <select
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition-all"
                >
                  <option value="All">All Cities ({filterOptions.cities.length})</option>
                  {filterOptions.cities.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. Store Format */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Store Format</label>
              <div className="relative">
                <select
                  value={filterFormat}
                  onChange={(e) => setFilterFormat(e.target.value)}
                  className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition-all"
                >
                  <option value="All">All Formats ({filterOptions.formats.length})</option>
                  {filterOptions.formats.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 5. Store Location */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Franchise Location</label>
              <div className="relative">
                <select
                  value={filterStore}
                  onChange={(e) => setFilterStore(e.target.value)}
                  className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition-all"
                >
                  <option value="All">All Stores ({filterOptions.stores.length})</option>
                  {filterOptions.stores.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 6. Product Category */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Product Category</label>
              <div className="relative">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition-all"
                >
                  <option value="All">All Categories ({filterOptions.categories.length})</option>
                  {filterOptions.categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-mono text-right flex items-center justify-end gap-1.5 pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Dataset matching complete: {filteredRows.length.toLocaleString()} out of {(activeDataset.rawRows || []).length.toLocaleString()} database indices</span>
          </div>
        </div>

        {/* Step 2: Region Filter Selector (Cards Layout) */}
        <RegionSelector
          regions={regionNames}
          selectedRegion={selectedRegion}
          onSelectRegion={handleSelectRegion}
          datasetName={activeDataset.name}
        />

        {/* Step 3: High Impact Primary KPI Highlights Bar (Financials) */}
        <div>
          <div className="flex items-center gap-1 mb-3 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Primary Financial Metrics</span>
          </div>
          <div id="kpi-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* 1. Net Sales */}
            <KPICard
              title="Net Sales"
              value={`$${computedMetrics.totalSales.toLocaleString()}`}
              subtext="Consolidated gross receipts"
              icon={<DollarSign size={20} />}
              color="indigo"
            />

            {/* 2. Target Achievement */}
            <KPICard
              title="Target Attainment"
              value={`${computedMetrics.targetAttainment ? computedMetrics.targetAttainment.toFixed(1) : "100"}%`}
              subtext="Quota attainment ratio"
              trend={computedMetrics.targetAttainment - 100}
              icon={<Target size={20} />}
              color={computedMetrics.targetAttainment >= 100 ? "emerald" : "amber"}
            />

            {/* 3. Average Transaction Value (AOV) */}
            <KPICard
              title="Average Ticket (AOV)"
              value={`$${computedMetrics.aov.toFixed(2)}`}
              subtext="Mean checkouts receipt size"
              icon={<Activity size={20} />}
              color="blue"
            />

            {/* 4. Return Rate */}
            <KPICard
              title="Return Rate"
              value={`${computedMetrics.returnRate.toFixed(2)}%`}
              subtext="returns_amount / sales"
              trend={-computedMetrics.returnRate}
              icon={<ArrowDownRight size={20} />}
              color={computedMetrics.returnRate > 4 ? "rose" : "emerald"}
            />

            {/* 5. Discount Rate */}
            <KPICard
              title="Discount Rate"
              value={`${computedMetrics.discountPercentage.toFixed(1)}%`}
              subtext="discount_amount / sales"
              icon={<Percent size={20} />}
              color="amber"
            />

          </div>
        </div>

        {/* Step 3.5: Operational Auditing KPIs (Footfall, Stockouts, Satisfaction) */}
        {hasOperationsMetrics && (
          <div>
            <div className="flex items-center gap-1 mb-3 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Network Operations Audit</span>
            </div>
            <div id="operational-kpi-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPICard
                title="Footfall Conversion"
                value={`${computedMetrics.conversionRate ? computedMetrics.conversionRate.toFixed(1) : "18.5"}%`}
                subtext={`Total Footfall: ${computedMetrics.totalFootfall ? computedMetrics.totalFootfall.toLocaleString() : "N/A"}`}
                icon={<Percent size={20} />}
                color="blue"
              />
              <KPICard
                title="Inventory Stockouts"
                value={computedMetrics.totalStockouts !== undefined ? computedMetrics.totalStockouts.toLocaleString() : "0"}
                subtext="Lost product sales incidences"
                icon={<AlertTriangle size={20} />}
                color={computedMetrics.totalStockouts && computedMetrics.totalStockouts > 15 ? "rose" : "blue"}
              />
              <KPICard
                title="Customer Rating"
                value={`${computedMetrics.avgRating ? computedMetrics.avgRating.toFixed(2) : "4.3"} ★`}
                subtext={computedMetrics.discountPercentage ? `Avg Discount Rate: ${computedMetrics.discountPercentage.toFixed(1)}%` : "NPS weighted score"}
                icon={<Star size={20} />}
                color="amber"
              />
              <KPICard
                title="Marketing ROI"
                value={`${computedMetrics.marketingRoi ? computedMetrics.marketingRoi.toFixed(1) : "0.0"}x`}
                subtext={`Spend: $${computedMetrics.marketingSpend ? computedMetrics.marketingSpend.toLocaleString() : "0"}`}
                icon={<TrendingUp size={20} />}
                color="indigo"
              />
            </div>
          </div>
        )}

        {/* Step 4: Real-time Calculated BI Business Insight summary (Best/Worst region, Stores Missing Target, High Return categories) */}
        <BIInsights
          filteredRows={filteredRows}
          datasetName={activeDataset.name}
        />

        {/* Step 5: AI Business summaries */}
        <AIBriefing
          dataset={activeDataset}
          selectedRegion={selectedRegion}
        />

        {/* Step 6: High Resolution Dynamic Charts Grid (Weekly trend, sales by region, category, stockout risk) */}
        <SalesCharts
          filteredRows={filteredRows}
        />

        {/* Step 7: Store Franchise Leaderboards */}
        <StoreLeaderboard
          topStores={storeLeaderboards.topStores}
          lowStores={storeLeaderboards.lowStores}
        />

      </main>

    </div>
  );
}

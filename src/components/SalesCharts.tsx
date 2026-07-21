import { useState, useMemo } from "react";
import { SalesRow } from "../types";
import { TrendingUp, Percent, DollarSign, Activity, AlertTriangle, BarChart3, Star, ShieldAlert, ShoppingBag, Layers, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SalesChartsProps {
  filteredRows: SalesRow[];
}

export default function SalesCharts({ filteredRows }: SalesChartsProps) {
  const [activeTab, setActiveTab] = useState<"timeline" | "categories" | "stockouts">("timeline");
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  
  // ==========================================
  // 1. DATA AGGREGATION & DERIVATION PIPELINES
  // ==========================================

  // Aggregated Monthly/Weekly Trend
  const monthlyTrend = useMemo(() => {
    const map: Record<string, { sales: number; transactions: number; target: number; footfall: number }> = {};
    filteredRows.forEach(r => {
      if (!map[r.week]) {
        map[r.week] = { sales: 0, transactions: 0, target: 0, footfall: 0 };
      }
      map[r.week].sales += r.sales;
      map[r.week].transactions += r.transactions;
      map[r.week].target += r.target;
      map[r.week].footfall += r.footfall;
    });

    const monthsOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    return Object.keys(map).map(week => ({
      month: week,
      sales: Math.round(map[week].sales),
      transactions: map[week].transactions,
      target: Math.round(map[week].target),
      footfall: map[week].footfall
    })).sort((a, b) => {
      const parseMonthYear = (s: string) => {
        const parts = s.split(" ");
        if (parts.length < 2) return 0;
        const mIdx = monthsOrder.indexOf(parts[0]);
        const yr = parseInt(parts[1]) || 25;
        return yr * 12 + mIdx;
      };
      return parseMonthYear(a.month) - parseMonthYear(b.month);
    });
  }, [filteredRows]);

  // Aggregated Category Performance
  const categorySales = useMemo(() => {
    const map: Record<string, { sales: number; transactions: number; unitsSold: number }> = {};
    filteredRows.forEach(r => {
      if (!map[r.category]) {
        map[r.category] = { sales: 0, transactions: 0, unitsSold: 0 };
      }
      map[r.category].sales += r.sales;
      map[r.category].transactions += r.transactions;
      map[r.category].unitsSold += r.unitsSold;
    });

    return Object.keys(map).map(category => ({
      category,
      sales: Math.round(map[category].sales),
      transactions: map[category].transactions,
      unitsSold: map[category].unitsSold
    })).sort((a, b) => b.sales - a.sales);
  }, [filteredRows]);

  // Aggregated Region Sales
  const regionSales = useMemo(() => {
    const map: Record<string, { sales: number; target: number; transactions: number }> = {};
    filteredRows.forEach(r => {
      if (!map[r.region]) {
        map[r.region] = { sales: 0, target: 0, transactions: 0 };
      }
      map[r.region].sales += r.sales;
      map[r.region].target += r.target;
      map[r.region].transactions += r.transactions;
    });

    return Object.keys(map).map(region => ({
      region,
      sales: Math.round(map[region].sales),
      target: Math.round(map[region].target),
      attainment: map[region].target > 0 ? (map[region].sales / map[region].target) * 100 : 100
    })).sort((a, b) => b.sales - a.sales);
  }, [filteredRows]);

  // Stockout Risk: Top stores suffering from inventory stockouts
  const stockoutByStore = useMemo(() => {
    const map: Record<string, { stockouts: number; sales: number; region: string }> = {};
    filteredRows.forEach(r => {
      if (r.stockouts > 0) {
        if (!map[r.storeName]) {
          map[r.storeName] = { stockouts: 0, sales: 0, region: r.region };
        }
        map[r.storeName].stockouts += r.stockouts;
        map[r.storeName].sales += r.sales;
      }
    });

    return Object.keys(map).map(storeName => ({
      storeName,
      region: map[storeName].region,
      stockouts: map[storeName].stockouts,
      sales: map[storeName].sales
    })).sort((a, b) => b.stockouts - a.stockouts).slice(0, 5);
  }, [filteredRows]);

  // Stockout Risk: Categories most affected by stockouts
  const stockoutByCategory = useMemo(() => {
    const map: Record<string, { stockouts: number; sales: number }> = {};
    filteredRows.forEach(r => {
      if (r.stockouts > 0) {
        if (!map[r.category]) {
          map[r.category] = { stockouts: 0, sales: 0 };
        }
        map[r.category].stockouts += r.stockouts;
        map[r.category].sales += r.sales;
      }
    });

    const totalStockouts = Object.values(map).reduce((sum, curr) => sum + curr.stockouts, 0) || 1;

    return Object.keys(map).map(category => ({
      category,
      stockouts: map[category].stockouts,
      percentage: (map[category].stockouts / totalStockouts) * 100,
      sales: map[category].sales
    })).sort((a, b) => b.stockouts - a.stockouts);
  }, [filteredRows]);

  // General metrics
  const totalSalesVolume = useMemo(() => {
    return categorySales.reduce((acc, curr) => acc + curr.sales, 0);
  }, [categorySales]);

  const totalStockoutsCount = useMemo(() => {
    return filteredRows.reduce((sum, r) => sum + (r.stockouts || 0), 0);
  }, [filteredRows]);

  // Category percentage allocations
  const categoryWithPercentages = useMemo(() => {
    return categorySales.map((c) => ({
      ...c,
      percentage: totalSalesVolume > 0 ? (c.sales / totalSalesVolume) * 100 : 0,
    }));
  }, [categorySales, totalSalesVolume]);

  // ==========================================
  // 2. SVG CHART LAYOUT PARAMETERS
  // ==========================================
  const chartWidth = 720;
  const chartHeight = 280;
  const paddingX = 60;
  const paddingY = 40;

  const pointsData = useMemo(() => {
    if (monthlyTrend.length === 0) return { points: [], dLine: "", dArea: "", dTargetLine: "", yTicks: [], maxSales: 0, minSales: 0 };
    
    const salesValues = monthlyTrend.map(m => m.sales);
    const targetValues = monthlyTrend.map(m => m.target || m.sales);
    const combinedValues = [...salesValues, ...targetValues];

    const maxSales = Math.max(...combinedValues) * 1.08 || 100000;
    const minSales = Math.min(...salesValues) * 0.92 > 0 ? Math.min(...salesValues) * 0.92 : 0;
    const salesRange = maxSales - minSales;

    const points = monthlyTrend.map((t, index) => {
      const x = paddingX + (index / (monthlyTrend.length - 1)) * (chartWidth - paddingX * 2);
      const ratio = salesRange > 0 ? (t.sales - minSales) / salesRange : 0.5;
      const y = chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
      
      const targetVal = t.target !== undefined ? t.target : t.sales;
      const targetRatio = salesRange > 0 ? (targetVal - minSales) / salesRange : 0.5;
      const targetY = chartHeight - paddingY - targetRatio * (chartHeight - paddingY * 2);

      return { x, y, targetY, data: t, index };
    });

    // Create SVG paths
    let dLine = "";
    let dArea = "";
    let dTargetLine = "";

    if (points.length > 0) {
      dLine = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        dLine += ` L ${points[i].x} ${points[i].y}`;
      }
      dArea = `${dLine} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

      const hasCustomTargets = monthlyTrend.some(t => t.target !== undefined && t.target !== t.sales);
      if (hasCustomTargets) {
        dTargetLine = `M ${points[0].x} ${points[0].targetY}`;
        for (let i = 1; i < points.length; i++) {
          dTargetLine += ` L ${points[i].x} ${points[i].targetY}`;
        }
      }
    }

    const yTicks = [0, 0.5, 1].map((ratio) => {
      const val = minSales + ratio * salesRange;
      const y = chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
      return { y, value: val };
    });

    return { points, dLine, dArea, dTargetLine, yTicks, maxSales, minSales };
  }, [monthlyTrend]);

  // Donut SVG parameters
  const donutRadius = 65;
  const donutStrokeWidth = 14;
  const donutCenter = 85;
  const donutCircumference = 2 * Math.PI * donutRadius;

  const donutSegments = useMemo(() => {
    let currentOffset = 0;
    const colors = ["stroke-indigo-600", "stroke-emerald-500", "stroke-amber-400", "stroke-cyan-500", "stroke-rose-500"];
    const fillColors = ["bg-indigo-600", "bg-emerald-500", "bg-amber-400", "bg-cyan-500", "bg-rose-500"];

    return categoryWithPercentages.map((c, index) => {
      const strokeDasharray = `${(c.percentage / 100) * donutCircumference} ${donutCircumference}`;
      const strokeDashoffset = currentOffset;
      currentOffset -= (c.percentage / 100) * donutCircumference;

      return {
        ...c,
        colorClass: colors[index % colors.length],
        bgClass: fillColors[index % fillColors.length],
        strokeDasharray,
        strokeDashoffset,
      };
    });
  }, [categoryWithPercentages, donutCircumference]);

  const showTargetLegend = !!pointsData.dTargetLine;

  return (
    <div id="bi-charts-section" className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
      
      {/* Visual Navigation Tab Headers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
        <div>
          <span className="text-[10px] uppercase font-extrabold text-indigo-600 tracking-wider block">Operational Visualization Platform</span>
          <h2 className="text-lg font-bold text-slate-800">Sales Trends & Deep Diagnostics</h2>
        </div>
        <div className="flex bg-slate-100/80 p-1 rounded-xl gap-1 self-start">
          <button
            onClick={() => setActiveTab("timeline")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "timeline" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Activity size={14} />
            Timeline & Regions
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "categories" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers size={14} />
            Category Matrix
          </button>
          <button
            onClick={() => setActiveTab("stockouts")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 relative cursor-pointer ${
              activeTab === "stockouts" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShieldAlert size={14} />
            Stockout Risk Hub
            {totalStockoutsCount > 15 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            )}
          </button>
        </div>
      </div>

      {/* Tabs Stage Switchboard */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.18 }}
          className="grid grid-cols-1 lg:grid-cols-5 gap-8"
        >
          
          {/* ====================================================
              TAB 1: TIMELINE TRENDS & REGIONAL COMPARATIVE BARS
              ==================================================== */}
          {activeTab === "timeline" && (
            <>
              {/* Timeline chart (col-span-3) */}
              <div id="timeline-sales-chart" className="lg:col-span-3 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800">Weekly Performance Trend</h3>
                    <p className="text-[11px] text-slate-400">Comparing gross weekly revenue realizations with predefined corporate target thresholds</p>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded bg-indigo-600 block"></span>
                      <span>Sales</span>
                    </div>
                    {showTargetLegend && (
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-0.5 border-t border-dashed border-amber-500 block"></span>
                        <span>Target</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative w-full overflow-x-auto py-2">
                  {monthlyTrend.length === 0 ? (
                    <div className="h-[280px] bg-slate-50 rounded-xl flex items-center justify-center text-xs text-slate-400">
                      No active timeline records matching filter variables.
                    </div>
                  ) : (
                    <>
                      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto min-w-[500px]">
                        <defs>
                          <linearGradient id="chart-area-grad-dyn" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.12" />
                            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.00" />
                          </linearGradient>
                        </defs>

                        {/* Y-axis Ticks and Guidelines */}
                        {pointsData.yTicks.map((tick, i) => (
                          <g key={i}>
                            <line x1={paddingX} y1={tick.y} x2={chartWidth - paddingX} y2={tick.y} className="stroke-slate-100" strokeDasharray="4 4" />
                            <text x={paddingX - 10} y={tick.y + 4} className="text-[10px] font-mono fill-slate-400 font-bold" textAnchor="end">
                              ${(tick.value / 1000).toFixed(0)}K
                            </text>
                          </g>
                        ))}

                        {/* Area Shading */}
                        {pointsData.dArea && <path d={pointsData.dArea} fill="url(#chart-area-grad-dyn)" />}

                        {/* Dash Targets Line */}
                        {pointsData.dTargetLine && (
                          <path d={pointsData.dTargetLine} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round" opacity="0.8" />
                        )}

                        {/* Realized Sales Line */}
                        {pointsData.dLine && <path d={pointsData.dLine} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" />}

                        {/* Nodes */}
                        {pointsData.points.map((pt, i) => {
                          const isHovered = hoveredPoint === i;
                          return (
                            <g key={i}>
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r="16"
                                fill="transparent"
                                className="cursor-pointer"
                                onMouseEnter={() => setHoveredPoint(i)}
                                onMouseLeave={() => setHoveredPoint(null)}
                              />
                              {isHovered && <circle cx={pt.x} cy={pt.y} r="8" fill="#4f46e5" fillOpacity="0.15" />}
                              <circle cx={pt.x} cy={pt.y} r={isHovered ? "5.5" : "3.5"} fill={isHovered ? "#4f46e5" : "#ffffff"} stroke="#4f46e5" strokeWidth="2" />
                            </g>
                          );
                        })}

                        {/* X-axis Month/Week Label ticks */}
                        {pointsData.points.map((pt, i) => (
                          <text key={i} x={pt.x} y={chartHeight - paddingY + 20} className={`text-[9px] font-mono font-bold tracking-tight transition-all duration-150 ${hoveredPoint === i ? "fill-slate-900" : "fill-slate-400"}`} textAnchor="middle">
                            {pt.data.month}
                          </text>
                        ))}
                      </svg>

                      {/* Line Hover Tooltip Overlay */}
                      <AnimatePresence>
                        {hoveredPoint !== null && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute bg-slate-900 text-white rounded-xl p-3 shadow-xl border border-slate-800 pointer-events-none text-xs z-10"
                            style={{
                              left: `${(pointsData.points[hoveredPoint].x / chartWidth) * 82 + 5}%`,
                              top: `${(pointsData.points[hoveredPoint].y / chartHeight) * 35 + 20}%`,
                            }}
                          >
                            <p className="font-extrabold text-[10px] text-indigo-300 uppercase tracking-wider mb-1">{monthlyTrend[hoveredPoint].month}</p>
                            <div className="space-y-0.5 font-mono">
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-400">Sales:</span>
                                <span className="font-bold text-emerald-400">${monthlyTrend[hoveredPoint].sales.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-400">Target:</span>
                                <span className="font-bold text-amber-400">${monthlyTrend[hoveredPoint].target.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-400">Tickets:</span>
                                <span className="font-bold text-slate-100">{monthlyTrend[hoveredPoint].transactions.toLocaleString()}</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              </div>

              {/* Sales by Region Horizontal Bars (col-span-2) */}
              <div id="regional-comparative-chart" className="lg:col-span-2 space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">Sales Revenue by Region</h3>
                  <p className="text-[11px] text-slate-400">Distribution of sales volume, contribution shares, and targets across geography groups</p>
                </div>

                <div className="space-y-4">
                  {regionSales.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">No regional data matches applied filter settings.</div>
                  ) : (
                    regionSales.map((r, idx) => {
                      const maxSalesInRegions = Math.max(...regionSales.map(x => x.sales)) || 1;
                      const barWidthPercent = (r.sales / maxSalesInRegions) * 100;
                      
                      return (
                        <div key={r.region} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-slate-700 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                              {r.region}
                            </span>
                            <span className="font-mono text-slate-500">
                              <strong className="text-slate-800">${r.sales.toLocaleString()}</strong>
                              <span className="mx-1 text-slate-300">/</span>
                              ${r.target.toLocaleString()}
                            </span>
                          </div>
                          
                          {/* Progress bar representing sales */}
                          <div className="w-full h-3 bg-slate-50 rounded-full relative overflow-hidden border border-slate-100">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${barWidthPercent}%` }}
                              transition={{ duration: 0.6, delay: idx * 0.08 }}
                              className={`h-full rounded-full ${
                                r.attainment >= 100 ? "bg-emerald-500/90" : (r.attainment >= 90 ? "bg-amber-400/90" : "bg-rose-500/90")
                              }`}
                            ></motion.div>
                          </div>
                          <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold">
                            <span>Index Rank #{idx + 1}</span>
                            <span className={r.attainment >= 100 ? "text-emerald-600" : "text-amber-600"}>
                              {r.attainment.toFixed(1)}% Attainment
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}

          {/* ====================================================
              TAB 2: CATEGORY MATRIX & SHARE breakdowns
              ==================================================== */}
          {activeTab === "categories" && (
            <>
              {/* Category donut share (col-span-2) */}
              <div id="category-donut-chart" className="lg:col-span-2 flex flex-col items-center justify-center space-y-4">
                <div className="text-center w-full">
                  <h3 className="text-sm font-extrabold text-slate-800">Sales Contribution</h3>
                  <p className="text-[11px] text-slate-400">Consolidated product category volume allocation</p>
                </div>

                <div className="relative w-[180px] h-[180px] flex-shrink-0">
                  <svg viewBox="0 0 170 170" className="w-full h-full transform -rotate-90">
                    <circle cx={donutCenter} cy={donutCenter} r={donutRadius} className="stroke-slate-50 fill-none" strokeWidth={donutStrokeWidth + 2} />
                    {donutSegments.map((seg, i) => (
                      <circle
                        key={i}
                        cx={donutCenter}
                        cy={donutCenter}
                        r={donutRadius}
                        className={`fill-none ${seg.colorClass} transition-all duration-300`}
                        strokeWidth={donutStrokeWidth}
                        strokeDasharray={seg.strokeDasharray}
                        strokeDashoffset={seg.strokeDashoffset}
                        strokeLinecap="round"
                      />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Selected Revenue</span>
                    <span className="text-lg font-extrabold text-slate-800">${(totalSalesVolume / 1000).toFixed(0)}K</span>
                  </div>
                </div>
              </div>

              {/* Category bars (col-span-3) */}
              <div id="category-bars-detail" className="lg:col-span-3 space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">Category Sales & Units Sold</h3>
                  <p className="text-[11px] text-slate-400">Analyzing product performance, transaction volume, and unit multipliers</p>
                </div>

                <div className="space-y-4">
                  {donutSegments.map((seg, i) => (
                    <div key={seg.category} className="p-3 bg-slate-50/50 rounded-2xl border border-slate-50 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-md ${seg.bgClass}`}></span>
                          <span className="font-bold text-slate-700">{seg.category}</span>
                        </div>
                        <div className="font-mono text-slate-500 font-semibold">
                          <span>${seg.sales.toLocaleString()}</span>
                          <span className="mx-2 text-slate-200">|</span>
                          <span className="font-bold text-slate-800">{seg.percentage.toFixed(1)}% Share</span>
                        </div>
                      </div>
                      
                      {/* Sub-bar for unit volumes */}
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <ShoppingBag size={11} className="text-slate-400" />
                          {seg.transactions.toLocaleString()} receipts
                        </span>
                        <span className="font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          Avg: {Math.max(1, Math.round(seg.unitsSold / (seg.transactions || 1) * 10) / 10)} units/ticket
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ====================================================
              TAB 3: STOCKOUT RISK HUB
              ==================================================== */}
          {activeTab === "stockouts" && (
            <>
              {/* Critical Alerts (col-span-2) */}
              <div id="stockout-alerts" className="lg:col-span-2 space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">Inventory Health Audit</h3>
                  <p className="text-[11px] text-slate-400">Evaluating supply bottleneck alerts and operational remediation priorities</p>
                </div>

                <div className="space-y-3.5">
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-xs">
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-amber-800 block">Incidents Logged</span>
                      <p className="text-lg font-extrabold text-amber-900 mt-1">{totalStockoutsCount} Active Stockouts</p>
                      <p className="text-[10px] text-amber-700/80 mt-1 font-medium leading-relaxed">
                        Occurrences where local shelves experienced full exhaustion of high-velocity lines (Electronics, Apparel).
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs">
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-indigo-800 block">Lost Value Index</span>
                      <p className="text-lg font-extrabold text-indigo-900 mt-1">
                        ${(totalStockoutsCount * 2850).toLocaleString()} <span className="text-xs text-indigo-600 font-medium">(Estimated Gap)</span>
                      </p>
                      <p className="text-[10px] text-indigo-700/80 mt-1 font-medium leading-relaxed">
                        Estimated revenue deficit assuming median tickets ($2.8K per node checkout) during stockout event cycles.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stockout detailed ranking maps (col-span-3) */}
              <div id="stockout-rankings" className="lg:col-span-3 space-y-5">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">High Risk Nodes & Products</h3>
                  <p className="text-[11px] text-slate-400">Breakdown of specific store locations and product categories causing inventory bottlenecks</p>
                </div>

                {/* Sub-grid: Stores vs Category distress */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Store lists */}
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-extrabold text-rose-500 tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                      Locations Under Strain
                    </span>
                    {stockoutByStore.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400 border border-slate-50 bg-slate-50/20 rounded-xl">
                        Clean audit! No store stockout events.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {stockoutByStore.map(s => (
                          <div key={s.storeName} className="p-2.5 rounded-xl border border-rose-50 bg-rose-50/10 flex items-center justify-between text-xs">
                            <div className="min-w-0 pr-2">
                              <span className="font-bold text-slate-800 block truncate">{s.storeName}</span>
                              <span className="text-[10px] text-slate-400 font-medium block truncate">{s.region} Region</span>
                            </div>
                            <span className="font-extrabold font-mono text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded flex-shrink-0">
                              {s.stockouts} alerts
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Categories list */}
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      Product Category Impact
                    </span>
                    {stockoutByCategory.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400 border border-slate-50 bg-slate-50/20 rounded-xl">
                        Clean audit! No category stockouts.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {stockoutByCategory.map(c => (
                          <div key={c.category} className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                              <span>{c.category}</span>
                              <span className="font-mono text-slate-500">{c.stockouts} events ({c.percentage.toFixed(0)}%)</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${c.percentage}%` }}
                                transition={{ duration: 0.5 }}
                                className="h-full bg-indigo-500 rounded-full"
                              ></motion.div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </>
          )}

        </motion.div>
      </AnimatePresence>

    </div>
  );
}

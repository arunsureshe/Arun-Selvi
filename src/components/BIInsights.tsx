import React, { useMemo, useState } from "react";
import { SalesRow } from "../types";
import { TrendingUp, TrendingDown, AlertCircle, RefreshCw, ChevronDown, ChevronUp, CheckCircle, Download, Award, Ban } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BIInsightsProps {
  filteredRows: SalesRow[];
  datasetName: string;
}

export default function BIInsights({ filteredRows, datasetName }: BIInsightsProps) {
  const [showAllUnderperforming, setShowAllUnderperforming] = useState(false);

  // 1. Regional Analysis
  const regionalMetrics = useMemo(() => {
    const map: Record<string, { sales: number; target: number; returns: number }> = {};
    filteredRows.forEach(r => {
      if (!map[r.region]) {
        map[r.region] = { sales: 0, target: 0, returns: 0 };
      }
      map[r.region].sales += r.sales;
      map[r.region].target += r.target;
      map[r.region].returns += r.returns;
    });

    return Object.keys(map).map(region => {
      const { sales, target, returns } = map[region];
      const attainment = target > 0 ? (sales / target) * 100 : 100;
      const returnRate = sales > 0 ? (returns / sales) * 100 : 0;
      return { region, sales, target, attainment, returnRate };
    }).sort((a, b) => b.sales - a.sales);
  }, [filteredRows]);

  const bestRegion = useMemo(() => {
    if (regionalMetrics.length === 0) return null;
    // Find region with highest attainment
    return [...regionalMetrics].sort((a, b) => b.attainment - a.attainment)[0];
  }, [regionalMetrics]);

  const worstRegion = useMemo(() => {
    if (regionalMetrics.length === 0) return null;
    // Find region with lowest attainment
    return [...regionalMetrics].sort((a, b) => a.attainment - b.attainment)[0];
  }, [regionalMetrics]);

  // 2. Stores Missing Target
  const storesMissingTarget = useMemo(() => {
    const map: Record<string, { sales: number; target: number; region: string; city: string }> = {};
    filteredRows.forEach(r => {
      const key = `${r.storeName} (${r.region})`;
      if (!map[key]) {
        map[key] = { sales: 0, target: 0, region: r.region, city: r.city };
      }
      map[key].sales += r.sales;
      map[key].target += r.target;
    });

    return Object.keys(map).map(storeKey => {
      const { sales, target, region, city } = map[storeKey];
      const attainment = target > 0 ? (sales / target) * 100 : 100;
      const deficit = target - sales;
      // split storeKey back to storeName
      const storeName = storeKey.substring(0, storeKey.lastIndexOf(" ("));
      return { storeName, region, city, sales, target, attainment, deficit };
    })
    .filter(s => s.attainment < 100 && s.deficit > 100) // deficit of more than $100 to avoid rounding noise
    .sort((a, b) => a.attainment - b.attainment);
  }, [filteredRows]);

  // 3. High Return Categories
  const categoryReturns = useMemo(() => {
    const map: Record<string, { sales: number; returns: number }> = {};
    filteredRows.forEach(r => {
      if (!map[r.category]) {
        map[r.category] = { sales: 0, returns: 0 };
      }
      map[r.category].sales += r.sales;
      map[r.category].returns += r.returns;
    });

    return Object.keys(map).map(category => {
      const { sales, returns } = map[category];
      const returnRate = sales > 0 ? (returns / sales) * 100 : 0;
      return { category, sales, returns, returnRate };
    }).sort((a, b) => b.returnRate - a.returnRate); // highest return rate first
  }, [filteredRows]);

  // Exporter for Briefing Summary
  const handleDownloadBriefing = () => {
    let text = `==================================================\n`;
    text += `BUSINESS INSIGHT BRIEFING REPORT\n`;
    text += `Dataset: ${datasetName}\n`;
    text += `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n`;
    text += `==================================================\n\n`;

    text += `1. REGIONAL PERFORMANCE HIGHLIGHTS\n`;
    if (bestRegion) {
      text += `   - BEST PERFORMING REGION: ${bestRegion.region}\n`;
      text += `     Total Net Sales: $${bestRegion.sales.toLocaleString()}\n`;
      text += `     Target Achievement: ${bestRegion.attainment.toFixed(1)}%\n`;
      text += `     Average Return Rate: ${bestRegion.returnRate.toFixed(1)}%\n\n`;
    }
    if (worstRegion && worstRegion.region !== bestRegion?.region) {
      text += `   - WEAKEST PERFORMING REGION: ${worstRegion.region}\n`;
      text += `     Total Net Sales: $${worstRegion.sales.toLocaleString()}\n`;
      text += `     Target Achievement: ${worstRegion.attainment.toFixed(1)}%\n`;
      text += `     Average Return Rate: ${worstRegion.returnRate.toFixed(1)}%\n\n`;
    }

    text += `2. HIGH RETURN CATEGORY AUDIT\n`;
    categoryReturns.forEach(c => {
      const riskStatus = c.returnRate > 5 ? "⚠️ CRITICAL LEVEL" : (c.returnRate > 3 ? "⚠️ WARNING LEVEL" : "✅ NORMAL");
      text += `   - ${c.category}: Return Rate of ${c.returnRate.toFixed(2)}% ($${c.returns.toLocaleString()} returned on sales of $${c.sales.toLocaleString()}) - Status: ${riskStatus}\n`;
    });
    text += `\n`;

    text += `3. UNDERPERFORMING STORE LIST (Target Attainment < 100%)\n`;
    if (storesMissingTarget.length === 0) {
      text += `   - Excellent! All store locations are currently meeting or exceeding sales targets.\n`;
    } else {
      storesMissingTarget.forEach((s, idx) => {
        text += `   [${idx + 1}] ${s.storeName} (${s.city}, ${s.region})\n`;
        text += `       Target: $${s.target.toLocaleString()} | Actual: $${s.sales.toLocaleString()} (${s.attainment.toFixed(1)}% Attainment)\n`;
        text += `       Deficit GAP: -$${Math.round(s.deficit).toLocaleString()}\n`;
      });
    }

    text += `\n==================================================\n`;
    text += `End of Automated Sales Intelligence Briefing\n`;

    const blob = new Blob([text], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `retail_sales_insight_briefing.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const visibleStores = showAllUnderperforming ? storesMissingTarget : storesMissingTarget.slice(0, 3);

  return (
    <div id="bi-insights-hub" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="text-indigo-600" size={22} />
            Network Performance & Business Insights
          </h2>
          <p className="text-xs text-slate-500">
            Automated operational breakdowns, risk alerts, and remediation opportunities calculated in real-time.
          </p>
        </div>
        <button
          onClick={handleDownloadBriefing}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-indigo-700 font-semibold text-xs border border-indigo-100 hover:bg-indigo-50 active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          <Download size={14} />
          Export Insights Report (TXT)
        </button>
      </div>

      {/* Bento Grid */}
      <div id="insights-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Regional Health */}
        <div id="insight-card-regional" className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider block mb-1">Region Comparative Diagnostics</span>
            <h3 className="text-base font-bold text-slate-800">Best & Worst Regions</h3>
            <p className="text-xs text-slate-400 mt-0.5 mb-4">Target attainment and operational efficiency indexed dynamically</p>
            
            <div className="space-y-4">
              {/* Best Region */}
              {bestRegion ? (
                <div className="p-3.5 rounded-xl border border-emerald-50 bg-emerald-50/20 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500 text-white shadow-xs">
                    <Award size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-sm">{bestRegion.region}</span>
                      <span className="text-xs font-extrabold text-emerald-600 font-mono bg-emerald-50 px-1.5 py-0.5 rounded">
                        {bestRegion.attainment.toFixed(1)}% Att.
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Highest relative performance. Generated <strong className="text-slate-700">${bestRegion.sales.toLocaleString()}</strong> in net revenue.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-slate-400 text-center py-4 text-xs">No region data matching filter.</div>
              )}

              {/* Worst Region */}
              {worstRegion && worstRegion.region !== bestRegion?.region ? (
                <div className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/10 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500 text-white shadow-xs">
                    <TrendingDown size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-sm">{worstRegion.region}</span>
                      <span className="text-xs font-extrabold text-amber-600 font-mono bg-amber-50 px-1.5 py-0.5 rounded">
                        {worstRegion.attainment.toFixed(1)}% Att.
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Underachieving growth index. Deficit gap is currently <strong className="text-slate-700">-${Math.round(worstRegion.target - worstRegion.sales).toLocaleString()}</strong>.
                    </p>
                  </div>
                </div>
              ) : bestRegion ? (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-xs text-slate-500">
                  <CheckCircle size={14} className="text-emerald-500 mr-1.5" />
                  All active regions performing uniformly.
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Card 2: High Return Product Categories */}
        <div id="insight-card-returns" className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-rose-500 tracking-wider block mb-1">Return Rate Auditing</span>
            <h3 className="text-base font-bold text-slate-800">High Return Categories</h3>
            <p className="text-xs text-slate-400 mt-0.5 mb-4">Tracking return rate (returns / net sales * 100) to optimize inventory quality</p>
            
            <div className="space-y-3">
              {categoryReturns.map((c, idx) => {
                const isHighReturn = c.returnRate >= 5;
                const isMedReturn = c.returnRate >= 3 && c.returnRate < 5;
                
                return (
                  <div key={c.category} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-50 bg-slate-50/30 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400 w-4">#{idx+1}</span>
                      <div>
                        <span className="text-xs font-semibold text-slate-700 block">{c.category}</span>
                        <span className="text-[10px] text-slate-400 font-mono">${c.returns.toLocaleString()} returns</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-extrabold font-mono px-1.5 py-0.5 rounded ${
                        isHighReturn ? "bg-rose-50 text-rose-600 border border-rose-100 animate-pulse" :
                        isMedReturn ? "bg-amber-50 text-amber-600 border border-amber-100" :
                        "bg-emerald-50 text-emerald-600"
                      }`}>
                        {c.returnRate.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 3: Underperforming Stores Missing Target */}
        <div id="insight-card-underperforming" className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider block mb-1">Store Remediation Audit</span>
            <h3 className="text-base font-bold text-slate-800">Stores Missing Target</h3>
            <p className="text-xs text-slate-400 mt-0.5 mb-3">Locations where sales revenue is below the defined weekly target quota</p>
            
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {storesMissingTarget.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-1.5 h-full">
                  <div className="p-2 rounded-full bg-emerald-50 text-emerald-500">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">Perfect Execution!</p>
                    <p className="text-[10px]">All nodes currently meeting targets.</p>
                  </div>
                </div>
              ) : (
                visibleStores.map((s) => (
                  <div key={s.storeName} className="p-2.5 rounded-xl border border-rose-50 bg-rose-50/10 hover:bg-rose-50/20 transition-colors flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-800 block truncate">{s.storeName}</span>
                      <span className="text-[10px] text-slate-400 font-medium block truncate">{s.city}, {s.region}</span>
                    </div>
                    <div className="text-right flex-shrink-0 font-mono">
                      <span className="text-xs font-bold text-rose-600 block">-{Math.round(s.attainment)}%</span>
                      <span className="text-[9px] text-slate-500 block">GAP: -${Math.round(s.deficit).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {storesMissingTarget.length > 3 && (
              <button
                onClick={() => setShowAllUnderperforming(!showAllUnderperforming)}
                className="w-full mt-2 py-1.5 text-center text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-1 transition-colors border-t border-slate-100 cursor-pointer"
              >
                {showAllUnderperforming ? (
                  <>
                    Show Less <ChevronUp size={12} />
                  </>
                ) : (
                  <>
                    View All {storesMissingTarget.length} Underachievers <ChevronDown size={12} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

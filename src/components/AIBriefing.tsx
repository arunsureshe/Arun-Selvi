import { useState, useEffect } from "react";
import { SalesDataset, AIAnalysisResult } from "../types";
import { Sparkles, Loader2, ArrowRight, ClipboardCheck, TrendingUp, AlertCircle, RefreshCw, Key, FileText, Download } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AIBriefingProps {
  dataset: SalesDataset;
  selectedRegion: string | null;
}

const STRATEGIC_PHRASES = [
  "Consolidating multi-region sales parameters...",
  "Running YoY category momentum analysis...",
  "Evaluating underperforming franchise nodes...",
  "Extracting high-margin private label opportunities...",
  "Generating strategic Board of Directors recommendation checklist...",
  "Executing server-side Gemini Retail intelligence model..."
];

export default function AIBriefing({ dataset, selectedRegion }: AIBriefingProps) {
  const [loading, setLoading] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rotate through loading sentences to create an extremely professional feel
  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setPhraseIndex((prev) => (prev + 1) % STRATEGIC_PHRASES.length);
      }, 2500);
    } else {
      setPhraseIndex(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          dataset,
          selectedRegion
        })
      });

      if (!response.ok) {
        throw new Error("Analysis failed. Server returned an error.");
      }

      const data = await response.json();
      setAnalysisResult(data.analysis);
      setIsSimulated(!!data.isSimulated);
    } catch (err: any) {
      setError(err.message || "Failed to contact analysis server.");
    } finally {
      setLoading(false);
    }
  };

  const downloadTextReport = () => {
    if (!analysisResult) return;
    const textReport = `RETAIL OPERATIONS EXECUTIVE REPORT
==================================
Dataset: ${dataset.name}
Scope Focus: ${selectedRegion || "National Aggregation"}
Aggregate Revenue: $${dataset.aggregateKPIs.totalSales.toLocaleString()}
==================================

EXECUTIVE SUMMARY
-----------------
${analysisResult.executiveSummary}

REGIONAL AUDIT MATRIX
---------------------
${analysisResult.regionalInsights.map(r => `Region: ${r.region}
- Key takeaway: ${r.keyObservation}
- Core asset: ${r.strength}
- Operational action: ${r.actionItem}`).join("\n\n")}

CATEGORY STRATEGIES
-------------------
${analysisResult.categoryOpportunities.map(c => `Category: ${c.category} (${c.trend.toUpperCase()})
- Strategic Directive: ${c.strategicAction}`).join("\n\n")}

CRITICAL BOARD RECOMMENDATIONS
------------------------------
${analysisResult.criticalActionItems.map((item, i) => `${i + 1}. [ ] ${item}`).join("\n")}`;

    const blob = new Blob([textReport], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `retail_sales_report_${selectedRegion || "national"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div id="ai-briefing-panel" className="bg-slate-900 text-white rounded-3xl p-6 lg:p-8 shadow-xl border border-slate-800 relative overflow-hidden mb-6">
      
      {/* Dynamic ambient decoration representing intelligence intelligence background */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10">
        
        {/* Panel Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest">
              <Sparkles size={16} className="animate-pulse" />
              <span>Generative AI Sales Intelligence</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">AI Executive Intelligence Summary</h2>
            <p className="text-xs text-slate-400">
              Run server-side Gemini reasoning audits on current regional sales, trends, category vectors, and flagship nodes
            </p>
          </div>

          {!loading && (
            <button
              id="btn-run-ai-analysis"
              onClick={runAnalysis}
              className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20 cursor-pointer active:scale-95 transition-all"
            >
              <Sparkles size={14} />
              {analysisResult ? "Re-Run Audit" : "Generate Board Briefing"}
            </button>
          )}
        </div>

        {/* State 1: Ready to run (Empty state) */}
        {!loading && !analysisResult && !error && (
          <div id="ai-ready-screen" className="py-12 flex flex-col items-center text-center max-w-md mx-auto">
            <div className="p-4 rounded-full bg-slate-800 text-indigo-400 mb-4 border border-slate-700">
              <Sparkles size={28} />
            </div>
            <h3 className="text-lg font-bold">Executive Advisor is Ready</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Generate a comprehensive audit. Our intelligence engine analyzes sales gaps, local flags, store leaderboards, and compiles a ready-to-present boardroom action list.
            </p>
            <button
              id="btn-run-ai-central"
              onClick={runAnalysis}
              className="mt-6 py-2.5 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              Analyze Dataset
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* State 2: Auditing / Loading with rotating operational phrases */}
        {loading && (
          <div id="ai-loading-screen" className="py-16 flex flex-col items-center justify-center text-center">
            <div className="relative mb-6">
              <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-indigo-300">AI</div>
            </div>
            <h3 className="text-lg font-semibold text-slate-200">Processing Intelligence Audit</h3>
            
            {/* Smooth faded phrase slider */}
            <div className="h-6 mt-2 overflow-hidden max-w-md">
              <AnimatePresence mode="wait">
                <motion.p
                  key={phraseIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs text-indigo-300 font-mono"
                >
                  {STRATEGIC_PHRASES[phraseIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* State 3: Error */}
        {error && (
          <div id="ai-error-screen" className="p-4 bg-rose-950/30 border border-rose-900/60 rounded-xl flex items-start gap-3 text-rose-300 text-xs my-6">
            <AlertCircle size={16} className="text-rose-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-bold">Operational Pipeline Fault</p>
              <p>{error}</p>
              <button
                onClick={runAnalysis}
                className="mt-2 text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={12} />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* State 4: Completed Rich Output */}
        {analysisResult && !loading && (
          <motion.div
            id="ai-analysis-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Warning when relying on high-fidelity simulative data */}
            {isSimulated && (
              <div className="p-4 bg-amber-950/25 border border-amber-900/40 rounded-xl flex items-start gap-3 text-amber-300 text-xs">
                <Key size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold">Simulated Business Summaries Mode: </span>
                  No active server-side <code className="bg-slate-800 text-amber-300 px-1 py-0.5 rounded">GEMINI_API_KEY</code> is configured in Secrets. Re-run this audit with your API key set in the <span className="font-semibold text-slate-100">Settings &gt; Secrets</span> menu to unlock real, custom generative analyses.
                </div>
              </div>
            )}

            {/* Executive Summary Block */}
            <div className="bg-slate-800/45 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <FileText size={16} />
                Executive Summary
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed font-sans first-letter:text-3xl first-letter:font-bold first-letter:text-indigo-400 first-letter:mr-2 first-letter:float-left">
                {analysisResult.executiveSummary}
              </p>
            </div>

            {/* Regional Matrix (Bento style grid) */}
            <div>
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4">
                Regional Diagnostic Matrix
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysisResult.regionalInsights.map((region, i) => (
                  <div
                    id={`regional-bento-${i}`}
                    key={region.region}
                    className="p-5 rounded-2xl bg-slate-800/25 border border-slate-800/80 hover:border-slate-700 transition-colors"
                  >
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block border-b border-slate-800 pb-2 mb-3">
                      {region.region} Scope
                    </span>
                    <div className="space-y-3 text-xs leading-relaxed">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Diagnostic</span>
                        <p className="text-slate-200">{region.keyObservation}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Primary Asset</span>
                        <p className="text-emerald-400 font-semibold">{region.strength}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Remediation Blueprint</span>
                        <p className="text-amber-300">{region.actionItem}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Split row: Category Plans & Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Category Strategies */}
              <div className="bg-slate-800/25 border border-slate-800/80 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4">
                  Strategic Category Directionals
                </h3>
                <div className="space-y-4">
                  {analysisResult.categoryOpportunities.map((cat, i) => (
                    <div key={i} className="flex items-start gap-3 border-b border-slate-800/50 pb-3 last:border-0 last:pb-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase mt-0.5 ${
                        cat.trend === 'growth' ? 'bg-emerald-900/30 text-emerald-400' :
                        cat.trend === 'declining' ? 'bg-rose-950/50 text-rose-400' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {cat.trend}
                      </span>
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-slate-200 text-xs">{cat.category}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{cat.strategicAction}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Board Checklist */}
              <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                  <span>Executive Board Action Checklist</span>
                  <ClipboardCheck size={16} className="text-indigo-400" />
                </h3>
                <div className="space-y-3">
                  {analysisResult.criticalActionItems.map((item, i) => (
                    <div id={`checklist-item-${i}`} key={i} className="flex items-start gap-3 group">
                      <div className="w-5 h-5 rounded-md border border-indigo-500/30 flex items-center justify-center text-[10px] font-bold text-indigo-400 bg-indigo-500/5 mt-0.5 flex-shrink-0 group-hover:border-indigo-400 transition-colors">
                        0{i + 1}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed group-hover:text-white transition-colors">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Download/Export Action bar */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-800/80 pt-6">
              <button
                id="btn-download-report"
                type="button"
                onClick={downloadTextReport}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-all"
              >
                <Download size={14} />
                Export Text Report
              </button>
            </div>

          </motion.div>
        )}

      </div>
    </div>
  );
}

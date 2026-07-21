import { StorePerformance } from "../types";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Store, Star, AlertTriangle, Percent, MapPin } from "lucide-react";
import { motion } from "motion/react";

interface StoreLeaderboardProps {
  topStores: StorePerformance[];
  lowStores: StorePerformance[];
}

export default function StoreLeaderboard({ topStores, lowStores }: StoreLeaderboardProps) {
  return (
    <div id="leaderboard-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      
      {/* Top Performing Stores */}
      <div id="top-stores-card" className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-xs uppercase tracking-wider mb-1">
            <TrendingUp size={14} />
            <span>Top Performing Franchise Nodes</span>
          </div>
          <h3 className="text-lg font-bold text-slate-800">Flagship Leaders</h3>
          <p className="text-xs text-slate-400 mt-0.5">Locations meeting or exceeding operational target levels</p>
        </div>

        <div className="mt-4 space-y-3">
          {topStores.map((store, index) => (
            <motion.div
              id={`top-store-${index}`}
              key={store.storeName}
              whileHover={{ x: 4 }}
              className="p-4 rounded-xl border border-emerald-50 bg-emerald-50/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-500 text-white shadow-sm flex-shrink-0 mt-0.5">
                  <Store size={16} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h4 className="font-semibold text-slate-800 text-sm tracking-tight">{store.storeName}</h4>
                    {store.storeFormat && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 uppercase">
                        {store.storeFormat}
                      </span>
                    )}
                  </div>
                  
                  {/* City and Tickets */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[11px] text-slate-500">
                    {store.city && (
                      <span className="flex items-center gap-0.5 font-medium text-slate-600">
                        <MapPin size={10} className="text-slate-400" />
                        {store.city}
                      </span>
                    )}
                    <span className="font-mono">{store.transactions.toLocaleString()} checkouts</span>
                  </div>

                  {/* Rating / Conversion row */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                    {store.customerRating !== undefined && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                        <Star size={10} className="fill-amber-600 text-amber-600" />
                        <span>{store.customerRating.toFixed(1)}</span>
                      </div>
                    )}
                    {store.conversionRate !== undefined && store.conversionRate > 0 && (
                      <div className="flex items-center gap-0.5 text-[10px] font-medium text-indigo-600 bg-indigo-50/70 px-1.5 py-0.5 rounded">
                        <Percent size={10} />
                        <span>{store.conversionRate}% Conv.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0 mt-1 sm:mt-0">
                <span className="font-bold text-slate-800 text-sm block">${store.sales.toLocaleString()}</span>
                <div className="flex items-center gap-1.5 text-xs font-bold mt-0.5">
                  {store.targetAttainment !== undefined ? (
                    <span className="text-[10px] font-mono text-indigo-600 font-semibold">
                      {store.targetAttainment}% Target
                    </span>
                  ) : null}
                  <span className="flex items-center gap-0.5 text-emerald-600">
                    <ArrowUpRight size={12} />
                    <span>+{store.growth}%</span>
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Underperforming Areas or Remediation Store Opportunities */}
      <div id="remediation-stores-card" className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-rose-600 font-semibold text-xs uppercase tracking-wider mb-1">
            <TrendingDown size={14} />
            <span>Remediation & Footprint Targets</span>
          </div>
          <h3 className="text-lg font-bold text-slate-800">Support & Strategy Opportunities</h3>
          <p className="text-xs text-slate-400 mt-0.5">Locations requiring operational optimization or inventory replenishment</p>
        </div>

        <div className="mt-4 space-y-3">
          {lowStores.map((store, index) => (
            <motion.div
              id={`low-store-${index}`}
              key={store.storeName}
              whileHover={{ x: 4 }}
              className="p-4 rounded-xl border border-rose-50 bg-rose-50/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-rose-500 text-white shadow-sm flex-shrink-0 mt-0.5">
                  <Store size={16} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h4 className="font-semibold text-slate-800 text-sm tracking-tight">{store.storeName}</h4>
                    {store.storeFormat && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700 uppercase">
                        {store.storeFormat}
                      </span>
                    )}
                  </div>
                  
                  {/* City and Tickets */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[11px] text-slate-500">
                    {store.city && (
                      <span className="flex items-center gap-0.5 font-medium text-slate-600">
                        <MapPin size={10} className="text-slate-400" />
                        {store.city}
                      </span>
                    )}
                    <span className="font-mono">{store.transactions.toLocaleString()} checkouts</span>
                  </div>

                  {/* Rating, Conversion & Stockouts alerts */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                    {store.customerRating !== undefined && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        <Star size={10} className="fill-slate-500 text-slate-500" />
                        <span>{store.customerRating.toFixed(1)}</span>
                      </div>
                    )}
                    {store.stockouts !== undefined && store.stockouts > 0 && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded animate-pulse">
                        <AlertTriangle size={10} />
                        <span>{store.stockouts} Stockouts</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0 mt-1 sm:mt-0">
                <span className="font-bold text-slate-800 text-sm block">${store.sales.toLocaleString()}</span>
                <div className="flex items-center gap-1.5 text-xs font-bold mt-0.5">
                  {store.targetAttainment !== undefined ? (
                    <span className="text-[10px] font-mono text-rose-600 font-semibold">
                      {store.targetAttainment}% Target
                    </span>
                  ) : null}
                  <span className="flex items-center gap-0.5 text-rose-600">
                    <ArrowDownRight size={12} />
                    <span>{store.growth}%</span>
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
}

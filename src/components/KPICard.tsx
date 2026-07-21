import { ReactNode } from "react";
import { motion } from "motion/react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtext: string;
  trend?: number; // e.g., +4.2 or -1.5
  trendLabel?: string;
  icon: ReactNode;
  color?: "blue" | "emerald" | "amber" | "indigo" | "rose";
}

export default function KPICard({
  title,
  value,
  subtext,
  trend,
  trendLabel = "vs last year",
  icon,
  color = "blue"
}: KPICardProps) {
  const isPositive = trend !== undefined && trend >= 0;

  const colorClasses = {
    blue: {
      bg: "bg-blue-50/50 dark:bg-blue-950/20",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-100 dark:border-blue-900/50",
      glow: "hover:shadow-blue-500/5"
    },
    emerald: {
      bg: "bg-emerald-50/50 dark:bg-emerald-950/20",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-100 dark:border-emerald-900/50",
      glow: "hover:shadow-emerald-500/5"
    },
    amber: {
      bg: "bg-amber-50/50 dark:bg-amber-950/20",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-100 dark:border-amber-900/50",
      glow: "hover:shadow-amber-500/5"
    },
    indigo: {
      bg: "bg-indigo-50/50 dark:bg-indigo-950/20",
      text: "text-indigo-600 dark:text-indigo-400",
      border: "border-indigo-100 dark:border-indigo-900/50",
      glow: "hover:shadow-indigo-500/5"
    },
    rose: {
      bg: "bg-rose-50/50 dark:bg-rose-950/20",
      text: "text-rose-600 dark:text-rose-400",
      border: "border-rose-100 dark:border-rose-900/50",
      glow: "hover:shadow-rose-500/5"
    }
  };

  const selectedColor = colorClasses[color] || colorClasses.blue;

  return (
    <motion.div
      id={`kpi-card-${title.toLowerCase().replace(/\s+/g, "-")}`}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative p-6 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all duration-300 ${selectedColor.glow}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            {title}
          </span>
          <h3 className="text-3xl font-bold text-slate-800 tracking-tight">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl ${selectedColor.bg} ${selectedColor.text}`}>
          {icon}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs">
        <span className="text-slate-500">{subtext}</span>
        {trend !== undefined && (
          <div className="flex items-center gap-1.5 font-semibold">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                isPositive
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-rose-50 text-rose-600"
              }`}
            >
              {isPositive ? "+" : ""}
              {trend}%
            </span>
            <span className="text-slate-400 font-normal">{trendLabel}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

import { AlertCircle, TrendingDown, TrendingUp } from "lucide-react";

export type InsightData = {
  risk: "low" | "medium" | "high";
  title: string;
  recommendation: string;
};

type RiskIndicatorProps = {
  risk: "low" | "medium" | "high";
};

function RiskIndicator({ risk }: RiskIndicatorProps) {
  const riskConfig = {
    low: { bg: "bg-emerald-500/20", border: "border-emerald-500/30", dot: "bg-emerald-400" },
    medium: { bg: "bg-amber-500/20", border: "border-amber-500/30", dot: "bg-amber-400" },
    high: { bg: "bg-red-500/20", border: "border-red-500/30", dot: "bg-red-400" },
  };

  const config = riskConfig[risk];

  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full ${config.bg} border ${config.border}`}>
      <div className={`w-2 h-2 rounded-full ${config.dot}`} />
      <span className="text-[10px] font-semibold uppercase tracking-wider text-white/80">{risk}</span>
    </div>
  );
}

export function InsightCard({ title, recommendation, risk }: InsightData) {
  return (
    <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all duration-200 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[11px] font-bold text-white/90 uppercase tracking-wide">{title}</h3>
        <RiskIndicator risk={risk} />
      </div>
      <p className="text-[10px] leading-relaxed text-slate-300 font-light">{recommendation}</p>
    </div>
  );
}

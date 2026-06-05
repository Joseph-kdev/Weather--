import { CalendarDays, Droplets } from "lucide-react";
import type { DailySummary } from "../lib/weather";

type DailySummariesPanelProps = {
  summaries: DailySummary[];
};

export function DailySummariesPanel({ summaries }: DailySummariesPanelProps) {
  return (
    <section className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl hover:border-white/20 transition-all duration-300 min-h-[160px] flex flex-col justify-between" aria-label="Daily summaries">
      <div>
        <div className="space-y-2">
          {summaries.slice(0, 5).map((summary) => (
            <div className="grid grid-cols-[54px_48px_30px_1fr] items-center gap-1.5 text-[16px] py-0.5" key={summary.day}>
              <span className="text-slate-200">{summary.day}</span>
              <span className="flex items-center gap-0.5 text-blue-400 text-sm">
                <Droplets aria-hidden className="size-3 text-blue-400" />
                {Math.round(summary.precipitationChance)}%
              </span>
              <div className="flex justify-center">
                <img 
                  src={summary.icon} 
                  className="size-4.5 object-contain filter drop-shadow-[0_0_4px_rgba(255,255,255,0.15)]" 
                  alt={summary.condition} 
                />
              </div>
              <span className="text-right text-sm text-slate-100">
                {Math.round(summary.highC)}° /<span className="text-slate-400 font-light ml-0.5">{Math.round(summary.lowC)}°</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

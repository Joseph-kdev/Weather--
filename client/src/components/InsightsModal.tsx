import { X, AlertCircle } from "lucide-react";
import { InsightCard, type InsightData } from "./InsightCard";

export type InsightsData = {
  travel: InsightData;
  fitness: InsightData;
  health: InsightData;
  eventPlanning: InsightData;
};

type InsightsModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  insights: InsightsData | null;
  onClose: () => void;
};

export function InsightsModal({ isOpen, isLoading, error, insights, onClose }: InsightsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-gradient-to-b from-slate-900/95 to-slate-950/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="border-b border-white/5 p-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-violet-400">⚡</span> Weather Insights
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="size-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-violet-600 rounded-full opacity-20 animate-pulse" />
                <div className="absolute inset-1 bg-gradient-to-r from-violet-400 to-violet-500 rounded-full opacity-30 animate-pulse" />
                <div className="absolute inset-2 bg-violet-500/10 rounded-full animate-spin" />
              </div>
              <p className="text-sm text-slate-400">Generating insights...</p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="size-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-300 text-sm">Error</h3>
                <p className="text-sm text-red-200/80">{error}</p>
              </div>
            </div>
          )}

          {insights && !isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InsightCard {...insights.travel} />
              <InsightCard {...insights.fitness} />
              <InsightCard {...insights.health} />
              <InsightCard {...insights.eventPlanning} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

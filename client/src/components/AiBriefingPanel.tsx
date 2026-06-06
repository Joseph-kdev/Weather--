import { Lightbulb, AlertCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { WeatherDashboard } from "../lib/weather";
import { fetchAiBriefing, fetchInsights, type WeatherInsights } from "../services/weather";
import { InsightsModal } from "./InsightsModal";

export function AiBriefingPanel({ weatherData, isReal }: {weatherData: WeatherDashboard; isReal: string}) {
  const [state, setState] = useState({
    briefing: "",
    isLoading: false,
    error: ""
  });

  const [insightsState, setInsightsState] = useState({
    isModalOpen: false,
    isLoading: false,
    error: null as string | null,
    insights: null as WeatherInsights | null
  });

  const generateBriefing = useCallback(async (): Promise<void> => {
    if(isReal != "ready") {
      return;
    }
    if (!weatherData) {
      setState({
        briefing: "",
        isLoading: false,
        error: "Weather data is not available",
      });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: "", briefing: "" }));

    try {
      await fetchAiBriefing(weatherData, (chunk) => {
        setState(prev => ({
          ...prev,
          briefing: prev.briefing + chunk,
        }));
      });
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: "",
      }));
    } catch (error) {
      console.error(`AI Briefing attempt failed:`, error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: "Failed to generate briefing",
      }));
    }
  }, [weatherData]);

  const handleOpenInsights = useCallback(async () => {
    if (!weatherData) {
      setInsightsState(prev => ({
        ...prev,
        error: "Weather data is not available"
      }));
      return;
    }

    setInsightsState(prev => ({
      ...prev,
      isModalOpen: true,
      isLoading: true,
      error: null,
      insights: null
    }));

    try {
      const insights = await fetchInsights(weatherData);
      setInsightsState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
        insights
      }));
    } catch (error) {
      console.error("Failed to fetch insights:", error);
      setInsightsState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to generate insights"
      }));
    }
  }, [weatherData]);

  const handleCloseInsights = useCallback(() => {
    setInsightsState(prev => ({
      ...prev,
      isModalOpen: false
    }));
  }, []);

  useEffect(() => {
    if(weatherData) {
      generateBriefing()
    }
  }, [weatherData]);

  return (
    <>
      <section className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl hover:border-white/20 transition-all duration-300 flex flex-col justify-between min-h-[160px]" aria-label="AI briefing">
        <div>
          <h2 className="mb-2.5 text-[10px] font-bold text-violet-300 uppercase tracking-wider flex items-center gap-1">
            <Lightbulb className="size-3 text-violet-400" />
            AI Briefing
          </h2>
          
          {state.isLoading && (
            <div className="flex items-center gap-2">
              <div className="relative w-3 h-3">
                <div className="absolute inset-0 bg-violet-500/30 rounded-full animate-pulse" />
                <div className="absolute inset-1 bg-violet-400/50 rounded-full animate-ping" />
              </div>
              <p className="text-[9.5px] text-slate-400 font-light">Generating briefing...</p>
            </div>
          )}
          
          {state.error && (
            <div className="flex items-start gap-2">
              <AlertCircle className="size-3.5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[9.5px] text-red-300 font-semibold">Error</p>
                <p className="text-[9px] text-red-200/75 leading-relaxed">{state.error}</p>
              </div>
            </div>
          )}
          
          {!state.isLoading && !state.error && (
            <p className="text-[9.5px] leading-relaxed text-slate-300 font-light">{state.briefing}</p>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleOpenInsights}
            disabled={state.isLoading || state.error !== ""}
            className="inline-flex h-6 items-center gap-1.5 bg-white/5 hover:bg-white/12 disabled:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 border border-white/8 px-2.5 py-1 rounded-full text-[9px] font-semibold text-white tracking-wide transition-all shadow-sm"
            type="button"
          >
            <Lightbulb aria-hidden className="size-3 text-amber-400 fill-amber-400/20" />
            Insights
          </button>
        </div>
      </section>

      <InsightsModal
        isOpen={insightsState.isModalOpen}
        isLoading={insightsState.isLoading}
        error={insightsState.error}
        insights={insightsState.insights}
        onClose={handleCloseInsights}
      />
    </>
  );
}

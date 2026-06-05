import { Lightbulb } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { WeatherDashboard } from "../lib/weather";
import { fetchAiBriefing } from "../services/weather";

export function AiBriefingPanel({ weatherData }: {weatherData: WeatherDashboard}) {
  const [state, setState] = useState({
    briefing: "",
    isLoading: false,
    error: ""
  });

  const generateBriefing = useCallback(async (): Promise<void> => {
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

  useEffect(() => {
    if(weatherData) {
      generateBriefing()
    }
  }, [weatherData]);

  return (
    <section className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl hover:border-white/20 transition-all duration-300 flex flex-col justify-between min-h-[160px]" aria-label="AI briefing">
      <div>
        <h2 className="mb-2.5 text-[10px] font-bold text-violet-300 uppercase tracking-wider flex items-center gap-1">
          <Lightbulb className="size-3 text-violet-400" />
          AI Briefing
        </h2>
        <p className="text-[9.5px] leading-relaxed text-slate-300 font-light">{state.briefing}</p>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          className="inline-flex h-6 items-center gap-1.5 bg-white/5 hover:bg-white/12 active:scale-95 border border-white/8 px-2.5 py-1 rounded-full text-[9px] font-semibold text-white tracking-wide transition-all shadow-sm"
          type="button"
        >
          <Lightbulb aria-hidden className="size-3 text-amber-400 fill-amber-400/20" />
          Insights
        </button>
      </div>
    </section>
  );
}

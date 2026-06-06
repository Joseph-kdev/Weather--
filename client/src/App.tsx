import { useEffect, useState } from "react";
import { AiBriefingPanel } from "./components/AiBriefingPanel";
import { CurrentWeatherPanel } from "./components/CurrentWeatherPanel";
import { DailySummariesPanel } from "./components/DailySummariesPanel";
import { HourlyForecastPanel } from "./components/HourlyForecastPanel";
import { DEFAULT_DASHBOARD, type WeatherDashboard } from "./lib/weather";
import { fetchWeatherDashboard } from "./services/weather";

function getBackgroundGradient(condition: string): string {
  const c = condition.toLowerCase();
  if (c.includes("thunderstorm") || c.includes("storm")) {
    return "from-slate-950 via-slate-900 to-violet-950/60";
  }
  if (c.includes("rain") || c.includes("drizzle") || c.includes("shower")) {
    return "from-slate-950 via-blue-950/70 to-slate-950";
  }
  if (c.includes("snow") || c.includes("ice") || c.includes("freeze") || c.includes("sleet")) {
    return "from-slate-950 via-sky-950/60 to-slate-900";
  }
  if (c.includes("fog") || c.includes("mist") || c.includes("haze")) {
    return "from-zinc-950 via-zinc-900 to-slate-950";
  }
  if (c.includes("cloud") || c.includes("overcast")) {
    return "from-slate-950 via-slate-900 to-zinc-950";
  }
  if (c.includes("clear") || c.includes("sun")) {
    return "from-indigo-950 via-slate-950 to-amber-950/30";
  }
  return "from-slate-950 via-indigo-950 to-slate-950";
}

export default function App() {
  const [dashboard, setDashboard] = useState<WeatherDashboard>(DEFAULT_DASHBOARD);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      setStatus("loading");

      try {
        const dashboard = await fetchWeatherDashboard();

        if (mounted) {
          setDashboard(dashboard);
          setStatus("ready");
        }
      } catch {
        if (mounted) {
          setDashboard(DEFAULT_DASHBOARD);
          setStatus("error");
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className={`relative min-h-screen overflow-hidden bg-gradient-to-br ${getBackgroundGradient(dashboard.current.condition)} px-4 py-10 text-slate-100 sm:px-8 transition-colors duration-1000 ease-in-out`}>
      {/* Background radial glow effect */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[120px] transition-colors duration-1000" />
      
      <div className="mx-auto w-full max-w-2xl">
        <CurrentWeatherPanel weather={dashboard.current} status={status} />
        <section className="mt-3 grid grid-cols-[1.15fr_0.85fr] gap-2.5">
          <AiBriefingPanel weatherData={dashboard} isReal={status}/>
          <DailySummariesPanel summaries={dashboard.dailySummaries} />
        </section>
        <HourlyForecastPanel forecast={dashboard.hourlyForecast} />
      </div>
    </main>
  );
}


import { Droplets, MapPin } from "lucide-react";
import type { CurrentWeather } from "../lib/weather";

type CurrentWeatherPanelProps = {
  weather: CurrentWeather;
  status: "loading" | "ready" | "error";
};

export function CurrentWeatherPanel({ weather, status }: CurrentWeatherPanelProps) {
  const conditionLabel =
    status === "loading" ? "Updating" : status === "error" ? "Using saved reading" : weather.condition;

  const uvRotation = Math.min(12, Math.max(0, weather.uvIndex)) * 30;

  return (
    <section className="w-full bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl shadow-black/20 hover:border-white/20 transition-all duration-300" aria-label="Current weather">
      <div className="mb-5 flex items-center gap-2 text-slate-200">
        <MapPin aria-hidden className="size-4 text-rose-400 animate-pulse stroke-[2]" />
        <h1 className="text-lg font-semibold tracking-tight leading-none text-white">{weather.location}</h1>
      </div>

      <div className="grid grid-cols-[1fr_82px] items-center gap-5">
        <div>
          <div className="flex items-center gap-3">
            <img 
              src={weather.icon} 
              className="size-16 object-contain filter drop-shadow-[0_0_12px_rgba(255,255,255,0.15)]" 
              alt={weather.condition} 
            />
            <div className="flex items-start leading-none text-white">
              <span className="text-5xl font-semibold tracking-tighter">
                {Math.round(weather.temperatureC)}
              </span>
              <span className="text-3xl font-light text-slate-300 mt-1 ml-0.5">°</span>
              <span className="text-xl font-medium text-slate-400 mt-2.5 ml-0.5">C</span>
            </div>
          </div>

          <div className="mt-3.5 flex items-center gap-2">
            <p className="text-xs text-slate-300 font-medium">Feels like {Math.round(weather.feelsLikeC)}°</p>
            <span className="h-1.5 w-1.5 rounded-full bg-white/20" aria-hidden />
            <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{conditionLabel}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3.5">
          <div className="relative grid size-20 place-items-center rounded-full bg-white/[0.03] border border-white/10 shadow-lg">
            <div className="absolute inset-1.5 rounded-full border border-dashed border-white/20" />
            <div 
              className="absolute inset-0 transition-transform duration-1000 ease-out" 
              style={{ transform: `rotate(${uvRotation}deg)` }}
            >
              <div className="absolute top-[2px] left-1/2 size-2.5 -translate-x-1/2 rounded-full border border-slate-950 bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
            </div>
            <div className="relative text-center">
              <div className="text-lg font-bold text-white leading-none">{Math.round(weather.uvIndex)}</div>
              <div className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-slate-400">uv</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium bg-white/5 px-2.5 py-1 rounded-full border border-white/5 shadow-sm">
            <Droplets aria-hidden className="size-3.5 stroke-[2] text-blue-400" />
            <span>Humidity {Math.round(weather.humidity)}%</span>
          </div>
        </div>
      </div>
    </section>
  );
}

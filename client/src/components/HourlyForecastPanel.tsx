import { Clock, Droplets } from "lucide-react";
import type { HourlyForecast } from "../lib/weather";

type HourlyForecastPanelProps = {
  forecast: HourlyForecast[];
};

export function HourlyForecastPanel({ forecast }: HourlyForecastPanelProps) {
  const now = new Date();
  const currentTimestamp = now.getTime() - 30 * 60 * 1000; // Include current hour (up to 30m ago)

  // Find the index of the first hour that is equal to or after the current hour
  let startIndex = forecast.findIndex((hour) => {
    const hourDate = new Date(hour.rawTime);
    return !isNaN(hourDate.getTime()) && hourDate.getTime() >= currentTimestamp;
  });

  // Fallback if no upcoming hour is found
  if (startIndex === -1) {
    startIndex = 0;
  }

  // Display exactly 24 hours starting from the current hour
  const displayForecast = forecast.slice(startIndex, startIndex + 24);

  return (
    <section className="mt-3 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl hover:border-white/20 transition-all duration-300" aria-label="Hourly forecast">
      <h2 className="mb-3 text-[10px] font-bold text-violet-300 uppercase tracking-wider flex items-center gap-1">
        <Clock className="size-3 text-violet-400" />
        Hourly forecast
      </h2>
      <div className="flex items-center gap-3 overflow-x-auto pb-1.5 scrollbar-thin">
        {displayForecast.map((hour, index) => (
          <div 
            className="flex flex-col items-center justify-between min-w-[56px] py-2 px-1 hover:bg-white/5 rounded-xl transition-all duration-200 cursor-default" 
            key={`${hour.time}-${index}`}
          >
            {/* Time */}
            <span className="text-[10px] font-semibold text-slate-400">{hour.time}</span>
            
            {/* Icon */}
            <img 
              src={hour.icon} 
              className="size-8 object-contain my-1.5 filter drop-shadow-[0_0_6px_rgba(255,255,255,0.12)]" 
              alt={hour.condition} 
            />
            
            {/* Temperature */}
            <span className="text-sm font-bold text-white leading-none">{Math.round(hour.temperatureC)}°</span>
            
            {/* Precipitation Chance */}
            <span className="mt-2 flex items-center gap-0.5 text-[9px] text-blue-400 font-medium">
              <Droplets aria-hidden className="size-3 stroke-[2] text-blue-400" />
              {Math.round(hour.precipitationChance)}%
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

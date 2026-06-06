export type CurrentWeather = {
  location: string;
  temperatureC: number;
  feelsLikeC: number;
  humidity: number;
  uvIndex: number;
  condition: string;
  icon: string;
};

export type DailySummary = {
  day: string;
  precipitationChance: number;
  condition: string;
  highC: number;
  lowC: number;
  icon: string;
};

export type HourlyForecast = {
  time: string;
  rawTime: string;
  temperatureC: number;
  precipitationChance: number;
  condition: string;
  icon: string;
};

export type WeatherDashboard = {
  current: CurrentWeather;
  aiBriefing: string;
  dailySummaries: DailySummary[];
  hourlyForecast: HourlyForecast[];
};

type WeatherRecord = Record<string, unknown>;

export const DEFAULT_DASHBOARD: WeatherDashboard = {
  current: {
    location: "Unknown",
    temperatureC: 18,
    feelsLikeC: 19,
    humidity: 40,
    uvIndex: 11,
    condition: "Rain",
    icon: "https://cdn.weather-ai.co/icons/default/51_drizzle_light_day.svg"
  },
  aiBriefing:
    "Conditions will remain mild throughout the day, with rain possible during the afternoon. Plan outdoor activities for earlier hours where possible.",
  dailySummaries: ["Today", "Sat", "Sun", "Mon", "Tue"].map((day) => ({
    day,
    precipitationChance: 15,
    condition: "Rain",
    highC: 20,
    lowC: 10,
    icon: "https://cdn.weather-ai.co/icons/default/51_drizzle_light_day.svg"
  })),
  hourlyForecast: Array.from({ length: 24 }, (_, index) => {
    const hour = index.toString().padStart(2, "0");
    const today = new Date().toISOString().substring(0, 10);
    return {
      time: `${hour}:00`,
      rawTime: `${today}T${hour}:00`,
      temperatureC: 12,
      precipitationChance: 70,
      condition: "Rain",
      icon: "https://cdn.weather-ai.co/icons/default/51_drizzle_light_day.svg"
    };
  })
};

export function extractConditionFromIcon(iconUrl: string | undefined): string | undefined {
  if (!iconUrl) return undefined;
  const filename = iconUrl.split("/").pop();
  if (!filename) return undefined;
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  const nameWithoutSuffix = nameWithoutExt.replace(/_(day|night)$/, "");
  const parts = nameWithoutSuffix.split("_");
  if (parts.length > 1 && !isNaN(Number(parts[0]))) {
    parts.shift();
  }
  return parts
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function normalizeWeatherPayload(
  payload: unknown,
  fallback: WeatherDashboard,
  locationName: string
): WeatherDashboard {
  const root = asRecord(payload);
  const forecast = firstRecord(root, ["forecast", "forecasts"]);
  const current = firstRecord(root, ["current", "current_weather", "weather", "now"]) ?? root;
  const location = firstRecord(root, ["location", "place"]);
  const dailySource = firstArray(root, ["daily", "dailyForecast", "daily_forecast", "days"]) ??
    firstArray(forecast, ["daily", "days"]);
  const hourlySource = firstArray(root, ["hourly", "hourlyForecast", "hourly_forecast", "hours"]) ??
    firstArray(forecast, ["hourly", "hours"]);

  const currentIcon = firstString(current, ["icon"]) ?? fallback.current.icon;

  return {
    current: {
      location:
        locationName ||
        firstString(location, ["name", "city", "county"]) ||
        firstString(root, ["locationName", "city", "name"]) ||
        fallback.current.location,
      temperatureC:
        firstNumber(current, ["temperatureC", "temperature_c", "temperature", "temp_c", "temp"]) ??
        fallback.current.temperatureC,
      feelsLikeC:
        firstNumber(current, ["feelsLikeC", "feels_like_c", "feelslike_c", "apparent_temperature"]) ??
        fallback.current.feelsLikeC,
      humidity:
        firstNumber(current, ["humidity", "relative_humidity", "relativeHumidity"]) ??
        fallback.current.humidity,
      uvIndex:
        firstNumber(current, ["uvIndex", "uv_index", "uv", "uvi"]) ?? fallback.current.uvIndex,
      icon: currentIcon,
      condition:
        firstString(current, ["condition", "summary", "description", "weather"]) ??
        extractConditionFromIcon(currentIcon) ??
        fallback.current.condition
    },
    aiBriefing:
      firstString(root, ["aiBriefing", "ai_briefing", "briefing", "summary", "insight"]) ??
      firstString(firstRecord(root, ["ai", "assistant"]), ["briefing", "summary", "text"]) ??
      fallback.aiBriefing,
    dailySummaries: normalizeDailySummaries(dailySource, fallback.dailySummaries),
    hourlyForecast: normalizeHourlyForecast(hourlySource, fallback.hourlyForecast)
  };
}

function formatDayName(dateStr: string | undefined, index: number): string {
  if (!dateStr) return index === 0 ? "Today" : `Day ${index + 1}`;
  
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    
    const today = new Date();
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return "Today";
    }
    
    return new Intl.DateTimeFormat("en", { weekday: "short" }).format(date);
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const today = new Date();
  if (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  ) {
    return "Today";
  }
  
  return new Intl.DateTimeFormat("en", { weekday: "short" }).format(date);
}

function normalizeDailySummaries(source: unknown[] | undefined, fallback: DailySummary[]) {
  if (!source?.length) return fallback;

  return source.slice(0, 5).map((item, index) => {
    const record = asRecord(item);
    const temperature = firstRecord(record, ["temperature", "temp"]);
    const icon = firstString(record, ["icon"]) ?? fallback[index]?.icon ?? fallback[0]?.icon ?? "";
    const dateStr = firstString(record, ["day", "weekday", "label", "date"]);

    return {
      day: formatDayName(dateStr, index),
      precipitationChance:
        firstNumber(record, ["precipitationChance", "precip_chance", "rainChance", "pop", "precipitation_probability"]) ??
        fallback[index]?.precipitationChance ??
        0,
      icon,
      condition:
        firstString(record, ["condition", "summary", "description", "weather"]) ??
        extractConditionFromIcon(icon) ??
        fallback[index]?.condition ??
        "Clouds",
      highC:
        firstNumber(record, ["highC", "maxC", "max_temp", "temp_max", "temperatureMax"]) ??
        firstNumber(temperature, ["max", "high"]) ??
        fallback[index]?.highC ??
        0,
      lowC:
        firstNumber(record, ["lowC", "minC", "min_temp", "temp_min", "temperatureMin"]) ??
        firstNumber(temperature, ["min", "low"]) ??
        fallback[index]?.lowC ??
        0
    };
  });
}

function normalizeHourlyForecast(source: unknown[] | undefined, fallback: HourlyForecast[]) {
  if (!source?.length) return fallback;

  return source.map((item, index) => {
    const record = asRecord(item);
    const rawTime = firstString(record, ["time", "hour", "label", "dateTime"]) ?? fallback[index]?.rawTime ?? "";
    const icon = firstString(record, ["icon"]) ?? fallback[index]?.icon ?? fallback[0]?.icon ?? "";

    return {
      time: formatHour(rawTime),
      rawTime,
      temperatureC:
        firstNumber(record, ["temperatureC", "temperature_c", "temperature", "temp_c", "temp"]) ??
        fallback[index]?.temperatureC ??
        0,
      precipitationChance:
        firstNumber(record, ["precipitationChance", "precip_chance", "rainChance", "pop", "precipitation_probability"]) ??
        fallback[index]?.precipitationChance ??
        0,
      icon,
      condition:
        firstString(record, ["condition", "summary", "description", "weather"]) ??
        extractConditionFromIcon(icon) ??
        fallback[index]?.condition ??
        "Clouds"
    };
  });
}

function asRecord(value: unknown): WeatherRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as WeatherRecord)
    : {};
}

function firstRecord(source: WeatherRecord | undefined, keys: string[]) {
  if (!source) return undefined;

  for (const key of keys) {
    const value = source[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as WeatherRecord;
    }
  }

  return undefined;
}

function firstArray(source: WeatherRecord | undefined, keys: string[]) {
  if (!source) return undefined;

  for (const key of keys) {
    const value = source[key];
    if (Array.isArray(value)) return value;
  }

  return undefined;
}

function firstNumber(source: WeatherRecord | undefined, keys: string[]) {
  if (!source) return undefined;

  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return undefined;
}

function firstString(source: WeatherRecord | undefined, keys: string[]) {
  if (!source) return undefined;

  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim() !== "") return value;
  }

  return undefined;
}

function formatHour(value: string | undefined) {
  if (!value) return "13:00";
  const date = new Date(value);

  if (!Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat("en", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(date);
  }

  return value;
}

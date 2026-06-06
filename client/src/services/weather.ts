import {
  DEFAULT_DASHBOARD,
  normalizeWeatherPayload,
  type WeatherDashboard
} from "../lib/weather";

type Coordinates = {
  lat: string;
  lon: string;
};

type ResolvedLocation = {
  location: string;
  coordinates: Coordinates;
};

export async function fetchWeatherDashboard(): Promise<WeatherDashboard> {
  try {
    const resolvedLocation = await resolveLocation();
    const params = new URLSearchParams(resolvedLocation.coordinates);
    const response = await fetch(`/api/weather?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Weather request failed: ${response.status}`);
    }

    const payload: unknown = await response.json();
    const normalized = normalizeWeatherPayload(
      payload,
      DEFAULT_DASHBOARD,
      shortLocationName(resolvedLocation.location)
    );

    return normalized;
  } catch (error) {
    console.error("Weather dashboard fetch error:", error);
    throw error;
  }
}

async function resolveLocation(): Promise<ResolvedLocation> {
  const browserLocation = await getBrowserLocation();

  if (browserLocation) {
    return {
      location: await reverseGeocodeLocation(browserLocation),
      coordinates: browserLocation
    };
  }

  const response = await fetch("/api/location");

  if (!response.ok) {
    throw new Error(`Location request failed: ${response.status}`);
  }

  return (await response.json()) as ResolvedLocation;
}

function getBrowserLocation(): Promise<Coordinates | null> {
  if (!("geolocation" in navigator)) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: String(position.coords.latitude),
          lon: String(position.coords.longitude)
        });
      },
      () => resolve(null),
      {
        enableHighAccuracy: false,
        maximumAge: 1000 * 60 * 15,
        timeout: 7000
      }
    );
  });
}

async function reverseGeocodeLocation(coordinates: Coordinates): Promise<string> {
  try {
    const params = new URLSearchParams(coordinates);
    const response = await fetch(`/api/reverse-geocode?${params.toString()}`);

    if (!response.ok) {
      throw new Error("Reverse geocoding unavailable");
    }

    const payload = (await response.json()) as { location?: string };
    return payload.location ?? "Current location";
  } catch {
    return "Current location";
  }
}

function shortLocationName(location: string): string {
  return location.split(",")[0]?.trim() || location;
}

export async function fetchAiBriefing(
  weatherData: WeatherDashboard,
  onChunk?: (chunk: string) => void
): Promise<string> {
  if (!weatherData || Object.keys(weatherData).length === 0) {
    throw new Error("Weather data is required to generate briefing");
  }

  try {
    const response = await fetch("/api/weather/ai-briefing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(weatherData),
    });

    if (!response.ok) {
      const errorData = await response.text().catch(() => "");
      throw new Error(errorData || `HTTP ${response.status}: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Response body is not readable");
    }

    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      onChunk?.(chunk);
    }

    // Final flush of the decoder
    const finalChunk = decoder.decode();
    if (finalChunk) {
      fullText += finalChunk;
      onChunk?.(finalChunk);
    }

    if (!fullText.trim()) {
      throw new Error("Received empty briefing from server");
    }

    return fullText;
  } catch (error) {
    console.error("AI Briefing service error:", error);
    throw error;
  }
}

export type WeatherInsight = {
  risk: "low" | "medium" | "high";
  title: string;
  recommendation: string;
};

export type WeatherInsights = {
  travel: WeatherInsight;
  fitness: WeatherInsight;
  health: WeatherInsight;
  eventPlanning: WeatherInsight;
};

export async function fetchInsights(weatherData: WeatherDashboard): Promise<WeatherInsights> {
  if (!weatherData || Object.keys(weatherData).length === 0) {
    throw new Error("Weather data is required to generate insights");
  }

  try {
    const response = await fetch("/api/weather/ai-insights", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(weatherData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        (errorData as { error?: string }).error || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const insights: WeatherInsights = await response.json();
    return insights;
  } catch (error) {
    console.error("AI Insights service error:", error);
    throw error;
  }
}
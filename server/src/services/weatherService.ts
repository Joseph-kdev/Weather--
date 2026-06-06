import { env } from "../utils/env.js";
import { HttpError } from "../utils/httpError.js";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

type WeatherQuery = {
  lat: string;
  lon: string;
};

export async function generateAiBriefing(weatherData: any): Promise<string> {
  if (!env.geminiApiKey) {
    return "AI Briefing is unavailable. Configure GEMINI_API_KEY in the server .env to enable dynamic summaries.";
  }

  try {
    const model = new ChatGoogleGenerativeAI({
      apiKey: env.geminiApiKey,
      model: "gemini-2.5-flash",
      maxOutputTokens: 100,
      temperature: 0.7,
    });

    const current = weatherData.current || {};
    const hourly = weatherData.hourly || [];
    const daily = weatherData.daily || [];

    const hourlyHighlights = hourly.slice(0, 8).map((h: any) => {
      const time = h.time ? h.time.substring(11, 16) : "";
      return `- ${time}: ${Math.round(h.temperature)}°C, precip prob: ${h.precipitation_probability}%`;
    }).join("\n");

    const dailyOutlook = daily.slice(0, 3).map((d: any) => {
      return `- ${d.date}: High ${Math.round(d.temp_max)}°C, Low ${Math.round(d.temp_min)}°C, precip prob: ${d.precipitation_probability}%`;
    }).join("\n");

    const prompt = `You are a helpful weather assistant. Summarize the following weather forecast into a single short paragraph:${current} and ${hourly} (max 20-30 words, similar to: "Conditions will remain mild throughout the day, with rain possible during the afternoon. Plan outdoor activities for earlier hours where possible.").
Do not include any greeting or conversational filler. Keep it extremely concise, clear, and informative.
`;

    const response = await (model as any).invoke(prompt);
    return typeof response.content === "string" ? response.content.trim() : "";
  } catch (error) {
    console.error("Failed to generate AI briefing:", error);
    return "Failed to generate dynamic AI briefing. Using default weather reading.";
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

export async function generateInsights(weatherData: any): Promise<WeatherInsights> {
  if (!env.geminiApiKey) {
    throw new Error("Gemini API key is not configured");
  }

  try {
    const model = new ChatGoogleGenerativeAI({
      apiKey: env.geminiApiKey,
      model: "gemini-2.5-flash",
      maxOutputTokens: 1000,
      temperature: 0.7,
    });

    const current = weatherData.current || {};
    const hourly = weatherData.hourly || [];
    const daily = weatherData.daily || [];

    const currentTemp = Math.round(current.temperature || 0);
    const feelsLike = Math.round(current.feels_like || 0);
    const humidity = current.humidity || 0;
    const uvIndex = current.uv_index || 0;
    const precipitation = current.precipitation_probability || 0;
    const condition = current.condition || "Unknown";

    const hourlyData = hourly.slice(0, 12).map((h: any) => {
      const time = h.time ? h.time.substring(11, 16) : "Unknown";
      return `${time}: ${Math.round(h.temperature)}°C, precip: ${h.precipitation_probability}%`;
    }).join(", ");

    const dailyData = daily.slice(0, 5).map((d: any) => {
      return `${d.date}: High ${Math.round(d.temp_max)}°C, Low ${Math.round(d.temp_min)}°C, precip: ${d.precipitation_probability}%`;
    }).join(", ");

    const prompt = `You are a weather insights expert. Based on the following weather data, provide practical, actionable recommendations for 4 categories. Return ONLY a valid JSON object with no additional text.

Current Weather:
- Temperature: ${currentTemp}°C (feels like ${feelsLike}°C)
- Condition: ${condition}
- Humidity: ${humidity}%
- UV Index: ${uvIndex}
- Precipitation Probability: ${precipitation}%

Next 12 Hours: ${hourlyData}

Next 5 Days: ${dailyData}

Return a JSON object with this exact structure (risk must be "low", "medium", or "high"):
{
  "travel": {
    "risk": "low|medium|high",
    "title": "Travel Conditions",
    "recommendation": "practical recommendation for travel"
  },
  "fitness": {
    "risk": "low|medium|high",
    "title": "Exercise Window",
    "recommendation": "practical recommendation for outdoor exercise"
  },
  "health": {
    "risk": "low|medium|high",
    "title": "Health Considerations",
    "recommendation": "practical recommendation for health and safety"
  },
  "eventPlanning": {
    "risk": "low|medium|high",
    "title": "Outdoor Events",
    "recommendation": "practical recommendation for outdoor event planning"
  }
}

Only return the JSON object, no markdown, no extra text.`;

    const response = await (model as any).invoke(prompt);
    const responseText = typeof response.content === "string" ? response.content.trim() : "";

    // Parse the JSON response
    const insights = JSON.parse(responseText) as WeatherInsights;

    // Validate the structure
    if (!insights.travel || !insights.fitness || !insights.health || !insights.eventPlanning) {
      throw new Error("Invalid insights structure from LLM");
    }

    return insights;
  } catch (error) {
    console.error("Failed to generate insights:", error);
    throw new Error("Failed to generate weather insights");
  }
}

export async function getWeather({ lat, lon }: WeatherQuery) {
  if (!env.weatherAiApiKey) {
    throw new HttpError(500, "Missing WEATHER_AI_API_KEY");
  }

  const url = new URL("https://api.weather-ai.co/v1/weather");
  url.searchParams.set("lat", lat);
  url.searchParams.set("lon", lon);

  try {
    const weatherResponse = await fetch(url, {
      headers: { Authorization: `Bearer ${env.weatherAiApiKey}` }
    });
    const payload: any = await weatherResponse.json();

    if (!weatherResponse.ok) {
      throw new HttpError(weatherResponse.status, "Weather provider request failed", payload);
    }

    // Call Gemini to generate the dynamic briefing and add it to the payload
    const briefing = await generateAiBriefing(payload);
    payload.ai_briefing = briefing;
    return payload;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(
      502,
      "Unable to reach weather provider",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 5174),
  weatherAiApiKey: process.env.WEATHER_AI_API_KEY ?? "",
  defaultLat: process.env.DEFAULT_LAT ?? "-1.2921",
  defaultLon: process.env.DEFAULT_LON ?? "36.8219",
  defaultLocationName: process.env.DEFAULT_LOCATION_NAME ?? "Kiambu",
  geminiApiKey: process.env.GEMINI_API_KEY ?? ""
};

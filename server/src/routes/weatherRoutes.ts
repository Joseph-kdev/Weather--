import { Router } from "express";
import { generateAiBriefing, generateInsights, getWeather } from "../services/weatherService.js";

export const weatherRouter = Router();

weatherRouter.get("/", async (req, res, next) => {
  try {
    const lat = typeof req.query.lat === "string" ? req.query.lat : "-1.2921";
    const lon = typeof req.query.lon === "string" ? req.query.lon : "36.8219";
    const weather = await getWeather({ lat, lon });

    res.json(weather);
  } catch (error) {
    next(error);
  }
});

weatherRouter.post("/ai-briefing", async (req, res) => {
  const weatherData = req.body;

  if (!weatherData || Object.keys(weatherData).length === 0) {
    return res.status(400).json({ error: "Weather data is required in the request body" });
  }

  try {
    const briefing = await generateAiBriefing(weatherData);

    res.setHeader("Content-Type", "text/plain");
    return res.status(200).send(briefing);
  } catch (error) {
    console.error("Error in /ai-briefing route:", error);
    return res.status(500).json({ error: "Failed to generate AI briefing" });
  }
});

weatherRouter.post("/ai-insights", async (req, res) => {
  const weatherData = req.body;

  if (!weatherData || Object.keys(weatherData).length === 0) {
    return res.status(400).json({ error: "Weather data is required in the request body" });
  }

  try {
    const insights = await generateInsights(weatherData);
    return res.status(200).json(insights);
  } catch (error) {
    console.error("Error in /ai-insights route:", error);
    return res.status(500).json({ error: "Failed to generate insights" });
  }
});
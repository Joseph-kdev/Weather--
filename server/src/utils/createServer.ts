import cors from "cors";
import express from "express";
import { errorMiddleware } from "../middleware/errorMiddleware.js";
import { requestLogger } from "../middleware/requestLogger.js";
import { healthRouter } from "../routes/healthRoutes.js";
import { ipLocationRouter } from "../routes/ipLocationRoutes.js";
import { weatherRouter } from "../routes/weatherRoutes.js";
import { locationRouter } from "../routes/geoCodeRoutes.js";

export function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  app.use("/api/health", healthRouter);
  app.use("/api/location", ipLocationRouter);
  app.use("/api/weather", weatherRouter);
  app.use("/api/reverse-geocode", locationRouter);

  app.use(errorMiddleware);

  return app;
}

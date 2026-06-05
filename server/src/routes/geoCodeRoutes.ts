import type { Request, Response } from "express";
import { Router } from "express";
import { reverseGeocode, type ReverseGeocodeOptions } from "../services/reverseGeocode.js";

interface ReverseGeocodeQuery {
  lat?: string;
  lon?: string;
  zoom?: string;
  language?: string;
}

export const locationRouter = Router();

locationRouter.get("/", async (req: Request<{}, {}, {}, ReverseGeocodeQuery>, res: Response, next) => {
  try {
    const { lat, lon, zoom, language } = req.query;

    if (!lat || !lon) {
      res.status(400).json({
        error: "Missing required parameters: lat and lon"
      });
      return;
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      res.status(400).json({
        error: "Invalid coordinates - must be numbers"
      });
      return;
    }

    const options: ReverseGeocodeOptions = {};

    if (zoom) {
      const zoomLevel = parseInt(zoom);
      if (!Number.isNaN(zoomLevel)) {
        options.zoom = Math.min(18, Math.max(0, zoomLevel));
      }
    }

    if (language) {
      options.language = language;
    }

    const result = await reverseGeocode(latitude, longitude, options);

    if (!result.success) {
      res.status(result.status || 500).json({ error: result.error });
      return;
    }

    res.json({
      location: result.displayName,
      addressDetails: result.address,
      coordinates: result.coordinates
    });
  } catch (error) {
    next(error);
  }
});

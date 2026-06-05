import { Router } from "express";
import { resolveLocationFromRequest } from "../services/ipLocationService.js";

export const ipLocationRouter = Router();

ipLocationRouter.get("/", async (req, res, next) => {
  try {
    res.json(await resolveLocationFromRequest(req));
  } catch (error) {
    next(error);
  }
});

import type { ErrorRequestHandler } from "express";
import { HttpError } from "../utils/httpError.js";

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      error: error.message,
      details: error.details
    });
    return;
  }

  res.status(500).json({
    error: "Unexpected server error"
  });
};

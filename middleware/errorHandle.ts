import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";

// Standard application error with an explicit HTTP status code.
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

// Express middleware for unmatched routes; forwards a 404 AppError.
export const notFound = (
  _req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next(new AppError("Route not found", 404));
};

// Centralized error middleware: logs details and returns a safe JSON response.
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Preserve explicit status codes for known app errors.
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || "Unexpected server error";

  logger.error(message, { stack: err.stack });

  res.status(statusCode).json({
    message,
    // Include stack traces only during development for easier debugging.
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

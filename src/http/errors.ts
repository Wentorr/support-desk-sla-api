import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code = "api_error"
  ) {
    super(message);
  }
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new ApiError(404, `No route found for ${req.method} ${req.path}`, "route_not_found"));
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: "validation_error",
        message: "Request validation failed",
        details: err.flatten()
      }
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message
      }
    });
  }

  return res.status(500).json({
    error: {
      code: "internal_error",
      message: "Something went wrong"
    }
  });
}


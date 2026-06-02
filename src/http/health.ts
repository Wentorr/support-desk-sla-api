import { Router } from "express";
import { env } from "../config/env.js";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "support-desk-sla-api",
    environment: env.NODE_ENV,
    uptimeSeconds: Math.floor(process.uptime())
  });
});


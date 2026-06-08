import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { errorHandler } from "../src/http/errors.js";
import { getValidatedRequest, validateRequest } from "../src/http/validation.js";

describe("request validation middleware", () => {
  it("attaches parsed request data for handlers", async () => {
    const app = express();
    const bodySchema = z.object({
      name: z.string().trim().min(1)
    });

    app.use(express.json());
    app.post("/echo", validateRequest({ body: bodySchema }), (req, res) => {
      const validated = getValidatedRequest<{ body: typeof bodySchema }>(req);
      res.json({ name: validated.validated.body.name });
    });
    app.use(errorHandler);

    const res = await request(app).post("/echo").send({ name: " Queue Desk " });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ name: "Queue Desk" });
  });

  it("returns structured validation errors", async () => {
    const app = express();
    const bodySchema = z.object({
      name: z.string().min(1)
    });

    app.use(express.json());
    app.post("/echo", validateRequest({ body: bodySchema }), (_req, res) => {
      res.json({ ok: true });
    });
    app.use(errorHandler);

    const res = await request(app).post("/echo").send({ name: "" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("validation_error");
  });
});


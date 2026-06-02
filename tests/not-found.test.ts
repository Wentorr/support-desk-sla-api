import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

describe("unknown routes", () => {
  it("return a structured 404 response", async () => {
    const res = await request(createApp()).get("/missing");

    expect(res.status).toBe(404);
    expect(res.body.error).toEqual({
      code: "route_not_found",
      message: "No route found for GET /missing"
    });
  });
});


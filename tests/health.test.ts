import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

describe("health endpoint", () => {
  it("reports that the API process is alive", async () => {
    const res = await request(createApp()).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.service).toBe("support-desk-sla-api");
    expect(res.body.uptimeSeconds).toEqual(expect.any(Number));
  });
});


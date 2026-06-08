import { describe, expect, it } from "vitest";
import {
  inviteUserBodySchema,
  loginBodySchema,
  refreshBodySchema,
  registerBodySchema
} from "../src/auth/schemas.js";

describe("auth request schemas", () => {
  it("normalizes registration identity fields", () => {
    const body = registerBodySchema.parse({
      organizationName: " Northstar Support ",
      organizationSlug: "northstar-support",
      email: " OWNER@EXAMPLE.COM ",
      displayName: " Ana Owner ",
      password: "DeskQueue#42"
    });

    expect(body).toMatchObject({
      organizationName: "Northstar Support",
      organizationSlug: "northstar-support",
      email: "owner@example.com",
      displayName: "Ana Owner"
    });
  });

  it("rejects organization slugs with repeated dashes", () => {
    expect(() =>
      registerBodySchema.parse({
        organizationName: "Northstar Support",
        organizationSlug: "northstar--support",
        email: "owner@example.com",
        displayName: "Ana Owner",
        password: "DeskQueue#42"
      })
    ).toThrow();
  });

  it("normalizes login email without accepting blank passwords", () => {
    expect(
      loginBodySchema.parse({
        organizationSlug: "northstar",
        email: " Agent@Example.com ",
        password: "DeskQueue#42"
      }).email
    ).toBe("agent@example.com");

    expect(() =>
      loginBodySchema.parse({
        organizationSlug: "northstar",
        email: "agent@example.com",
        password: ""
      })
    ).toThrow();
  });

  it("requires refresh tokens to look like opaque token material", () => {
    expect(() => refreshBodySchema.parse({ refreshToken: "tiny" })).toThrow();
  });

  it("defaults invited users to agent role", () => {
    const body = inviteUserBodySchema.parse({
      email: "teammate@example.com",
      displayName: "Team Mate"
    });

    expect(body.role).toBe("AGENT");
  });
});


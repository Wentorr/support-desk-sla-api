import { describe, expect, it } from "vitest";
import {
  hashTokenForStorage,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
} from "../src/auth/tokens.js";

describe("auth tokens", () => {
  it("round-trips access token identity and tenant claims", () => {
    const token = signAccessToken({
      sub: "user_123",
      org: "org_123",
      role: "AGENT"
    });

    expect(verifyAccessToken(token)).toMatchObject({
      sub: "user_123",
      org: "org_123",
      role: "AGENT",
      typ: "access"
    });
  });

  it("round-trips refresh token session claims", () => {
    const token = signRefreshToken({
      sub: "user_123",
      sid: "session_123",
      family: "family_123"
    });

    expect(verifyRefreshToken(token)).toMatchObject({
      sub: "user_123",
      sid: "session_123",
      family: "family_123",
      typ: "refresh"
    });
  });

  it("keeps stored token material separate from the raw token", () => {
    const token = signRefreshToken({
      sub: "user_123",
      sid: "session_123",
      family: "family_123"
    });

    expect(hashTokenForStorage(token)).not.toBe(token);
  });
});


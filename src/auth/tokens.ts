import jwt from "jsonwebtoken";
import { createHash } from "node:crypto";
import { z } from "zod";
import { env } from "../config/env.js";

const accessTokenPayloadSchema = z.object({
  sub: z.string().min(1),
  org: z.string().min(1),
  role: z.string().min(1),
  typ: z.literal("access")
});

const refreshTokenPayloadSchema = z.object({
  sub: z.string().min(1),
  sid: z.string().min(1),
  family: z.string().min(1),
  typ: z.literal("refresh")
});

export type AccessTokenPayload = z.infer<typeof accessTokenPayloadSchema>;
export type RefreshTokenPayload = z.infer<typeof refreshTokenPayloadSchema>;

export function signAccessToken(payload: Omit<AccessTokenPayload, "typ">) {
  return jwt.sign(
    {
      ...payload,
      typ: "access"
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );
}

export function signRefreshToken(payload: Omit<RefreshTokenPayload, "typ">) {
  return jwt.sign(
    {
      ...payload,
      typ: "refresh"
    },
    env.JWT_REFRESH_SECRET,
    { expiresIn: "30d" }
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
  return accessTokenPayloadSchema.parse(decoded);
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
  return refreshTokenPayloadSchema.parse(decoded);
}

export function hashTokenForStorage(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

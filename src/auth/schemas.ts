import { z } from "zod";
import { userRoles } from "../domain/auth.js";

const trimmedString = z.string().trim();

export const registerBodySchema = z.object({
  organizationName: trimmedString.min(2).max(80),
  organizationSlug: trimmedString
    .min(3)
    .max(48)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single dashes"),
  email: trimmedString.email().max(160).transform((value) => value.toLowerCase()),
  displayName: trimmedString.min(2).max(80),
  password: z.string().min(1)
});

export const loginBodySchema = z.object({
  organizationSlug: trimmedString.min(3).max(48),
  email: trimmedString.email().max(160).transform((value) => value.toLowerCase()),
  password: z.string().min(1)
});

export const refreshBodySchema = z.object({
  refreshToken: z.string().min(20)
});

export const inviteUserBodySchema = z.object({
  email: trimmedString.email().max(160).transform((value) => value.toLowerCase()),
  displayName: trimmedString.min(2).max(80),
  role: z.enum(userRoles).default("AGENT")
});

export type RegisterBody = z.infer<typeof registerBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
export type RefreshBody = z.infer<typeof refreshBodySchema>;
export type InviteUserBody = z.infer<typeof inviteUserBodySchema>;


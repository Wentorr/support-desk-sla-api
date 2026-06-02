import bcrypt from "bcryptjs";
import { z } from "zod";

const MIN_PASSWORD_LENGTH = 10;
const MAX_PASSWORD_LENGTH = 128;

const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
  .max(MAX_PASSWORD_LENGTH, `Password must be at most ${MAX_PASSWORD_LENGTH} characters`)
  .refine((value) => /[a-z]/.test(value), "Password must include a lowercase letter")
  .refine((value) => /[A-Z]/.test(value), "Password must include an uppercase letter")
  .refine((value) => /\d/.test(value), "Password must include a number")
  .refine((value) => /[^A-Za-z0-9]/.test(value), "Password must include a symbol")
  .refine((value) => !/\s/.test(value), "Password must not contain spaces");

export type PasswordValidationResult =
  | { valid: true }
  | { valid: false; issues: string[] };

export function validatePassword(password: string): PasswordValidationResult {
  const result = passwordSchema.safeParse(password);

  if (result.success) {
    return { valid: true };
  }

  return {
    valid: false,
    issues: result.error.issues.map((issue) => issue.message)
  };
}

export function assertValidPassword(password: string) {
  const result = validatePassword(password);

  if (!result.valid) {
    throw new Error(result.issues.join("; "));
  }
}

export async function hashPassword(password: string) {
  assertValidPassword(password);
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}


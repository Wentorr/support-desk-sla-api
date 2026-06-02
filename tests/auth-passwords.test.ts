import { describe, expect, it } from "vitest";
import { hashPassword, validatePassword, verifyPassword } from "../src/auth/passwords.js";

describe("password validation", () => {
  it("accepts passwords that meet the account policy", () => {
    expect(validatePassword("DeskQueue#42")).toEqual({ valid: true });
  });

  it("returns all policy issues for weak passwords", () => {
    const result = validatePassword("short");

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.issues).toContain("Password must be at least 10 characters");
      expect(result.issues).toContain("Password must include an uppercase letter");
      expect(result.issues).toContain("Password must include a number");
      expect(result.issues).toContain("Password must include a symbol");
    }
  });

  it("rejects passwords containing spaces", () => {
    const result = validatePassword("Desk Queue#42");

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.issues).toContain("Password must not contain spaces");
    }
  });
});

describe("password hashing", () => {
  it("hashes and verifies valid passwords", async () => {
    const hash = await hashPassword("DeskQueue#42");

    expect(hash).not.toBe("DeskQueue#42");
    await expect(verifyPassword("DeskQueue#42", hash)).resolves.toBe(true);
    await expect(verifyPassword("DeskQueue#43", hash)).resolves.toBe(false);
  });
});


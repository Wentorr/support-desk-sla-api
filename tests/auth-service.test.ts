import { describe, expect, it } from "vitest";
import { AuthService, type AuthRepository, type AuthUserRecord } from "../src/auth/auth-service.js";
import { hashPassword } from "../src/auth/passwords.js";
import { verifyAccessToken, verifyRefreshToken } from "../src/auth/tokens.js";

function createRepository(overrides: Partial<AuthRepository> = {}) {
  const sessions: Parameters<AuthRepository["createRefreshSession"]>[0][] = [];
  const defaultUser: AuthUserRecord = {
    id: "user_1",
    organizationId: "org_1",
    email: "owner@example.com",
    displayName: "Owner",
    passwordHash: "",
    role: "ADMIN",
    status: "ACTIVE"
  };

  const repository: AuthRepository = {
    organizationSlugExists: async () => false,
    findUserForLogin: async () => defaultUser,
    createOrganizationWithOwner: async (input) => ({
      organization: {
        id: "org_1",
        name: input.organizationName,
        slug: input.organizationSlug,
        timezone: "UTC"
      },
      user: {
        ...defaultUser,
        email: input.ownerEmail,
        displayName: input.ownerDisplayName,
        passwordHash: input.ownerPasswordHash
      }
    }),
    createRefreshSession: async (input) => {
      sessions.push(input);
    },
    ...overrides
  };

  return { repository, sessions, defaultUser };
}

describe("auth service registration", () => {
  it("creates an organization owner and returns session tokens", async () => {
    const { repository, sessions } = createRepository();
    const service = new AuthService(repository);

    const result = await service.registerOrganizationOwner(
      {
        organizationName: "Northstar Support",
        organizationSlug: "northstar",
        email: "owner@example.com",
        displayName: "Ana Owner",
        password: "DeskQueue#42"
      },
      {
        userAgent: "vitest",
        ipAddress: "127.0.0.1"
      }
    );

    expect(result.user).toMatchObject({
      email: "owner@example.com",
      displayName: "Ana Owner",
      role: "ADMIN"
    });
    expect(verifyAccessToken(result.accessToken)).toMatchObject({
      sub: "user_1",
      org: "org_1",
      role: "ADMIN"
    });
    expect(verifyRefreshToken(result.refreshToken).sub).toBe("user_1");
    expect(sessions).toHaveLength(1);
    expect(sessions[0]).toMatchObject({
      userId: "user_1",
      userAgent: "vitest",
      ipAddress: "127.0.0.1"
    });
    expect(sessions[0].tokenHash).not.toBe(result.refreshToken);
  });

  it("rejects duplicate organization slugs", async () => {
    const { repository } = createRepository({
      organizationSlugExists: async () => true
    });
    const service = new AuthService(repository);

    await expect(
      service.registerOrganizationOwner({
        organizationName: "Northstar Support",
        organizationSlug: "northstar",
        email: "owner@example.com",
        displayName: "Ana Owner",
        password: "DeskQueue#42"
      })
    ).rejects.toMatchObject({
      statusCode: 409,
      code: "organization_slug_taken"
    });
  });
});

describe("auth service login", () => {
  it("returns tokens for active users with matching passwords", async () => {
    const passwordHash = await hashPassword("DeskQueue#42");
    const { repository, defaultUser } = createRepository({
      findUserForLogin: async () => ({
        ...defaultUser,
        passwordHash
      })
    });
    const service = new AuthService(repository);

    const result = await service.login({
      organizationSlug: "northstar",
      email: "owner@example.com",
      password: "DeskQueue#42"
    });

    expect(verifyAccessToken(result.accessToken)).toMatchObject({
      sub: "user_1",
      org: "org_1",
      role: "ADMIN"
    });
  });

  it("uses the same response for missing users and wrong passwords", async () => {
    const passwordHash = await hashPassword("DeskQueue#42");
    const missingUserRepo = createRepository({
      findUserForLogin: async () => null
    }).repository;
    const wrongPasswordRepo = createRepository({
      findUserForLogin: async () => ({
        ...createRepository().defaultUser,
        passwordHash
      })
    }).repository;

    await expect(
      new AuthService(missingUserRepo).login({
        organizationSlug: "northstar",
        email: "missing@example.com",
        password: "DeskQueue#42"
      })
    ).rejects.toMatchObject({
      statusCode: 401,
      code: "invalid_credentials"
    });

    await expect(
      new AuthService(wrongPasswordRepo).login({
        organizationSlug: "northstar",
        email: "owner@example.com",
        password: "DeskQueue#43"
      })
    ).rejects.toMatchObject({
      statusCode: 401,
      code: "invalid_credentials"
    });
  });
});

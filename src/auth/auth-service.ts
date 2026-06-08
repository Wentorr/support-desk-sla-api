import { randomUUID } from "node:crypto";
import { ApiError } from "../http/errors.js";
import { isActiveUserStatus } from "../domain/auth.js";
import { hashPassword, validatePassword, verifyPassword } from "./passwords.js";
import {
  hashTokenForStorage,
  signAccessToken,
  signRefreshToken
} from "./tokens.js";
import type { LoginBody, RegisterBody } from "./schemas.js";

export type AuthUserRecord = {
  id: string;
  organizationId: string;
  email: string;
  displayName: string;
  passwordHash: string;
  role: string;
  status: string;
};

export type AuthOrganizationRecord = {
  id: string;
  name: string;
  slug: string;
  timezone: string;
};

export type CreateRefreshSessionInput = {
  id: string;
  userId: string;
  tokenHash: string;
  familyId: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
};

export type AuthRepository = {
  organizationSlugExists(slug: string): Promise<boolean>;
  findUserForLogin(slug: string, email: string): Promise<AuthUserRecord | null>;
  createOrganizationWithOwner(input: {
    organizationName: string;
    organizationSlug: string;
    ownerEmail: string;
    ownerDisplayName: string;
    ownerPasswordHash: string;
  }): Promise<{
    organization: AuthOrganizationRecord;
    user: AuthUserRecord;
  }>;
  createRefreshSession(input: CreateRefreshSessionInput): Promise<void>;
};

export type AuthRequestContext = {
  userAgent?: string;
  ipAddress?: string;
};

export type AuthResult = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    organizationId: string;
    email: string;
    displayName: string;
    role: string;
  };
};

export class AuthService {
  constructor(private readonly repository: AuthRepository) {}

  async registerOrganizationOwner(input: RegisterBody, context: AuthRequestContext = {}) {
    const passwordResult = validatePassword(input.password);
    if (!passwordResult.valid) {
      throw new ApiError(400, passwordResult.issues.join("; "), "weak_password");
    }

    if (await this.repository.organizationSlugExists(input.organizationSlug)) {
      throw new ApiError(409, "Organization slug is already in use", "organization_slug_taken");
    }

    const passwordHash = await hashPassword(input.password);
    const account = await this.repository.createOrganizationWithOwner({
      organizationName: input.organizationName,
      organizationSlug: input.organizationSlug,
      ownerEmail: input.email,
      ownerDisplayName: input.displayName,
      ownerPasswordHash: passwordHash
    });

    return this.issueTokens(account.user, context);
  }

  async login(input: LoginBody, context: AuthRequestContext = {}) {
    const user = await this.repository.findUserForLogin(input.organizationSlug, input.email);

    if (!user || !isActiveUserStatus(user.status)) {
      throw new ApiError(401, "Email or password is incorrect", "invalid_credentials");
    }

    const passwordMatches = await verifyPassword(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new ApiError(401, "Email or password is incorrect", "invalid_credentials");
    }

    return this.issueTokens(user, context);
  }

  private async issueTokens(user: AuthUserRecord, context: AuthRequestContext): Promise<AuthResult> {
    const sessionId = randomUUID();
    const familyId = randomUUID();
    const refreshToken = signRefreshToken({
      sub: user.id,
      sid: sessionId,
      family: familyId
    });

    await this.repository.createRefreshSession({
      id: sessionId,
      userId: user.id,
      tokenHash: hashTokenForStorage(refreshToken),
      familyId,
      expiresAt: daysFromNow(30),
      userAgent: context.userAgent,
      ipAddress: context.ipAddress
    });

    return {
      accessToken: signAccessToken({
        sub: user.id,
        org: user.organizationId,
        role: user.role
      }),
      refreshToken,
      user: {
        id: user.id,
        organizationId: user.organizationId,
        email: user.email,
        displayName: user.displayName,
        role: user.role
      }
    };
  }
}

function daysFromNow(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}


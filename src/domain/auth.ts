export const userRoles = ["ADMIN", "MANAGER", "AGENT", "VIEWER"] as const;
export type UserRole = (typeof userRoles)[number];

export const userStatuses = ["ACTIVE", "INVITED", "DISABLED"] as const;
export type UserStatus = (typeof userStatuses)[number];

export const sessionRevocationReasons = [
  "LOGOUT",
  "ROTATED",
  "ADMIN_REVOKED",
  "SECURITY_REVIEW"
] as const;
export type SessionRevocationReason = (typeof sessionRevocationReasons)[number];

export function isUserRole(value: string): value is UserRole {
  return userRoles.includes(value as UserRole);
}

export function isActiveUserStatus(value: string) {
  return value === "ACTIVE";
}


import { UserRole } from "@prisma/client";

interface ScopeMapping {
  [key: string]: string;
}
export function getScopeType(scope: string[]): UserRole {
  const joinedScope = scope.join(" ");
  if (joinedScope.includes("channel:read:editors")) {
    return UserRole.creator;
  } else if (joinedScope.includes("user:read:moderated_channels")) {
    return UserRole.moderator;
  } else if (
    joinedScope.includes("user:edit") ||
    joinedScope.includes("user:read:follows") ||
    joinedScope.includes("user:read:blocked_users") ||
    joinedScope.includes("user:read:email")
  ) {
    return UserRole.user;
  }

  return UserRole.user;
}

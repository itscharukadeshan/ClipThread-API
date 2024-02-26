export function getScopeType(scope: string[]): string {
  const joinedScope = scope.join(" ");
  if (
    joinedScope.includes("moderator:read:blocked_terms") ||
    joinedScope.includes("moderation:read")
  ) {
    return "creator";
  } else if (joinedScope.includes("user:read:moderated_channels")) {
    return "moderator";
  } else if (
    joinedScope.includes("user:edit") ||
    joinedScope.includes("user:read:follows") ||
    joinedScope.includes("user:read:blocked_users") ||
    joinedScope.includes("user:read:email")
  ) {
    return "user";
  } else {
    return "default";
  }
}

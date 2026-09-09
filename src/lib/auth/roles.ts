export type AppRole = "admin" | "editor" | "learner";

export function isStaffRole(role?: string | null): role is "admin" | "editor" {
  return role === "admin" || role === "editor";
}

export function isAdminRole(role?: string | null): role is "admin" {
  return role === "admin";
}

export function normalizeRole(role?: string | null): AppRole {
  if (role === "admin" || role === "editor") {
    return role;
  }
  return "learner";
}

export function isAdminOnlyPath(pathname: string) {
  return (
    pathname.startsWith("/admin/users") ||
    pathname.startsWith("/admin/orders") ||
    pathname.startsWith("/admin/payments") ||
    pathname.startsWith("/api/admin/users") ||
    pathname.startsWith("/api/admin/orders")
  );
}

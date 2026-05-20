import type { UserRole } from "@/types/auth";

const ADMIN_ROLES: UserRole[] = ["OWNER", "ADMIN"];

export function AdminBadge({ role }: { role: UserRole }) {
  if (!ADMIN_ROLES.includes(role)) return null;

  return (
    <span className="inline-flex items-center rounded-full bg-gray-900 px-2.5 py-0.5 text-xs font-semibold text-white">
      {role === "OWNER" ? "Owner" : "Admin"} access
    </span>
  );
}

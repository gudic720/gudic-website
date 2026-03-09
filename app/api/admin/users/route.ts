// lib/admin.ts
import { getCurrentUser } from "@/lib/getCurrentUser";

/**
 * Ensures the request is made by an authenticated ADMIN user.
 * Throws an Error("Unauthorized") or Error("Forbidden") to be handled by route.ts.
 */
export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    const err = new Error("Unauthorized");
    // @ts-expect-error attach status for handlers
    err.status = 401;
    throw err;
  }

  if (user.role !== "ADMIN") {
    const err = new Error("Forbidden");
    // @ts-expect-error attach status for handlers
    err.status = 403;
    throw err;
  }

  return user;
}

export function errorToStatus(err: unknown): number {
  if (err && typeof err === "object" && "status" in err) {
    const s = (err as { status?: unknown }).status;
    if (typeof s === "number") return s;
  }
  return 500;
}

export function errorToMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Unknown error";
}

// lib/getCurrentUser.ts
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/auth";
import type { Role } from "@prisma/client";

export async function getCurrentUser(): Promise<{
  id: string;
  email: string;
  name: string | null;
  role: Role;
  emailVerified: Date | null;
} | null> {
  const cookieStore = await cookies();

  const token =
    cookieStore.get("auth_token")?.value ??
    cookieStore.get("auth-token")?.value ??
    null;

  if (!token) return null;

  const payload = await verifyAuthToken(token);
  if (!payload?.userId) return null;

  return prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, role: true, emailVerified: true },
  });
}

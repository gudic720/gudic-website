// app/api/admin/users/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, errorToMessage, errorToStatus } from "@/lib/admin";
import type { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();
    const role = (searchParams.get("role") ?? "").trim();

    const where =
      q || role
        ? {
            AND: [
              q
                ? {
                    OR: [
                      { email: { contains: q, mode: "insensitive" } },
                      { name: { contains: q, mode: "insensitive" } },
                    ],
                  }
                : {},
              role === "ADMIN" || role === "USER" ? { role: role as Role } : {},
            ],
          }
        : undefined;

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ users });
  } catch (err) {
    return NextResponse.json(
      { error: errorToMessage(err) },
      { status: errorToStatus(err) }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const me = await requireAdmin();

    const body = (await req.json()) as { userId?: string; role?: string };
    const userId = String(body.userId ?? "");
    const roleStr = String(body.role ?? "");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    if (roleStr !== "ADMIN" && roleStr !== "USER") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Prevent locking yourself out
    if (me.id === userId && roleStr !== "ADMIN") {
      return NextResponse.json(
        { error: "You cannot remove your own admin role." },
        { status: 400 }
      );
    }

    const role: Role = roleStr;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, name: true, role: true, updatedAt: true },
    });

    return NextResponse.json({ user: updated });
  } catch (err) {
    return NextResponse.json(
      { error: errorToMessage(err) },
      { status: errorToStatus(err) }
    );
  }
}

// app/api/categories/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { nameEn: "asc" },
      select: { id: true, slug: true, nameAr: true, nameEn: true },
    });

    return NextResponse.json({ categories }, { status: 200 });
  } catch (e) {
    console.error("GET /api/categories error:", e);
    return NextResponse.json({ error: "Failed to load categories" }, { status: 500 });
  }
}

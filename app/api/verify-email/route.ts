// app/api/verify-email/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email, token } = (await req.json()) as { email?: string; token?: string };

    const safeEmail = String(email ?? "").trim().toLowerCase();
    const safeToken = String(token ?? "").trim();

    if (!safeEmail || !safeToken) {
      return NextResponse.json({ error: "Missing email or token" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: safeEmail },
      select: { id: true, emailVerified: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ If already verified → never ask again
    if (user.emailVerified) {
      await prisma.verificationToken.deleteMany({ where: { identifier: safeEmail } });
      return NextResponse.json({ message: "Already verified" }, { status: 200 });
    }

    const vt = await prisma.verificationToken.findFirst({
      where: { identifier: safeEmail, token: safeToken },
      select: { token: true, expires: true },
    });

    if (!vt) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    if (vt.expires < new Date()) {
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { email: safeEmail },
        data: { emailVerified: new Date() },
      }),
      prisma.verificationToken.deleteMany({ where: { identifier: safeEmail } }),
    ]);

    return NextResponse.json({ message: "Email verified successfully" }, { status: 200 });
  } catch (e) {
    console.error("verify-email error:", e);
    return NextResponse.json({ error: "Failed to verify email" }, { status: 500 });
  }
}

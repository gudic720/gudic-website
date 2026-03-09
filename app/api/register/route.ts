// app/api/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isValidEmailFormat(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value.trim());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    const locale = String(body?.locale ?? "en"); // send locale from client (optional)

    if (name.length < 2) {
      return NextResponse.json({ error: "Name is too short." }, { status: 400 });
    }
    if (!isValidEmailFormat(email)) {
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json(
        { error: "Email already registered." },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    // ✅ create user as unverified
    const user = await prisma.user.create({
      data: { name, email, password: hashed, emailVerified: null },
      select: { id: true, email: true },
    });

    // ✅ delete old tokens for this email (optional but clean)
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // ✅ token + expiry
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.verificationToken.create({
      data: { identifier: email, token, expires },
    });

    // ✅ IMPORTANT: APP_URL must be base only (no /ar)
    const origin =
      process.env.APP_URL || req.headers.get("origin") || "http://localhost:3000";

    // ✅ send user to PAGE: /[locale]/verify-email
    const verifyUrl = `${origin}/${locale}/verify-email?token=${encodeURIComponent(
      token
    )}&email=${encodeURIComponent(email)}`;

    await sendVerificationEmail({ to: email, verifyUrl, locale });

    return NextResponse.json(
      { user, message: "Account created. Please check your email to verify." },
      { status: 201 }
    );
  } catch (e: unknown) {
    // ✅ no "any" (eslint safe)
    let message = "Failed to register.";

    if (e instanceof Error) {
      console.error("register error:", e.message, e.stack);
      // Keep user-facing message generic (safer). You can also use e.message in dev.
      if (process.env.NODE_ENV !== "production") message = e.message;
    } else {
      console.error("register error:", e);
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

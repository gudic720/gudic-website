// app/api/login/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signAuthToken } from "@/lib/auth";

type LoginBody = {
  email?: string;
  password?: string;
  locale?: string; // ✅ optional (send from client)
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LoginBody;

    const locale = String(body.locale ?? "en");
    const isAr = locale === "ar";

    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";

    const TXT = {
      required: isAr
        ? "البريد الإلكتروني وكلمة المرور مطلوبان."
        : "Email and password are required.",
      invalid: isAr
        ? "البريد الإلكتروني أو كلمة المرور غير صحيحة."
        : "Invalid email or password.",
      notVerified: isAr
        ? "من فضلك فعّل بريدك الإلكتروني قبل تسجيل الدخول."
        : "Please verify your email before logging in.",
    };

    if (!email || !password) {
      return NextResponse.json({ error: TXT.required }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        emailVerified: true,
      },
    });

    if (!user?.password) {
      return NextResponse.json({ error: TXT.invalid }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: TXT.invalid }, { status: 401 });
    }

    // ✅ BLOCK LOGIN if email not verified
    if (!user.emailVerified) {
      return NextResponse.json({ error: TXT.notVerified }, { status: 403 });
    }

    const token = signAuthToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const res = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
      },
    });

    res.cookies.set("auth_token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
    });

    // legacy cleanup
    res.cookies.set("auth-token", "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (e: unknown) {
    console.error("login error:", e);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}

// app/api/me/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();

  // ✅ support both new + legacy cookie names
  const token =
    cookieStore.get("auth_token")?.value ||
    cookieStore.get("auth-token")?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const payload = verifyAuthToken(token);

  if (!payload) {
    // ✅ clear invalid cookies so UI won't stay "stuck"
    const res = NextResponse.json({ user: null }, { status: 200 });

    res.cookies.set("auth_token", "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      secure: process.env.NODE_ENV === "production",
    });

    res.cookies.set("auth-token", "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  }

  return NextResponse.json(
    {
      user: {
        id: payload.userId,
        email: payload.email,
        name: payload.name ?? null,
      },
    },
    { status: 200 }
  );
}

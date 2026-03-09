import jwt, { JwtPayload } from "jsonwebtoken";

const SECRET: string = (() => {
  const s = process.env.JWT_SECRET;


  if (process.env.NODE_ENV === "production") {
    if (!s) throw new Error("JWT_SECRET is not set");
    return s;
  }

  return s ?? "dev-secret-change-me";
})();

export interface AuthPayload {
  userId: string;
  email: string;
  name?: string | null;
}

export function signAuthToken(payload: AuthPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyAuthToken(token: string): AuthPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET);
    if (typeof decoded === "string") return null;

    const p = decoded as JwtPayload;

    if (typeof p.userId !== "string") return null;
    if (typeof p.email !== "string") return null;

    return {
      userId: p.userId,
      email: p.email,
      name: (p.name as string | null | undefined) ?? null,
    };
  } catch {
    return null;
  }
}

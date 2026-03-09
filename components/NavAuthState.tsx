// components/NavAuthState.tsx
import { cookies } from "next/headers";
import { verifyAuthToken, type AuthPayload } from "@/lib/auth";
import { ClientNavAuthState } from "./ClientNavAuthState";

type User = { id: string; email: string; name: string | null } | null;

export async function NavAuthState() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("auth_token")?.value ||
    cookieStore.get("auth-token")?.value || 
    null;

  let user: User = null;

  if (token) {
    const payload: AuthPayload | null = verifyAuthToken(token);
    if (payload) {
      user = { id: payload.userId, email: payload.email, name: payload.name ?? null };
    }
  }

  return <ClientNavAuthState user={user} loading={false} />;
}

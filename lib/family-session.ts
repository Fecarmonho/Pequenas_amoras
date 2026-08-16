import "server-only";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { getGuardianByUid } from "@/lib/guardians-db";

export const FAMILY_SESSION_COOKIE = "__family_session";

/** Retorna o responsável logado, só se a sessão for válida E existir um
 * documento `guardians` com esse uid. Cookie separado do admin
 * (__admin_session) — uma sessão de família nunca abre rota /admin, e
 * vice-versa. */
export async function getFamilySession() {
  const cookie = cookies().get(FAMILY_SESSION_COOKIE)?.value;
  if (!cookie) return null;

  try {
    const session = await adminAuth.verifySessionCookie(cookie, true);
    const guardian = await getGuardianByUid(session.uid);
    return guardian ? { session, guardian } : null;
  } catch {
    return null;
  }
}

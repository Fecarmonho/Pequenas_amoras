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
    // Sem checkRevoked: mesmo motivo do /api/familia/session — checar
    // revogação aqui rejeitaria sessões válidas por granularidade de
    // segundo logo após trocar a senha, sem trazer benefício real (não
    // temos um "sair de todos os aparelhos").
    const session = await adminAuth.verifySessionCookie(cookie);
    const guardian = await getGuardianByUid(session.uid);
    return guardian ? { session, guardian } : null;
  } catch {
    return null;
  }
}

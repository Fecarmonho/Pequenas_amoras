import "server-only";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { isAdmin } from "@/lib/admins-db";

export const ADMIN_SESSION_COOKIE = "__admin_session";

/** Retorna os dados do admin logado, só se a sessão for válida E o uid
 * tiver um documento na coleção `admins` — sem isso, ninguém entra no
 * painel mesmo com login válido no Firebase Auth. Cookie separado do da
 * família (__family_session) — uma sessão nunca serve pra outra. */
export async function getAdminSession() {
  const cookie = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  if (!cookie) return null;

  try {
    // Sem checkRevoked: mesmo motivo do /api/admin/session — checar
    // revogação aqui rejeitaria sessões válidas por granularidade de
    // segundo logo após trocar a senha, sem trazer benefício real (não
    // temos um "sair de todos os aparelhos").
    const session = await adminAuth.verifySessionCookie(cookie);
    const autorizado = await isAdmin(session.uid);
    return autorizado ? session : null;
  } catch {
    return null;
  }
}

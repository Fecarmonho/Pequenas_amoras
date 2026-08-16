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
    const session = await adminAuth.verifySessionCookie(cookie, true);
    const autorizado = await isAdmin(session.uid);
    return autorizado ? session : null;
  } catch {
    return null;
  }
}

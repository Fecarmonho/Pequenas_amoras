import "server-only";
import { randomBytes } from "crypto";
import { adminDb } from "@/lib/firebase-admin";

const COLLECTION = "password_setup_tokens";
const VALIDADE_HORAS = 48;

/**
 * Token próprio (não usa o "link de ação" do Firebase — geraSenhaResetLink
 * dependia do recurso "Personalizar URL acionável" do console, que usa
 * Firebase Dynamic Links por baixo, hoje quebrado/em descontinuação). O
 * documento usa o próprio token como id, então validar é só um get direto,
 * sem índice nem query.
 */
export async function criarTokenDefinirSenha(uid: string, email: string): Promise<string> {
  const token = randomBytes(24).toString("base64url");
  const expiraEm = new Date(Date.now() + VALIDADE_HORAS * 60 * 60 * 1000).toISOString();
  await adminDb.collection(COLLECTION).doc(token).set({
    uid,
    email,
    expiraEm,
    usado: false,
    createdAt: new Date().toISOString(),
  });
  return token;
}

/** Só confere se o token é válido (sem consumir) — usado quando a tela
 * carrega, pra mostrar de quem é a conta antes da pessoa digitar a senha. */
export async function validarTokenDefinirSenha(token: string): Promise<{ uid: string; email: string } | null> {
  const doc = await adminDb.collection(COLLECTION).doc(token).get();
  if (!doc.exists) return null;
  const data = doc.data()!;
  if (data.usado) return null;
  if (data.expiraEm < new Date().toISOString()) return null;
  return { uid: data.uid, email: data.email };
}

/** Marca o token como usado — chamado só depois da senha já ter sido
 * trocada de verdade, pra ele não poder ser reaproveitado. */
export async function consumirTokenDefinirSenha(token: string): Promise<void> {
  await adminDb.collection(COLLECTION).doc(token).update({ usado: true, usadoEm: new Date().toISOString() });
}

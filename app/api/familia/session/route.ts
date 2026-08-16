import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { getGuardianByUid } from "@/lib/guardians-db";
import { FAMILY_SESSION_COOKIE } from "@/lib/family-session";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 dias — famílias acessam pelo celular, sessão mais longa

/**
 * POST /api/familia/session
 * Igual à troca de token do admin, mas só cria o cookie se o uid tiver um
 * documento em `guardians` — sem isso, mesmo um login válido no Firebase
 * Auth não abre a Área da Família.
 */
export async function POST(request: NextRequest) {
  const { idToken } = await request.json();
  if (!idToken) return NextResponse.json({ error: "Token ausente." }, { status: 400 });

  try {
    const decoded = await adminAuth.verifyIdToken(idToken, true);
    const guardian = await getGuardianByUid(decoded.uid);
    if (!guardian) {
      return NextResponse.json({ error: "Este login não está vinculado a nenhuma família." }, { status: 403 });
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION_MS,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(FAMILY_SESSION_COOKIE, sessionCookie, {
      maxAge: SESSION_DURATION_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    return response;
  } catch (err) {
    console.error("Falha ao criar sessão de família", err);
    return NextResponse.json({ error: "Login inválido." }, { status: 401 });
  }
}

/** DELETE — logout, remove o cookie. */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(FAMILY_SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  return response;
}

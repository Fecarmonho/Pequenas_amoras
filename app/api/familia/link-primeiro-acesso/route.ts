import { NextRequest, NextResponse } from "next/server";
import { getGuardianByEmail } from "@/lib/guardians-db";
import { adminAuth } from "@/lib/firebase-admin";

/**
 * POST /api/familia/link-primeiro-acesso
 * Gera um link de "criar senha" pro próprio usuário, direto pela tela de
 * login — cobre tanto quem nunca definiu senha (primeiro acesso) quanto
 * quem esqueceu a senha atual, sem precisar do admin gerar/enviar nada
 * manualmente. Resposta genérica quando não encontra, pra não dar pista
 * sobre quais usuários existem.
 */
export async function POST(request: NextRequest) {
  const { identificador } = await request.json();
  if (!identificador || typeof identificador !== "string") {
    return NextResponse.json({ error: "Informe seu usuário." }, { status: 400 });
  }

  const valor = identificador.trim().toLowerCase();
  const email = valor.includes("@") ? valor : `${valor}@amoras.com`;
  const guardian = await getGuardianByEmail(email);

  if (!guardian) {
    return NextResponse.json({ error: "Não encontramos um cadastro com esse usuário." }, { status: 404 });
  }

  const link = await adminAuth.generatePasswordResetLink(email, {
    url: `${request.nextUrl.origin}/familia/definir-senha`,
  });

  return NextResponse.json({ link });
}

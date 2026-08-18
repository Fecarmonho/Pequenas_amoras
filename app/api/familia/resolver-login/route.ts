import { NextRequest, NextResponse } from "next/server";
import { getGuardianByEmail } from "@/lib/guardians-db";

/**
 * POST /api/familia/resolver-login
 * A família loga só com o "usuário" escolhido pelo admin — o e-mail
 * completo é sempre usuario@amoras.com. Resposta genérica quando não
 * encontra, pra não dar pista sobre quais usuários existem.
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

  return NextResponse.json({ email: guardian.email });
}

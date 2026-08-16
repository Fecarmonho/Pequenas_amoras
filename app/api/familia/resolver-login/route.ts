import { NextRequest, NextResponse } from "next/server";
import { getGuardianByCpf, getGuardianByEmail } from "@/lib/guardians-db";
import { isCpf, isEmail, onlyDigits } from "@/lib/cpf";

/**
 * POST /api/familia/resolver-login
 * A família loga com CPF ou e-mail, mas o Firebase Auth só entende
 * e-mail — essa rota resolve o identificador digitado pro e-mail
 * cadastrado no responsável, pro client então chamar
 * signInWithEmailAndPassword com o e-mail real. Resposta genérica quando
 * não encontra, pra não dar pista sobre quais CPFs/e-mails existem.
 */
export async function POST(request: NextRequest) {
  const { identificador } = await request.json();
  if (!identificador || typeof identificador !== "string") {
    return NextResponse.json({ error: "Informe seu CPF ou e-mail." }, { status: 400 });
  }

  const valor = identificador.trim();
  const guardian = isEmail(valor)
    ? await getGuardianByEmail(valor)
    : isCpf(valor)
      ? await getGuardianByCpf(onlyDigits(valor))
      : null;

  if (!guardian) {
    return NextResponse.json({ error: "Não encontramos um cadastro com esses dados." }, { status: 404 });
  }

  return NextResponse.json({ email: guardian.email });
}

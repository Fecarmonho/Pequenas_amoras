import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { adminAuth } from "@/lib/firebase-admin";
import { createGuardian, getGuardianByEmail } from "@/lib/guardians-db";
import { logAudit } from "@/lib/audit-db";
import { onlyDigits } from "@/lib/cpf";

/**
 * POST /api/admin/guardians
 * Cria o responsável E a conta de acesso (Firebase Auth) na mesma
 * operação — a família não se autocadastra, é o admin que provisiona o
 * login com uma senha provisória, repassada por fora do sistema.
 */
export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { nome, cpf, telefone, whatsapp, email, parentesco, senhaProvisoria } = await request.json();
  if (!nome || !cpf || !email || !senhaProvisoria) {
    return NextResponse.json({ error: "Preencha nome, CPF, e-mail e uma senha provisória." }, { status: 400 });
  }
  if (senhaProvisoria.length < 6) {
    return NextResponse.json({ error: "A senha provisória precisa ter pelo menos 6 caracteres." }, { status: 400 });
  }
  if (await getGuardianByEmail(email)) {
    return NextResponse.json({ error: "Já existe um responsável com esse e-mail." }, { status: 400 });
  }

  try {
    let uid: string;
    try {
      const userRecord = await adminAuth.createUser({ email, password: senhaProvisoria, displayName: nome });
      uid = userRecord.uid;
    } catch (err: any) {
      if (err?.code !== "auth/email-already-exists") throw err;
      const existingUser = await adminAuth.getUserByEmail(email);
      uid = existingUser.uid;
    }

    const guardian = await createGuardian({
      uid,
      nome,
      cpf: onlyDigits(cpf),
      telefone,
      whatsapp,
      email: email.toLowerCase(),
      parentesco,
      studentIds: [],
      createdAt: new Date().toISOString(),
    });

    await logAudit({
      actorEmail: session.email ?? "admin",
      acao: "criar",
      entidade: "guardian",
      entidadeId: guardian.id,
    });

    return NextResponse.json({ ok: true, guardian });
  } catch (err: any) {
    const message = err instanceof Error ? err.message : "Não foi possível criar o responsável.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { countAdmins, createAdminRecord } from "@/lib/admins-db";

/** GET — diz se já existe algum admin cadastrado (decide qual tela o login mostra). */
export async function GET() {
  const count = await countAdmins();
  return NextResponse.json({ hasAdmins: count > 0 });
}

/**
 * POST — cria a primeira conta principal do painel. Sem checar sessão de
 * propósito (ninguém está logado ainda) — a segurança aqui é: só funciona
 * enquanto não existir NENHUM admin. Depois do primeiro criado, essa rota
 * sempre recusa.
 */
export async function POST(request: NextRequest) {
  const existing = await countAdmins();
  if (existing > 0) {
    return NextResponse.json(
      { error: "Já existe uma conta principal. Peça pra ela criar seu acesso." },
      { status: 403 }
    );
  }

  const { nome, email, password } = await request.json();
  if (!nome || !email || !password || password.length < 6) {
    return NextResponse.json(
      { error: "Preencha nome, email e uma senha com pelo menos 6 caracteres." },
      { status: 400 }
    );
  }

  try {
    let uid: string;
    try {
      const userRecord = await adminAuth.createUser({ email, password, displayName: nome });
      uid = userRecord.uid;
    } catch (err: any) {
      if (err?.code !== "auth/email-already-exists") throw err;
      const existingUser = await adminAuth.getUserByEmail(email);
      uid = existingUser.uid;
    }

    await createAdminRecord({ uid, nome, email });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const message = err instanceof Error ? err.message : "Não foi possível criar a conta.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

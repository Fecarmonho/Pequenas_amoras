import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { getAllAdmins, createAdminRecord } from "@/lib/admins-db";
import { adminAuth } from "@/lib/firebase-admin";
import { logAudit } from "@/lib/audit-db";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const admins = await getAllAdmins();
  return NextResponse.json({ admins });
}

/**
 * POST — adiciona outro admin ao painel. A conta de acesso é criada aqui
 * (Firebase Auth com senha aleatória, nunca exposta) e um link de
 * "definir senha" é devolvido — o próprio novo admin escolhe a senha ao
 * abrir o link, igual ao acesso da família.
 */
export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { nome, email } = await request.json();
  if (!nome || !email) {
    return NextResponse.json({ error: "Preencha nome e e-mail." }, { status: 400 });
  }

  try {
    const { randomBytes } = await import("crypto");
    const senhaAleatoria = randomBytes(24).toString("base64url");

    let uid: string;
    try {
      const userRecord = await adminAuth.createUser({ email, password: senhaAleatoria, displayName: nome });
      uid = userRecord.uid;
    } catch (err: any) {
      if (err?.code !== "auth/email-already-exists") throw err;
      const existingUser = await adminAuth.getUserByEmail(email);
      uid = existingUser.uid;
    }

    await createAdminRecord({ uid, nome, email });

    const link = await adminAuth.generatePasswordResetLink(email, {
      url: `${request.nextUrl.origin}/admin/definir-senha`,
    });

    await logAudit({ actorEmail: session.email ?? "admin", acao: "criar", entidade: "admin", entidadeId: uid });

    return NextResponse.json({ ok: true, email, link });
  } catch (err: any) {
    const message = err instanceof Error ? err.message : "Não foi possível criar o acesso.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

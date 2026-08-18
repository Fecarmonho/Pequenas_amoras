import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { countAdmins, deleteAdminRecord } from "@/lib/admins-db";
import { adminAuth } from "@/lib/firebase-admin";
import { logAudit } from "@/lib/audit-db";

export async function DELETE(request: NextRequest, { params }: { params: { uid: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  if (params.uid === session.uid) {
    return NextResponse.json({ error: "Você não pode excluir seu próprio acesso." }, { status: 400 });
  }

  const total = await countAdmins();
  if (total <= 1) {
    return NextResponse.json({ error: "Não é possível excluir o último administrador." }, { status: 400 });
  }

  try {
    await adminAuth.deleteUser(params.uid);
  } catch {
    // se o usuário já não existir no Auth por algum motivo, seguimos em
    // frente e limpamos o resto mesmo assim
  }
  await deleteAdminRecord(params.uid);
  await logAudit({ actorEmail: session.email ?? "admin", acao: "excluir", entidade: "admin", entidadeId: params.uid });

  return NextResponse.json({ ok: true });
}

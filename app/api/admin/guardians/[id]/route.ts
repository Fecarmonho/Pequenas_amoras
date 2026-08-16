import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { updateGuardian, deleteGuardian } from "@/lib/guardians-db";
import { logAudit } from "@/lib/audit-db";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const data = await request.json();
  await updateGuardian(params.id, data);
  await logAudit({ actorEmail: session.email ?? "admin", acao: "editar", entidade: "guardian", entidadeId: params.id });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  await deleteGuardian(params.id);
  await logAudit({ actorEmail: session.email ?? "admin", acao: "excluir", entidade: "guardian", entidadeId: params.id });
  return NextResponse.json({ ok: true });
}

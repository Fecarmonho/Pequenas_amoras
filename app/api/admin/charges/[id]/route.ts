import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { updateCharge, deleteCharge } from "@/lib/charges-db";
import { logAudit } from "@/lib/audit-db";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const data = await request.json();
  // Marcar como pago registra a data — nunca sobrescreve um pagamento já
  // registrado se só o valor/vencimento estiver sendo editado.
  if (data.status === "pago" && !data.pagoEm) {
    data.pagoEm = new Date().toISOString().slice(0, 10);
  }

  await updateCharge(params.id, data);
  await logAudit({ actorEmail: session.email ?? "admin", acao: "editar", entidade: "charge", entidadeId: params.id });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  await deleteCharge(params.id);
  await logAudit({ actorEmail: session.email ?? "admin", acao: "excluir", entidade: "charge", entidadeId: params.id });
  return NextResponse.json({ ok: true });
}

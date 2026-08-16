import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { createCharge } from "@/lib/charges-db";
import { logAudit } from "@/lib/audit-db";
import { Charge } from "@/lib/types";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const charge = (await request.json()) as Omit<Charge, "id" | "createdAt">;
  if (!charge.studentId || !charge.descricao || !charge.valor || !charge.vencimento) {
    return NextResponse.json({ error: "Preencha os campos obrigatórios." }, { status: 400 });
  }

  const created = await createCharge({ ...charge, createdAt: new Date().toISOString() });
  await logAudit({
    actorEmail: session.email ?? "admin",
    acao: "criar",
    entidade: "charge",
    entidadeId: created.id,
    detalhes: `${charge.categoria} — ${charge.descricao}`,
  });

  return NextResponse.json({ ok: true, charge: created });
}

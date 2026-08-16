import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { createAviso } from "@/lib/avisos-db";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const data = await request.json();
  if (!data.titulo || !data.texto || !data.data) {
    return NextResponse.json({ error: "Preencha título, texto e data." }, { status: 400 });
  }

  await createAviso({ ...data, ativo: data.ativo ?? true, createdAt: new Date().toISOString() });
  return NextResponse.json({ ok: true });
}

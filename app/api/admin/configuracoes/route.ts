import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { updateConfiguracoes } from "@/lib/config-db";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const data = await request.json();
  await updateConfiguracoes(data);
  return NextResponse.json({ ok: true });
}

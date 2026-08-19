import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { createBanner, getAllBanners } from "@/lib/banners-db";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const data = await request.json();
  if (!data.imagem) {
    return NextResponse.json({ error: "Envie uma imagem para o slide." }, { status: 400 });
  }

  const existentes = await getAllBanners();
  const ordem = existentes.length;

  await createBanner({ ...data, ordem, ativo: data.ativo ?? true });
  return NextResponse.json({ ok: true });
}

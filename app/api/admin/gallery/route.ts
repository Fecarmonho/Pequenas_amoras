import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { createGalleryItem, getAllGalleryItems } from "@/lib/gallery-db";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const data = await request.json();
  if (!data.imagemUrl) return NextResponse.json({ error: "Envie uma imagem." }, { status: 400 });

  const existentes = await getAllGalleryItems();
  await createGalleryItem({ ...data, ordem: existentes.length, ativo: true });
  return NextResponse.json({ ok: true });
}

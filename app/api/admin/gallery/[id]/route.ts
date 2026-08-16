import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { deleteGalleryItem } from "@/lib/gallery-db";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  await deleteGalleryItem(params.id);
  return NextResponse.json({ ok: true });
}

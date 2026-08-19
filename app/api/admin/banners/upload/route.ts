import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getAdminSession } from "@/lib/admin-session";

/** Upload de imagem do carrossel direto pro Vercel Blob, sem compressão —
 * diferente das fotos pequenas (aluno/fundadora/aviso), o banner ocupa a
 * tela toda, então precisa manter a resolução original em vez de passar
 * pelo processarFoto (que reduz bastante pra caber como base64 no
 * Firestore). */
export async function POST(request: NextRequest) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await getAdminSession();
        if (!session) throw new Error("Não autenticado.");
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
          addRandomSuffix: true,
          maximumSizeInBytes: 15 * 1024 * 1024, // 15MB
        };
      },
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao autorizar upload." },
      { status: 400 }
    );
  }
}

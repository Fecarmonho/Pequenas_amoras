import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getAdminSession } from "@/lib/admin-session";

/** Upload de PDF anexado a um aviso, direto do navegador pro Vercel Blob
 * (mesmo motivo do boleto: PDF passa do limite confortável do Firestore). */
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
          allowedContentTypes: ["application/pdf"],
          addRandomSuffix: true,
          maximumSizeInBytes: 10 * 1024 * 1024, // 10MB
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

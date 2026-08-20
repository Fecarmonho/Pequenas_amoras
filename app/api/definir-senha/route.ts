import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { validarTokenDefinirSenha, consumirTokenDefinirSenha } from "@/lib/password-setup-token";

/** GET — só confere se o link ainda é válido e devolve o e-mail da conta,
 * sem mexer em nada — usado quando a tela "Criar senha" carrega. Serve
 * tanto pro admin quanto pra família (o token já sabe de qual conta é). */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Link inválido — falta um código." }, { status: 400 });

  const info = await validarTokenDefinirSenha(token);
  if (!info) {
    return NextResponse.json({ error: "Esse link expirou ou já foi usado." }, { status: 400 });
  }

  return NextResponse.json({ email: info.email });
}

/** POST — define a senha de verdade (via Admin SDK, direto no Firebase
 * Auth) e consome o token. */
export async function POST(request: NextRequest) {
  const { token, senha } = await request.json();
  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Link inválido — falta um código." }, { status: 400 });
  }
  if (!senha || typeof senha !== "string" || senha.length < 6) {
    return NextResponse.json({ error: "A senha precisa ter pelo menos 6 caracteres." }, { status: 400 });
  }

  const info = await validarTokenDefinirSenha(token);
  if (!info) {
    return NextResponse.json({ error: "Esse link expirou ou já foi usado." }, { status: 400 });
  }

  await adminAuth.updateUser(info.uid, { password: senha });
  await consumirTokenDefinirSenha(token);

  return NextResponse.json({ ok: true, email: info.email });
}

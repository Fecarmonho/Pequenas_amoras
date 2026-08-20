import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { getStudentById, updateStudent } from "@/lib/students-db";
import { getGuardianById, deleteGuardian } from "@/lib/guardians-db";
import { adminAuth } from "@/lib/firebase-admin";
import { logAudit } from "@/lib/audit-db";
import { criarTokenDefinirSenha } from "@/lib/password-setup-token";

/** POST — gera um novo link de primeiro acesso (define senha) pro
 * responsável já cadastrado, sem apagar nada — útil quando a família
 * perdeu o link antigo mas ainda lembra o número/e-mail. */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const student = await getStudentById(params.id);
  if (!student) return NextResponse.json({ error: "Estudante não encontrado." }, { status: 404 });

  const guardianId = student.guardianIds[0];
  const guardian = guardianId ? await getGuardianById(guardianId) : null;
  if (!guardian?.uid) return NextResponse.json({ error: "Este estudante ainda não tem acesso cadastrado." }, { status: 400 });

  const token = await criarTokenDefinirSenha(guardian.uid, guardian.email);
  const link = `${request.nextUrl.origin}/familia/definir-senha?token=${token}`;

  await logAudit({ actorEmail: session.email ?? "admin", acao: "reenviar-link", entidade: "guardian", entidadeId: guardian.id });

  return NextResponse.json({ ok: true, email: guardian.email, link, telefone: guardian.telefone });
}

/** DELETE — exclui o acesso da família (login + cadastro de responsável)
 * pra recomeçar do zero, ex: quando a pessoa perdeu acesso ao e-mail
 * (que nem é real) e ao telefone cadastrado ao mesmo tempo. */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const student = await getStudentById(params.id);
  if (!student) return NextResponse.json({ error: "Estudante não encontrado." }, { status: 404 });

  const guardianId = student.guardianIds[0];
  if (!guardianId) return NextResponse.json({ ok: true });

  const guardian = await getGuardianById(guardianId);
  if (guardian?.uid) {
    try {
      await adminAuth.deleteUser(guardian.uid);
    } catch {
      // se o usuário já não existir no Auth por algum motivo, seguimos
      // em frente e limpamos o resto mesmo assim
    }
  }

  await deleteGuardian(guardianId);
  await updateStudent(params.id, { guardianIds: [] });
  await logAudit({ actorEmail: session.email ?? "admin", acao: "excluir", entidade: "guardian", entidadeId: guardianId });

  return NextResponse.json({ ok: true });
}

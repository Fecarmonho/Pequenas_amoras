import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { updateStudent, deleteStudent, getStudentById } from "@/lib/students-db";
import { getGuardianById, updateGuardian, deleteGuardian } from "@/lib/guardians-db";
import { criarAcessoFamilia } from "@/lib/guardian-access";
import { createCharge, getChargesByStudent, deleteCharge } from "@/lib/charges-db";
import { adminAuth } from "@/lib/firebase-admin";
import { logAudit } from "@/lib/audit-db";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const body = await request.json();
  const { responsavel, mensalidadeInicial, ...studentData } = body;

  const student = await getStudentById(params.id);
  if (!student) return NextResponse.json({ error: "Estudante não encontrado." }, { status: 404 });

  let credenciais: { email: string; link: string; telefone: string } | undefined;

  try {
    if (responsavel?.nome) {
      const guardianAtual = student.guardianIds[0] ? await getGuardianById(student.guardianIds[0]) : null;

      if (guardianAtual) {
        // E-mail de acesso já criado não muda por aqui — só nome/telefone.
        await updateGuardian(guardianAtual.id, { nome: responsavel.nome, telefone: responsavel.telefone });
      } else {
        const { guardianId, email, link } = await criarAcessoFamilia({
          usuario: responsavel.usuario,
          nomeAluno: student.nome,
          nomeResponsavel: responsavel.nome,
          telefone: responsavel.telefone,
          studentId: params.id,
          origin: request.nextUrl.origin,
        });
        studentData.guardianIds = [guardianId];
        credenciais = { email, link, telefone: responsavel.telefone };
      }
    }

    await updateStudent(params.id, studentData);

    if (typeof mensalidadeInicial?.valor === "number" && mensalidadeInicial.vencimento) {
      await createCharge({
        studentId: params.id,
        categoria: "mensalidade",
        tipo: "mensalidade",
        competencia: mensalidadeInicial.vencimento.slice(0, 7),
        descricao: "Mensalidade",
        valor: mensalidadeInicial.valor,
        vencimento: mensalidadeInicial.vencimento,
        status: "pendente",
        createdAt: new Date().toISOString(),
      });
    }

    await logAudit({ actorEmail: session.email ?? "admin", acao: "editar", entidade: "student", entidadeId: params.id });
    return NextResponse.json({ ok: true, credenciais });
  } catch (err: any) {
    const message = err instanceof Error ? err.message : "Não foi possível salvar.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/** Apagar um estudante também apaga tudo que só existe por causa dele —
 * senão o login da família e as cobranças ficam órfãos no banco, e um
 * cadastro novo com o mesmo nome esbarra num e-mail "já usado" que na
 * prática não pertence a mais ninguém. */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const student = await getStudentById(params.id);
  if (!student) return NextResponse.json({ error: "Estudante não encontrado." }, { status: 404 });

  const guardianId = student.guardianIds[0];
  if (guardianId) {
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
  }

  const charges = await getChargesByStudent(params.id);
  await Promise.all(charges.map((c) => deleteCharge(c.id)));

  await deleteStudent(params.id);
  await logAudit({ actorEmail: session.email ?? "admin", acao: "excluir", entidade: "student", entidadeId: params.id });
  return NextResponse.json({ ok: true });
}

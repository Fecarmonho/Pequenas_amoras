import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { updateStudent, deleteStudent, getStudentById } from "@/lib/students-db";
import { getGuardianById, getGuardianByEmail, createGuardian, updateGuardian, addStudentToGuardian } from "@/lib/guardians-db";
import { adminAuth } from "@/lib/firebase-admin";
import { logAudit } from "@/lib/audit-db";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const body = await request.json();
  const { responsavel, mensalidadeInicial, ...studentData } = body;

  const student = await getStudentById(params.id);
  if (!student) return NextResponse.json({ error: "Estudante não encontrado." }, { status: 404 });

  try {
    if (responsavel?.email) {
      const guardianAtual = student.guardianIds[0] ? await getGuardianById(student.guardianIds[0]) : null;

      if (guardianAtual) {
        // E-mail de acesso já criado não muda por aqui — só nome/telefone.
        await updateGuardian(guardianAtual.id, { nome: responsavel.nome, telefone: responsavel.telefone });
      } else {
        const existente = await getGuardianByEmail(responsavel.email);
        if (existente) {
          await addStudentToGuardian(existente.id, params.id);
          studentData.guardianIds = [existente.id];
        } else if (responsavel.senhaProvisoria && responsavel.senhaProvisoria.length >= 6) {
          let uid: string;
          try {
            const userRecord = await adminAuth.createUser({
              email: responsavel.email,
              password: responsavel.senhaProvisoria,
              displayName: responsavel.nome,
            });
            uid = userRecord.uid;
          } catch (err: any) {
            if (err?.code !== "auth/email-already-exists") throw err;
            uid = (await adminAuth.getUserByEmail(responsavel.email)).uid;
          }
          const novoGuardian = await createGuardian({
            uid,
            nome: responsavel.nome,
            cpf: "",
            telefone: responsavel.telefone,
            email: responsavel.email.toLowerCase(),
            parentesco: "",
            studentIds: [params.id],
            createdAt: new Date().toISOString(),
          });
          studentData.guardianIds = [novoGuardian.id];
        }
      }
    }

    await updateStudent(params.id, studentData);
    await logAudit({ actorEmail: session.email ?? "admin", acao: "editar", entidade: "student", entidadeId: params.id });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const message = err instanceof Error ? err.message : "Não foi possível salvar.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  await deleteStudent(params.id);
  await logAudit({ actorEmail: session.email ?? "admin", acao: "excluir", entidade: "student", entidadeId: params.id });
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { updateStudent, deleteStudent, getStudentById } from "@/lib/students-db";
import { addStudentToGuardian, getGuardianById, updateGuardian } from "@/lib/guardians-db";
import { logAudit } from "@/lib/audit-db";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const data = await request.json();

  if (Array.isArray(data.guardianIds)) {
    const before = await getStudentById(params.id);
    const removidos = (before?.guardianIds ?? []).filter((id: string) => !data.guardianIds.includes(id));
    await Promise.all([
      ...data.guardianIds.map((guardianId: string) => addStudentToGuardian(guardianId, params.id)),
      ...removidos.map(async (guardianId: string) => {
        const guardian = await getGuardianById(guardianId);
        if (!guardian) return;
        await updateGuardian(guardianId, { studentIds: guardian.studentIds.filter((id) => id !== params.id) });
      }),
    ]);
  }

  await updateStudent(params.id, data);
  await logAudit({ actorEmail: session.email ?? "admin", acao: "editar", entidade: "student", entidadeId: params.id });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  await deleteStudent(params.id);
  await logAudit({ actorEmail: session.email ?? "admin", acao: "excluir", entidade: "student", entidadeId: params.id });
  return NextResponse.json({ ok: true });
}

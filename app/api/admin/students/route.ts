import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { createStudent } from "@/lib/students-db";
import { addStudentToGuardian } from "@/lib/guardians-db";
import { logAudit } from "@/lib/audit-db";
import { Student } from "@/lib/types";

interface Payload {
  student: Omit<Student, "id" | "createdAt" | "updatedAt" | "guardianIds"> & { guardianIds?: string[] };
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { student } = (await request.json()) as Payload;
  if (!student.nome || !student.dataNascimento || !student.dataMatricula || !student.modalidade) {
    return NextResponse.json({ error: "Preencha os campos obrigatórios." }, { status: 400 });
  }

  const now = new Date().toISOString();
  const guardianIds = student.guardianIds ?? [];

  const created = await createStudent({
    ...student,
    guardianIds,
    pessoasAutorizadas: student.pessoasAutorizadas ?? [],
    status: student.status ?? "ativo",
    createdAt: now,
    updatedAt: now,
  });

  await Promise.all(guardianIds.map((guardianId) => addStudentToGuardian(guardianId, created.id)));
  await logAudit({ actorEmail: session.email ?? "admin", acao: "criar", entidade: "student", entidadeId: created.id });

  return NextResponse.json({ ok: true, student: created });
}

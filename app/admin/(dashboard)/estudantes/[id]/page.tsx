import { notFound } from "next/navigation";
import { getStudentById } from "@/lib/students-db";
import { getGuardianById } from "@/lib/guardians-db";
import StudentForm from "@/components/admin/StudentForm";

export const dynamic = "force-dynamic";

export default async function EditarEstudantePage({ params }: { params: { id: string } }) {
  const student = await getStudentById(params.id);
  if (!student) notFound();
  const guardian = student.guardianIds[0] ? await getGuardianById(student.guardianIds[0]) : null;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 font-display text-2xl font-bold text-amora-950">{student.nome}</h1>
      <StudentForm student={student} guardian={guardian ?? undefined} />
    </div>
  );
}

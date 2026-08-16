import { notFound } from "next/navigation";
import { getStudentById } from "@/lib/students-db";
import { getAllGuardians } from "@/lib/guardians-db";
import StudentForm from "@/components/admin/StudentForm";

export const dynamic = "force-dynamic";

export default async function EditarEstudantePage({ params }: { params: { id: string } }) {
  const [student, guardians] = await Promise.all([getStudentById(params.id), getAllGuardians()]);
  if (!student) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 font-display text-2xl font-bold text-amora-950">{student.nome}</h1>
      <StudentForm guardians={guardians} student={student} />
    </div>
  );
}

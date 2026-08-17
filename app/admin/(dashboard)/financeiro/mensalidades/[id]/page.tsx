import { notFound } from "next/navigation";
import Link from "next/link";
import { getStudentById } from "@/lib/students-db";
import { getChargesByStudent } from "@/lib/charges-db";
import StudentChargesHub from "@/components/admin/StudentChargesHub";
import { HiOutlineArrowLeft } from "react-icons/hi2";

export const dynamic = "force-dynamic";

/** Hub financeiro de um estudante — mensalidades e cobranças extras juntas,
 * num só lugar (a Fase de simplificação juntou as duas telas separadas
 * que existiam antes). */
export default async function EstudanteFinanceiroPage({ params }: { params: { id: string } }) {
  const student = await getStudentById(params.id);
  if (!student) notFound();
  const charges = await getChargesByStudent(student.id);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/financeiro/mensalidades" className="flex items-center gap-1.5 text-sm font-semibold text-amora-700">
        <HiOutlineArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <h1 className="mt-4 mb-6 font-display text-2xl font-bold text-amora-950">{student.nome}</h1>

      <StudentChargesHub student={student} charges={charges} />
    </div>
  );
}

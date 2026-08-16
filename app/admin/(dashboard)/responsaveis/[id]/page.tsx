import { notFound } from "next/navigation";
import { getGuardianById } from "@/lib/guardians-db";
import { getStudentsByIds } from "@/lib/students-db";
import EditGuardianForm from "@/components/admin/EditGuardianForm";

export const dynamic = "force-dynamic";

export default async function EditarResponsavelPage({ params }: { params: { id: string } }) {
  const guardian = await getGuardianById(params.id);
  if (!guardian) notFound();
  const students = await getStudentsByIds(guardian.studentIds);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 font-display text-2xl font-bold text-amora-950">{guardian.nome}</h1>

      {students.length > 0 && (
        <div className="mb-6 rounded-2xl border border-amora-900/8 bg-white p-5 shadow-card">
          <p className="text-xs font-bold uppercase tracking-wide text-amora-700">Estudantes vinculados</p>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-ink/70">
            {students.map((s) => (
              <li key={s.id}>{s.nome}</li>
            ))}
          </ul>
        </div>
      )}

      <EditGuardianForm guardian={guardian} />
    </div>
  );
}

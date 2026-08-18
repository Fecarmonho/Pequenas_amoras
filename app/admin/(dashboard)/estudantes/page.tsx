import Link from "next/link";
import { getAllStudents } from "@/lib/students-db";
import { getAllGuardians } from "@/lib/guardians-db";
import DeleteButton from "@/components/admin/DeleteButton";
import { HiOutlinePlus, HiOutlineEye, HiOutlinePencil } from "react-icons/hi2";

export const dynamic = "force-dynamic";

export default async function EstudantesPage() {
  const [students, guardians] = await Promise.all([getAllStudents(), getAllGuardians()]);
  const guardiansById = new Map(guardians.map((g) => [g.id, g]));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-amora-950">Estudantes</h1>
        <Link
          href="/admin/estudantes/novo"
          className="btn-primary flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold text-white"
        >
          <HiOutlinePlus className="h-4 w-4" /> Novo estudante
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-amora-900/8 bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-amora-900/8 text-xs uppercase tracking-wide text-ink/40">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Modalidade</th>
              <th className="px-4 py-3">Responsável</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-amora-900/5">
            {students.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3">
                  <Link href={`/admin/estudantes/${s.id}/perfil`} className="font-medium text-amora-700 hover:underline">
                    {s.nome}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink/60">{s.modalidade}</td>
                <td className="px-4 py-3 text-ink/60">
                  {s.guardianIds.map((id) => guardiansById.get(id)?.nome).filter(Boolean).join(", ") || "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`badge-soft ${s.status === "inativo" ? "bg-ink/5 text-ink/40" : ""}`}>{s.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/estudantes/${s.id}/perfil`}
                      aria-label="Ver perfil"
                      className="rounded-lg p-2 text-ink/40 transition-colors hover:bg-amora-100 hover:text-amora-700"
                    >
                      <HiOutlineEye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/admin/estudantes/${s.id}`}
                      aria-label="Editar"
                      className="rounded-lg p-2 text-ink/40 transition-colors hover:bg-amora-100 hover:text-amora-700"
                    >
                      <HiOutlinePencil className="h-4 w-4" />
                    </Link>
                    <DeleteButton url={`/api/admin/students/${s.id}`} confirmMessage={`Excluir o estudante ${s.nome}?`} />
                  </div>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink/40">
                  Nenhum estudante cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

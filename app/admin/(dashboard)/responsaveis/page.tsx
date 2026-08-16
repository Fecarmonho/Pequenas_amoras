import Link from "next/link";
import { getAllGuardians } from "@/lib/guardians-db";
import DeleteButton from "@/components/admin/DeleteButton";
import { HiOutlinePlus } from "react-icons/hi2";

export const dynamic = "force-dynamic";

export default async function ResponsaveisPage() {
  const guardians = await getAllGuardians();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-amora-950">Responsáveis</h1>
        <Link
          href="/admin/responsaveis/novo"
          className="btn-primary flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold text-white"
        >
          <HiOutlinePlus className="h-4 w-4" /> Novo responsável
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-amora-900/8 bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-amora-900/8 text-xs uppercase tracking-wide text-ink/40">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Telefone</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Estudantes vinculados</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-amora-900/5">
            {guardians.map((g) => (
              <tr key={g.id}>
                <td className="px-4 py-3">
                  <Link href={`/admin/responsaveis/${g.id}`} className="font-medium text-amora-700 hover:underline">
                    {g.nome}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink/60">{g.telefone}</td>
                <td className="px-4 py-3 text-ink/60">{g.email}</td>
                <td className="px-4 py-3 text-ink/60">{g.studentIds.length}</td>
                <td className="px-4 py-3 text-right">
                  <DeleteButton
                    url={`/api/admin/guardians/${g.id}`}
                    confirmMessage={`Excluir o responsável ${g.nome}?`}
                  />
                </td>
              </tr>
            ))}
            {guardians.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink/40">
                  Nenhum responsável cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

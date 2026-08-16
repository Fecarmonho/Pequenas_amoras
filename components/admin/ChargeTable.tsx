import Link from "next/link";
import { Charge, Student } from "@/lib/types";
import { statusEfetivo, STATUS_LABEL, STATUS_EMOJI } from "@/lib/charge-status";
import { formatBRL, formatDate, formatCompetencia } from "@/lib/format";
import DeleteButton from "@/components/admin/DeleteButton";

export default function ChargeTable({
  charges,
  students,
  editBasePath,
}: {
  charges: Charge[];
  students: Student[];
  editBasePath: string;
}) {
  const studentsById = new Map(students.map((s) => [s.id, s]));

  return (
    <div className="overflow-x-auto rounded-2xl border border-amora-900/8 bg-white shadow-card">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-amora-900/8 text-xs uppercase tracking-wide text-ink/40">
          <tr>
            <th className="px-4 py-3">Estudante</th>
            <th className="px-4 py-3">Referência</th>
            <th className="px-4 py-3">Valor</th>
            <th className="px-4 py-3">Vencimento</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-amora-900/5">
          {charges.map((c) => {
            const status = statusEfetivo(c);
            return (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium text-ink">{studentsById.get(c.studentId)?.nome ?? "—"}</td>
                <td className="px-4 py-3 text-ink/60">
                  <Link href={`${editBasePath}/${c.id}`} className="hover:underline">
                    {c.competencia ? formatCompetencia(c.competencia) : c.descricao}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink/60">{formatBRL(c.valor)}</td>
                <td className="px-4 py-3 text-ink/60">{formatDate(c.vencimento)}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-semibold">{STATUS_EMOJI[status]} {STATUS_LABEL[status]}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <DeleteButton url={`/api/admin/charges/${c.id}`} confirmMessage="Excluir esta cobrança?" />
                </td>
              </tr>
            );
          })}
          {charges.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-ink/40">
                Nenhuma cobrança lançada ainda.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

import Link from "next/link";
import { getAllStudents } from "@/lib/students-db";
import { getAllCharges } from "@/lib/charges-db";
import { getConfiguracoes } from "@/lib/config-db";
import { garantirMensalidadesAteHoje } from "@/lib/mensalidade-renovacao";
import { statusEfetivo, STATUS_LABEL, STATUS_EMOJI } from "@/lib/charge-status";
import { formatBRL, formatDate, formatCompetencia } from "@/lib/format";
import { HiChevronRight } from "react-icons/hi2";
import ChavePixConfig from "@/components/admin/ChavePixConfig";
import MarcarRecebidoButton from "@/components/admin/MarcarRecebidoButton";

export const dynamic = "force-dynamic";

export default async function MensalidadesPage() {
  const [students, config] = await Promise.all([getAllStudents(), getConfiguracoes()]);

  // A mensalidade do mês renova sozinha (repete o valor da última) — só
  // precisa checar isso pros estudantes ativos, toda vez que essa tela
  // abre, antes de buscar as cobranças pra exibir.
  await Promise.all(students.filter((s) => s.status === "ativo").map((s) => garantirMensalidadesAteHoje(s)));

  const charges = await getAllCharges();
  const studentsPorId = new Map(students.map((s) => [s.id, s]));

  // Toda mensalidade ainda não paga, de qualquer mês — não só a do mês
  // vigente, senão uma parcela atrasada de um mês anterior fica invisível
  // aqui (só apareceria abrindo o hub daquele aluno específico).
  const emAberto = charges
    .filter((c) => c.categoria === "mensalidade" && c.status !== "pago")
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento));

  const historico = charges
    .filter((c) => c.categoria === "mensalidade" && c.status === "pago")
    .sort((a, b) => (b.pagoEm ?? b.vencimento).localeCompare(a.pagoEm ?? a.vencimento));

  return (
    <div>
      <h1 className="mb-2 font-display text-2xl font-bold text-amora-950">Mensalidades</h1>
      <p className="mb-6 text-sm text-ink/50">
        Todas as mensalidades em aberto, de qualquer mês. Marque como recebida aqui ou clique num estudante pra
        ver o histórico completo e lançar cobranças extras.
      </p>

      <ChavePixConfig chavePixInicial={config.chavePix} />

      <div className="overflow-x-auto rounded-2xl border border-amora-900/8 bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-amora-900/8 text-xs uppercase tracking-wide text-ink/40">
            <tr>
              <th className="px-4 py-3">Estudante</th>
              <th className="px-4 py-3">Competência</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Vencimento</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-amora-900/5">
            {emAberto.map((c) => {
              const student = studentsPorId.get(c.studentId);
              const status = statusEfetivo(c);
              return (
                <tr key={c.id}>
                  <td className="px-4 py-3">
                    {student ? (
                      <Link href={`/admin/financeiro/mensalidades/${student.id}`} className="font-medium text-amora-700 hover:underline">
                        {student.nome}
                      </Link>
                    ) : (
                      <span className="text-ink/40">Aluno removido</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink/60">{c.competencia ? formatCompetencia(c.competencia) : "—"}</td>
                  <td className="px-4 py-3 text-ink/60">{formatBRL(c.valor)}</td>
                  <td className="px-4 py-3 text-ink/60">{formatDate(c.vencimento)}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold">{STATUS_EMOJI[status]} {STATUS_LABEL[status]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <MarcarRecebidoButton chargeId={c.id} />
                      {student && (
                        <Link href={`/admin/financeiro/mensalidades/${student.id}`}>
                          <HiChevronRight className="h-4 w-4 text-ink/30" />
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {emAberto.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink/40">
                  Nenhuma mensalidade em aberto.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {historico.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 font-display text-lg font-bold text-amora-950">Histórico de pagas</h2>
          <div className="overflow-x-auto rounded-2xl border border-amora-900/8 bg-white shadow-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-amora-900/8 text-xs uppercase tracking-wide text-ink/40">
                <tr>
                  <th className="px-4 py-3">Estudante</th>
                  <th className="px-4 py-3">Competência</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Pago em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amora-900/5">
                {historico.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3">
                      {studentsPorId.get(c.studentId) ? (
                        <Link href={`/admin/financeiro/mensalidades/${c.studentId}`} className="font-medium text-amora-700 hover:underline">
                          {studentsPorId.get(c.studentId)!.nome}
                        </Link>
                      ) : (
                        <span className="text-ink/40">Aluno removido</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink/60">{c.competencia ? formatCompetencia(c.competencia) : "—"}</td>
                    <td className="px-4 py-3 text-ink/60">{formatBRL(c.valor)}</td>
                    <td className="px-4 py-3 text-ink/60">{c.pagoEm ? formatDate(c.pagoEm) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

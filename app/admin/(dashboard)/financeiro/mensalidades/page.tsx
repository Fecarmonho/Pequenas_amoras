import Link from "next/link";
import { getAllStudents } from "@/lib/students-db";
import { getAllCharges } from "@/lib/charges-db";
import { getConfiguracoes } from "@/lib/config-db";
import { garantirMensalidadesAteHoje } from "@/lib/mensalidade-renovacao";
import { statusEfetivo, STATUS_LABEL, STATUS_EMOJI } from "@/lib/charge-status";
import { formatBRL, formatDate, formatCompetencia } from "@/lib/format";
import { Charge } from "@/lib/types";
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
  const mesAtual = new Date().toISOString().slice(0, 7);

  // Mês vigente por aluno, ainda não paga — é a área de trabalho do dia a
  // dia: marcar como recebida aqui, ou entrar no aluno pra lançar uma
  // cobrança extra.
  const vigentePorAluno = new Map<string, Charge>();
  for (const c of charges) {
    if (c.categoria === "mensalidade" && c.competencia === mesAtual && c.status !== "pago") {
      vigentePorAluno.set(c.studentId, c);
    }
  }

  // Todas as mensalidades em aberto, de qualquer mês — visão geral pra não
  // deixar uma parcela atrasada de mês anterior invisível. Só visualização
  // (clica pra entrar no aluno e editar lá), sem ação rápida aqui.
  const todasEmAberto = charges
    .filter((c) => c.categoria === "mensalidade" && c.status !== "pago")
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento));

  const historico = charges
    .filter((c) => c.categoria === "mensalidade" && c.status === "pago")
    .sort((a, b) => (b.pagoEm ?? b.vencimento).localeCompare(a.pagoEm ?? a.vencimento));

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-amora-950">Mensalidades</h1>

      <ChavePixConfig chavePixInicial={config.chavePix} />

      <section>
        <h2 className="mb-1 font-display text-lg font-bold text-amora-950">Mês vigente — {formatCompetencia(mesAtual)}</h2>
        <p className="mb-3 text-sm text-ink/50">Marque como recebida aqui, ou clique num estudante pra lançar uma cobrança extra.</p>
        <div className="overflow-x-auto rounded-2xl border border-amora-900/8 bg-white shadow-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-amora-900/8 text-xs uppercase tracking-wide text-ink/40">
              <tr>
                <th className="px-4 py-3">Estudante</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Vencimento</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-amora-900/5">
              {students
                .filter((s) => vigentePorAluno.has(s.id))
                .map((s) => {
                  const charge = vigentePorAluno.get(s.id)!;
                  const status = statusEfetivo(charge);
                  return (
                    <tr key={s.id}>
                      <td className="px-4 py-3">
                        <Link href={`/admin/financeiro/mensalidades/${s.id}`} className="font-medium text-amora-700 hover:underline">
                          {s.nome}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-ink/60">{formatBRL(charge.valor)}</td>
                      <td className="px-4 py-3 text-ink/60">{formatDate(charge.vencimento)}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold">{STATUS_EMOJI[status]} {STATUS_LABEL[status]}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <MarcarRecebidoButton chargeId={charge.id} />
                          <Link href={`/admin/financeiro/mensalidades/${s.id}`}>
                            <HiChevronRight className="h-4 w-4 text-ink/30" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              {vigentePorAluno.size === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-ink/40">
                    Nenhuma mensalidade em aberto no mês.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-1 font-display text-lg font-bold text-amora-950">Todas as mensalidades</h2>
        <p className="mb-3 text-sm text-ink/50">Visão geral de tudo em aberto, de qualquer mês — clique pra ver e editar.</p>
        <div className="overflow-x-auto rounded-2xl border border-amora-900/8 bg-white shadow-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-amora-900/8 text-xs uppercase tracking-wide text-ink/40">
              <tr>
                <th className="px-4 py-3">Estudante</th>
                <th className="px-4 py-3">Competência</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Vencimento</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amora-900/5">
              {todasEmAberto.map((c) => {
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
                  </tr>
                );
              })}
              {todasEmAberto.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-ink/40">
                    Nenhuma mensalidade em aberto.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {historico.length > 0 && (
        <section className="mt-8">
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
        </section>
      )}
    </div>
  );
}

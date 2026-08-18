import Link from "next/link";
import { getAllStudents } from "@/lib/students-db";
import { getAllCharges } from "@/lib/charges-db";
import { getConfiguracoes } from "@/lib/config-db";
import { garantirMensalidadesAteHoje } from "@/lib/mensalidade-renovacao";
import { statusEfetivo, STATUS_LABEL, STATUS_EMOJI } from "@/lib/charge-status";
import { formatBRL, formatDate, formatCompetencia } from "@/lib/format";
import { HiChevronRight } from "react-icons/hi2";
import { Charge } from "@/lib/types";
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
  const mesAtual = new Date().toISOString().slice(0, 7);

  // Sempre a mensalidade do mês vigente — não a "última lançada", pra não
  // misturar com meses passados.
  const mensalidadeAtualPorAluno = new Map<string, Charge>();
  for (const c of charges) {
    if (c.categoria === "mensalidade" && c.competencia === mesAtual) {
      mensalidadeAtualPorAluno.set(c.studentId, c);
    }
  }

  const studentsPorId = new Map(students.map((s) => [s.id, s]));
  const historico = charges
    .filter((c) => c.categoria === "mensalidade" && c.status === "pago")
    .sort((a, b) => (b.pagoEm ?? b.vencimento).localeCompare(a.pagoEm ?? a.vencimento));

  return (
    <div>
      <h1 className="mb-2 font-display text-2xl font-bold text-amora-950">Mensalidades</h1>
      <p className="mb-6 text-sm text-ink/50">
        Mensalidade de {formatCompetencia(mesAtual)} (mês vigente). Marque como recebida aqui ou clique num
        estudante pra ver o histórico completo e lançar cobranças extras.
      </p>

      <ChavePixConfig chavePixInicial={config.chavePix} />

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
            {/* Quem já pagou a mensalidade do mês some daqui e vai pro
                histórico — essa lista é só o que ainda está em aberto. */}
            {students
              .filter((s) => mensalidadeAtualPorAluno.get(s.id)?.status !== "pago")
              .map((s) => {
                const charge = mensalidadeAtualPorAluno.get(s.id);
                const status = charge ? statusEfetivo(charge) : null;
                return (
                  <tr key={s.id}>
                    <td className="px-4 py-3">
                      <Link href={`/admin/financeiro/mensalidades/${s.id}`} className="font-medium text-amora-700 hover:underline">
                        {s.nome}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink/60">{charge ? formatBRL(charge.valor) : "—"}</td>
                    <td className="px-4 py-3 text-ink/60">{charge ? formatDate(charge.vencimento) : "—"}</td>
                    <td className="px-4 py-3">
                      {status ? (
                        <span className="text-xs font-semibold">{STATUS_EMOJI[status]} {STATUS_LABEL[status]}</span>
                      ) : (
                        <span className="text-xs text-ink/30">Sem mensalidade</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {charge && <MarcarRecebidoButton chargeId={charge.id} />}
                        <Link href={`/admin/financeiro/mensalidades/${s.id}`}>
                          <HiChevronRight className="h-4 w-4 text-ink/30" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
                      <Link href={`/admin/financeiro/mensalidades/${c.studentId}`} className="font-medium text-amora-700 hover:underline">
                        {studentsPorId.get(c.studentId)?.nome ?? "Aluno removido"}
                      </Link>
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

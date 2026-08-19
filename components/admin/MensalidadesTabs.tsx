"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { StatusCobrancaEfetivo } from "@/lib/types";
import { STATUS_LABEL, STATUS_EMOJI } from "@/lib/charge-status";
import { formatBRL, formatDate, formatCompetencia } from "@/lib/format";
import { HiChevronRight } from "react-icons/hi2";
import MarcarRecebidoButton from "@/components/admin/MarcarRecebidoButton";

/** Uma linha por estudante — os campos de cobrança vêm null quando esse
 * aluno não tem nada em aberto pra mostrar (nunca lançou mensalidade, ou
 * já está tudo pago). Usado nas abas "Mês vigente" e "Todas". */
export interface MensalidadeStudentRow {
  studentId: string;
  studentNome: string;
  chargeId: string | null;
  competencia: string | null;
  valor: number | null;
  vencimento: string | null;
  status: StatusCobrancaEfetivo | null;
}

export interface HistoricoRow {
  chargeId: string;
  studentId: string | null;
  studentNome: string | null;
  competencia: string | null;
  valor: number;
  pagoEm: string | null;
}

const TABS = [
  { id: "vigente", label: "Mês vigente" },
  { id: "todas", label: "Todas" },
  { id: "historico", label: "Histórico" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function NomeAluno({ studentId, nome }: { studentId: string | null; nome: string | null }) {
  if (!studentId) return <span className="text-ink/40">Aluno removido</span>;
  return (
    <Link href={`/admin/financeiro/mensalidades/${studentId}`} className="font-medium text-amora-700 hover:underline">
      {nome}
    </Link>
  );
}

function TabelaVigente({ rows, mensagemVazio }: { rows: MensalidadeStudentRow[]; mensagemVazio: string }) {
  return (
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
          {rows.map((r) => (
            <tr key={r.studentId}>
              <td className="px-4 py-3">
                <NomeAluno studentId={r.studentId} nome={r.studentNome} />
              </td>
              <td className="px-4 py-3 text-ink/60">{r.valor !== null ? formatBRL(r.valor) : "—"}</td>
              <td className="px-4 py-3 text-ink/60">{r.vencimento ? formatDate(r.vencimento) : "—"}</td>
              <td className="px-4 py-3">
                {r.status ? (
                  <span className="text-xs font-semibold">{STATUS_EMOJI[r.status]} {STATUS_LABEL[r.status]}</span>
                ) : (
                  <span className="text-xs text-ink/30">Sem mensalidade</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  {r.chargeId && <MarcarRecebidoButton chargeId={r.chargeId} />}
                  <Link href={`/admin/financeiro/mensalidades/${r.studentId}`}>
                    <HiChevronRight className="h-4 w-4 text-ink/30" />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-ink/40">
                {mensagemVazio}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function MensalidadesTabs({
  mesAtualLabel,
  vigente,
  todasEmAberto,
  historico,
}: {
  mesAtualLabel: string;
  vigente: MensalidadeStudentRow[];
  todasEmAberto: MensalidadeStudentRow[];
  historico: HistoricoRow[];
}) {
  const [tab, setTab] = useState<TabId>("vigente");
  const [filtroMes, setFiltroMes] = useState("todos");

  const mesesHistorico = useMemo(() => {
    const unicos = Array.from(new Set(historico.map((c) => c.competencia).filter((c): c is string => Boolean(c))));
    return unicos.sort((a, b) => b.localeCompare(a));
  }, [historico]);

  const historicoFiltrado = filtroMes === "todos" ? historico : historico.filter((c) => c.competencia === filtroMes);

  return (
    <div>
      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-amora-900/8">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === t.id ? "border-b-2 border-amora-700 text-amora-700" : "text-ink/40 hover:text-ink/70"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "vigente" && (
        <section>
          <p className="mb-3 text-sm text-ink/50">
            Mensalidades de {mesAtualLabel}. Marque como recebida aqui, ou clique num estudante pra lançar uma cobrança extra.
          </p>
          <TabelaVigente rows={vigente} mensagemVazio="Nenhuma mensalidade em aberto no mês." />
        </section>
      )}

      {tab === "todas" && (
        <section>
          <p className="mb-3 text-sm text-ink/50">
            Todo estudante cadastrado, com a mensalidade em aberto mais recente de cada um (qualquer mês) — só pra
            consulta, sem ação aqui.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-amora-900/8 bg-white shadow-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-amora-900/8 text-xs uppercase tracking-wide text-ink/40">
                <tr>
                  <th className="px-4 py-3">Estudante</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Dia de vencimento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amora-900/5">
                {todasEmAberto.map((r) => (
                  <tr key={r.studentId}>
                    <td className="px-4 py-3">
                      <NomeAluno studentId={r.studentId} nome={r.studentNome} />
                    </td>
                    <td className="px-4 py-3 text-ink/60">{r.valor !== null ? formatBRL(r.valor) : "—"}</td>
                    <td className="px-4 py-3 text-ink/60">{r.vencimento ? formatDate(r.vencimento) : "—"}</td>
                  </tr>
                ))}
                {todasEmAberto.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-ink/40">
                      Nenhum estudante cadastrado ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "historico" && (
        <section>
          {mesesHistorico.length > 0 && (
            <label className="mb-3 block text-sm font-medium text-ink/70">
              Filtrar por mês
              <select
                value={filtroMes}
                onChange={(e) => setFiltroMes(e.target.value)}
                className="mt-1 w-full max-w-xs rounded-xl border border-amora-900/15 bg-white px-4 py-2.5 text-sm text-ink focus:border-amora-600 focus:outline-none sm:w-auto"
              >
                <option value="todos">Todos os meses</option>
                {mesesHistorico.map((m) => (
                  <option key={m} value={m}>{formatCompetencia(m)}</option>
                ))}
              </select>
            </label>
          )}
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
                {historicoFiltrado.map((c) => (
                  <tr key={c.chargeId}>
                    <td className="px-4 py-3">
                      <NomeAluno studentId={c.studentId} nome={c.studentNome} />
                    </td>
                    <td className="px-4 py-3 text-ink/60">{c.competencia ? formatCompetencia(c.competencia) : "—"}</td>
                    <td className="px-4 py-3 text-ink/60">{formatBRL(c.valor)}</td>
                    <td className="px-4 py-3 text-ink/60">{c.pagoEm ? formatDate(c.pagoEm) : "—"}</td>
                  </tr>
                ))}
                {historicoFiltrado.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-ink/40">
                      Nenhuma mensalidade paga {filtroMes === "todos" ? "ainda" : "nesse mês"}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

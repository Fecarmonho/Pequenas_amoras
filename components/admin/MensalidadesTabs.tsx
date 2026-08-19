"use client";

import { useState } from "react";
import Link from "next/link";
import { StatusCobrancaEfetivo } from "@/lib/types";
import { STATUS_LABEL, STATUS_EMOJI } from "@/lib/charge-status";
import { formatBRL, formatDate, formatCompetencia } from "@/lib/format";
import { HiChevronRight } from "react-icons/hi2";
import MarcarRecebidoButton from "@/components/admin/MarcarRecebidoButton";

export interface VigenteRow {
  studentId: string;
  studentNome: string;
  chargeId: string;
  valor: number;
  vencimento: string;
  status: StatusCobrancaEfetivo;
}

export interface AbertoRow {
  chargeId: string;
  studentId: string | null;
  studentNome: string | null;
  competencia: string | null;
  valor: number;
  vencimento: string;
  status: StatusCobrancaEfetivo;
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

export default function MensalidadesTabs({
  mesAtualLabel,
  vigente,
  todasEmAberto,
  historico,
}: {
  mesAtualLabel: string;
  vigente: VigenteRow[];
  todasEmAberto: AbertoRow[];
  historico: HistoricoRow[];
}) {
  const [tab, setTab] = useState<TabId>("vigente");

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
                {vigente.map((r) => (
                  <tr key={r.chargeId}>
                    <td className="px-4 py-3">
                      <NomeAluno studentId={r.studentId} nome={r.studentNome} />
                    </td>
                    <td className="px-4 py-3 text-ink/60">{formatBRL(r.valor)}</td>
                    <td className="px-4 py-3 text-ink/60">{formatDate(r.vencimento)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold">{STATUS_EMOJI[r.status]} {STATUS_LABEL[r.status]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <MarcarRecebidoButton chargeId={r.chargeId} />
                        {r.studentId && (
                          <Link href={`/admin/financeiro/mensalidades/${r.studentId}`}>
                            <HiChevronRight className="h-4 w-4 text-ink/30" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {vigente.length === 0 && (
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
      )}

      {tab === "todas" && (
        <section>
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
                {todasEmAberto.map((c) => (
                  <tr key={c.chargeId}>
                    <td className="px-4 py-3">
                      <NomeAluno studentId={c.studentId} nome={c.studentNome} />
                    </td>
                    <td className="px-4 py-3 text-ink/60">{c.competencia ? formatCompetencia(c.competencia) : "—"}</td>
                    <td className="px-4 py-3 text-ink/60">{formatBRL(c.valor)}</td>
                    <td className="px-4 py-3 text-ink/60">{formatDate(c.vencimento)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold">{STATUS_EMOJI[c.status]} {STATUS_LABEL[c.status]}</span>
                    </td>
                  </tr>
                ))}
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
      )}

      {tab === "historico" && (
        <section>
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
                  <tr key={c.chargeId}>
                    <td className="px-4 py-3">
                      <NomeAluno studentId={c.studentId} nome={c.studentNome} />
                    </td>
                    <td className="px-4 py-3 text-ink/60">{c.competencia ? formatCompetencia(c.competencia) : "—"}</td>
                    <td className="px-4 py-3 text-ink/60">{formatBRL(c.valor)}</td>
                    <td className="px-4 py-3 text-ink/60">{c.pagoEm ? formatDate(c.pagoEm) : "—"}</td>
                  </tr>
                ))}
                {historico.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-ink/40">
                      Nenhuma mensalidade paga ainda.
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

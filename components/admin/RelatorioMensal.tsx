"use client";

import { useMemo, useRef, useState } from "react";
import { Charge } from "@/lib/types";
import { formatBRL, formatCompetencia } from "@/lib/format";
import { baixarReciboPdf } from "@/lib/receipt-pdf";
import { HiOutlineArrowDownTray } from "react-icons/hi2";

/** Gráfico de rosca simples em SVG puro — sem lib de gráfico, só um
 * círculo com stroke-dasharray proporcional ao % recebido. */
function DonutChart({ pct }: { pct: number }) {
  const raio = 60;
  const circunferencia = 2 * Math.PI * raio;
  const recebidoLen = (pct / 100) * circunferencia;
  return (
    <svg viewBox="0 0 160 160" className="h-36 w-36 shrink-0">
      <circle cx="80" cy="80" r={raio} fill="none" strokeWidth="20" className="stroke-rosa-100" />
      <circle
        cx="80"
        cy="80"
        r={raio}
        fill="none"
        strokeWidth="20"
        strokeLinecap="round"
        className="stroke-folha"
        strokeDasharray={`${recebidoLen} ${circunferencia}`}
        transform="rotate(-90 80 80)"
      />
      <text x="80" y="78" textAnchor="middle" className="fill-amora-950 font-display text-3xl font-bold">
        {pct}%
      </text>
      <text x="80" y="98" textAnchor="middle" className="fill-ink/40 text-[10px] font-semibold uppercase tracking-wide">
        recebido
      </text>
    </svg>
  );
}

/** Sem `gap` de propósito (nem aqui, nem nos outros containers dentro da
 * área exportada em PDF) — o html2canvas não calcula direito o
 * espaçamento de `gap` do flexbox/grid, as linhas saíam sobrepostas e os
 * nomes cortados no PDF. Espaçamento sempre por margem, que ele reproduz
 * certinho. */
function BarraAluno({ nome, valor, total }: { nome: string; valor: number; total: number }) {
  const pct = total > 0 ? Math.round((valor / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="truncate pr-2 font-medium text-ink/70">{nome}</span>
        <span className="shrink-0 font-mono text-ink/50">{formatBRL(valor)}</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-amora-900/5">
        <div className="h-full rounded-full bg-gradient-to-r from-amora-700 to-rosa-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Balanço de um mês (mensalidade + extra juntas) — recebido x em aberto,
 * com gráfico e detalhamento por aluno, exportável em PDF. Competência de
 * cada cobrança é o campo `competencia` pra mensalidade, ou o mês do
 * vencimento pra cobrança extra (que não tem competência própria). */
export default function RelatorioMensal({
  charges,
  studentsPorId,
}: {
  charges: Charge[];
  studentsPorId: Record<string, string>;
}) {
  const meses = useMemo(() => {
    const set = new Set<string>();
    charges.forEach((c) => {
      const comp = c.categoria === "mensalidade" ? c.competencia : c.vencimento?.slice(0, 7);
      if (comp) set.add(comp);
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [charges]);

  const [mes, setMes] = useState(meses[0] ?? new Date().toISOString().slice(0, 7));
  const [exportando, setExportando] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const doMes = useMemo(
    () =>
      charges.filter((c) => {
        const comp = c.categoria === "mensalidade" ? c.competencia : c.vencimento?.slice(0, 7);
        return comp === mes;
      }),
    [charges, mes]
  );

  const mensalidades = doMes.filter((c) => c.categoria === "mensalidade");
  const extras = doMes.filter((c) => c.categoria === "extra");
  const pagas = doMes.filter((c) => c.status === "pago");
  const pendentes = doMes.filter((c) => c.status !== "pago");
  const recebido = pagas.reduce((s, c) => s + c.valor, 0);
  const emAberto = pendentes.reduce((s, c) => s + c.valor, 0);
  const total = recebido + emAberto;
  const pctRecebido = total > 0 ? Math.round((recebido / total) * 100) : 0;

  const porAluno = useMemo(() => {
    const mapa = new Map<string, number>();
    doMes.forEach((c) => mapa.set(c.studentId, (mapa.get(c.studentId) ?? 0) + c.valor));
    return Array.from(mapa.entries())
      .map(([studentId, valor]) => ({ studentId, nome: studentsPorId[studentId] ?? "Aluno removido", valor }))
      .sort((a, b) => b.valor - a.valor);
  }, [doMes, studentsPorId]);

  async function handleExportar() {
    if (!ref.current) return;
    setExportando(true);
    try {
      // dá um instante pro React esconder os controles antes da captura
      await new Promise((r) => setTimeout(r, 50));
      await baixarReciboPdf(ref.current, `balanco-${mes}.pdf`);
    } finally {
      setExportando(false);
    }
  }

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <label className="block text-sm font-medium text-ink/70">
          Mês
          <select
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            className="mt-1 block w-full max-w-xs rounded-xl border border-amora-900/15 bg-white px-4 py-2.5 text-sm text-ink focus:border-amora-600 focus:outline-none"
          >
            {!meses.includes(mes) && <option value={mes}>{formatCompetencia(mes)}</option>}
            {meses.map((m) => (
              <option key={m} value={m}>
                {formatCompetencia(m)}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={handleExportar}
          disabled={exportando}
          className="btn-primary flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          <HiOutlineArrowDownTray className="h-4 w-4" /> {exportando ? "Gerando..." : "Baixar PDF"}
        </button>
      </div>

      <div ref={ref} className="rounded-2xl border border-amora-900/8 bg-white p-6 shadow-card">
        <div className="text-center">
          <img src="/brand/recibo-header.png" alt="Amoras" className="mx-auto h-16 w-auto" />
          <p className="mt-2 font-display text-lg font-bold text-amora-950">Balanço — {formatCompetencia(mes)}</p>
        </div>

        {doMes.length === 0 ? (
          <p className="mt-6 py-6 text-center text-sm text-ink/40">Nenhuma cobrança nesse mês.</p>
        ) : (
          <>
            <div className="mt-6 flex flex-col items-center sm:flex-row sm:justify-center">
              <DonutChart pct={pctRecebido} />
              <div className="mt-6 grid grid-cols-2 text-center sm:ml-8 sm:mt-0 sm:text-left">
                <div className="px-3 pb-4">
                  <p className="text-xs uppercase tracking-wide text-ink/40">Recebido</p>
                  <p className="font-mono text-xl font-bold text-folha">{formatBRL(recebido)}</p>
                </div>
                <div className="px-3 pb-4">
                  <p className="text-xs uppercase tracking-wide text-ink/40">Em aberto</p>
                  <p className="font-mono text-xl font-bold text-rosa-600">{formatBRL(emAberto)}</p>
                </div>
                <div className="px-3">
                  <p className="text-xs uppercase tracking-wide text-ink/40">Mensalidades</p>
                  <p className="font-mono text-base font-semibold text-amora-950">
                    {mensalidades.length} · {formatBRL(mensalidades.reduce((s, c) => s + c.valor, 0))}
                  </p>
                </div>
                <div className="px-3">
                  <p className="text-xs uppercase tracking-wide text-ink/40">Extras</p>
                  <p className="font-mono text-base font-semibold text-amora-950">
                    {extras.length} · {formatBRL(extras.reduce((s, c) => s + c.valor, 0))}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-wide text-amora-700">Por aluno</p>
              <div className="mt-3 space-y-3">
                {porAluno.map((a) => (
                  <BarraAluno key={a.studentId} nome={a.nome} valor={a.valor} total={total} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Charge, Student } from "@/lib/types";
import { statusEfetivo, STATUS_LABEL, STATUS_EMOJI } from "@/lib/charge-status";
import { formatBRL, formatDate, formatCompetencia } from "@/lib/format";
import { baixarReciboPdf, enviarReciboPdf } from "@/lib/receipt-pdf";
import ChargeForm from "@/components/admin/ChargeForm";
import DeleteButton from "@/components/admin/DeleteButton";
import { HiOutlinePlus, HiOutlineArrowDownTray, HiOutlineShare, HiOutlineClipboardDocument } from "react-icons/hi2";

function PixLine({ chavePix, ocultarAcoes }: { chavePix: string; ocultarAcoes: boolean }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    await navigator.clipboard.writeText(chavePix);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  if (ocultarAcoes) {
    return (
      <p className="mt-2 rounded-lg bg-folha/10 px-3 py-2 text-xs font-semibold text-folha">PIX: {chavePix}</p>
    );
  }

  return (
    <button
      type="button"
      onClick={copiar}
      className="mt-2 flex w-full items-center justify-between gap-2 rounded-lg bg-folha/10 px-3 py-2 text-left text-xs font-semibold text-folha"
    >
      <span className="truncate">PIX: {chavePix}</span>
      <span className="flex shrink-0 items-center gap-1">
        <HiOutlineClipboardDocument className="h-3.5 w-3.5" /> {copiado ? "Copiado!" : "Copiar"}
      </span>
    </button>
  );
}

function ParcelaRow({ charge, onEdit, ocultarAcoes }: { charge: Charge; onEdit: () => void; ocultarAcoes: boolean }) {
  const status = statusEfetivo(charge);
  return (
    <div className="border-b border-dashed border-amora-900/15 py-4 last:border-0">
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={onEdit} disabled={ocultarAcoes} className="min-w-0 flex-1 text-left">
          <p className="text-xs font-semibold uppercase leading-normal tracking-wide text-amora-700">
            {charge.competencia ? formatCompetencia(charge.competencia) : charge.descricao}
          </p>
          <p className="mt-1 text-xs leading-normal text-ink/40">Vencimento {formatDate(charge.vencimento)}</p>
        </button>
        {!ocultarAcoes && <DeleteButton url={`/api/admin/charges/${charge.id}`} confirmMessage="Excluir esta cobrança?" />}
      </div>
      <div className="mt-2 flex items-end justify-between">
        <div>
          <p className="text-[11px] text-ink/40">Valor da parcela</p>
          <p className="font-mono text-xl font-bold text-amora-950">{formatBRL(charge.valor)}</p>
        </div>
        <span className="text-xs font-semibold">{STATUS_EMOJI[status]} {STATUS_LABEL[status]}</span>
      </div>
      {charge.boleto?.chavePix && <PixLine chavePix={charge.boleto.chavePix} ocultarAcoes={ocultarAcoes} />}
    </div>
  );
}

function ExtraRow({ charge, onEdit, ocultarAcoes }: { charge: Charge; onEdit: () => void; ocultarAcoes: boolean }) {
  const status = statusEfetivo(charge);
  return (
    <div className="flex items-center justify-between gap-3 border-b border-dashed border-amora-900/10 py-3.5 last:border-0">
      <button type="button" onClick={onEdit} disabled={ocultarAcoes} className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-medium leading-normal text-ink hover:text-amora-700">{charge.descricao}</p>
        <p className="text-xs leading-normal text-ink/40">Vence {formatDate(charge.vencimento)}</p>
      </button>
      <span className="shrink-0 text-sm font-semibold text-ink">{formatBRL(charge.valor)}</span>
      <span className="shrink-0 text-xs font-semibold">{STATUS_EMOJI[status]} {STATUS_LABEL[status]}</span>
      {!ocultarAcoes && <DeleteButton url={`/api/admin/charges/${charge.id}`} confirmMessage="Excluir esta cobrança?" />}
    </div>
  );
}

export default function StudentChargesHub({ student, charges }: { student: Student; charges: Charge[] }) {
  const router = useRouter();
  const reciboRef = useRef<HTMLDivElement>(null);
  const [modo, setModo] = useState<"lista" | "nova-parcela" | "nova-extra" | string>("lista");
  const [exportando, setExportando] = useState<"baixar" | "enviar" | null>(null);

  const mensalidades = charges.filter((c) => c.categoria === "mensalidade").sort((a, b) => b.vencimento.localeCompare(a.vencimento));
  const extras = charges.filter((c) => c.categoria === "extra").sort((a, b) => b.vencimento.localeCompare(a.vencimento));
  const editando = !["lista", "nova-parcela", "nova-extra"].includes(modo) ? charges.find((c) => c.id === modo) : undefined;

  function handleSaved() {
    setModo("lista");
    router.refresh();
  }

  async function handleExportar(acao: "baixar" | "enviar") {
    if (!reciboRef.current) return;
    setExportando(acao);
    try {
      // esconde botões de editar/excluir só durante a captura, pro PDF sair limpo
      await new Promise((r) => setTimeout(r, 50));
      const nomeArquivo = `recibo-${student.nome.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      if (acao === "baixar") await baixarReciboPdf(reciboRef.current, nomeArquivo);
      else await enviarReciboPdf(reciboRef.current, nomeArquivo);
    } catch {
      // silencioso — se o compartilhamento for cancelado pelo usuário, não é um erro de verdade
    } finally {
      setExportando(null);
    }
  }

  const ocultarAcoes = exportando !== null;

  return (
    <div className="flex flex-col gap-4">
      <section ref={reciboRef} className="overflow-hidden rounded-2xl border border-amora-900/8 bg-white shadow-card">
        {/* Centralização por text-align (não flex) — o html2canvas nem
            sempre reproduz fielmente o align-items do flexbox. */}
        <div className="hero-space hero-space-gradient px-6 py-7 text-center">
          <img src="/brand/logo-badge.png" alt="Pequenas Amoras" className="mx-auto h-14 w-14 rounded-full" />
          <p className="mt-2 font-display text-base font-bold leading-normal text-white">Pequenas Amoras</p>
          <p className="mt-0.5 text-xs leading-normal text-white/60">Contraturno Escolar e Recreação Infantil</p>
          <p className="mx-auto mt-2 inline-block rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase leading-normal tracking-wide text-rosa-200">
            Recibo de mensalidade — {student.nome}
          </p>
        </div>

        <div className="px-5 py-2">
          {mensalidades.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink/40">Nenhuma parcela lançada ainda.</p>
          ) : (
            mensalidades.map((c) => (
              <ParcelaRow key={c.id} charge={c} onEdit={() => setModo(c.id)} ocultarAcoes={ocultarAcoes} />
            ))
          )}

          {extras.length > 0 && (
            <div className="mt-2 border-t border-amora-900/10 pt-3">
              <p className="text-xs font-bold uppercase leading-normal tracking-wide text-amora-700">Cobranças extras</p>
              <div className="mt-1">
                {extras.map((c) => (
                  <ExtraRow key={c.id} charge={c} onEdit={() => setModo(c.id)} ocultarAcoes={ocultarAcoes} />
                ))}
              </div>
            </div>
          )}
        </div>

        {!ocultarAcoes && (
          <div className="flex border-t border-amora-900/8">
            <button
              type="button"
              onClick={() => setModo("nova-parcela")}
              className="btn-primary flex flex-1 items-center justify-center gap-1.5 px-5 py-3 text-sm font-bold text-white"
            >
              <HiOutlinePlus className="h-4 w-4" /> Nova parcela
            </button>
            <button
              type="button"
              onClick={() => setModo("nova-extra")}
              className="flex flex-1 items-center justify-center gap-1.5 bg-amora-50 px-5 py-3 text-sm font-bold text-amora-700"
            >
              <HiOutlinePlus className="h-4 w-4" /> Cobrança extra
            </button>
          </div>
        )}
      </section>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => handleExportar("baixar")}
          disabled={exportando !== null}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-amora-900/15 px-4 py-2.5 text-sm font-semibold text-amora-700 hover:border-amora-600 disabled:opacity-60"
        >
          <HiOutlineArrowDownTray className="h-4 w-4" /> {exportando === "baixar" ? "Gerando..." : "Baixar PDF"}
        </button>
        <button
          type="button"
          onClick={() => handleExportar("enviar")}
          disabled={exportando !== null}
          className="btn-primary flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          <HiOutlineShare className="h-4 w-4" /> {exportando === "enviar" ? "Gerando..." : "Enviar"}
        </button>
      </div>

      {(modo === "nova-parcela" || modo === "nova-extra") && (
        <section className="rounded-2xl border border-amora-900/8 bg-white p-5 shadow-card">
          <ChargeForm categoria={modo === "nova-parcela" ? "mensalidade" : "extra"} students={[student]} onSaved={handleSaved} />
          <button type="button" onClick={() => setModo("lista")} className="mt-3 text-sm font-semibold text-ink/40 hover:text-ink/70">
            Cancelar
          </button>
        </section>
      )}

      {editando && (
        <section className="rounded-2xl border border-amora-900/8 bg-white p-5 shadow-card">
          <ChargeForm categoria={editando.categoria} students={[student]} charge={editando} onSaved={handleSaved} />
          <button type="button" onClick={() => setModo("lista")} className="mt-3 text-sm font-semibold text-ink/40 hover:text-ink/70">
            Cancelar
          </button>
        </section>
      )}
    </div>
  );
}

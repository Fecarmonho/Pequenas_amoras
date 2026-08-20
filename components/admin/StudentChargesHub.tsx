"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Charge, Student, TIPOS_COBRANCA_EXTRA } from "@/lib/types";
import { statusEfetivo, STATUS_LABEL, STATUS_EMOJI } from "@/lib/charge-status";
import { formatBRL, formatCompetencia } from "@/lib/format";
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

  // O card inteiro é clicável (não só o texto do mês) pra abrir a edição —
  // é uma div com role de botão, não um <button> de verdade, porque o
  // DeleteButton lá dentro já é um <button> e HTML não aceita botão dentro
  // de botão. O clique no excluir usa stopPropagation pra não abrir a edição junto.
  return (
    <div
      role={ocultarAcoes ? undefined : "button"}
      tabIndex={ocultarAcoes ? undefined : 0}
      onClick={ocultarAcoes ? undefined : onEdit}
      onKeyDown={ocultarAcoes ? undefined : (e) => e.key === "Enter" && onEdit()}
      className={`flex items-center justify-between gap-3 border-b border-dashed border-amora-900/15 py-4 last:border-0 ${ocultarAcoes ? "" : "cursor-pointer"}`}
    >
      <div className="min-w-0 flex-1 text-left">
        <p className="text-sm font-semibold uppercase leading-normal tracking-wide text-amora-700">
          Mensalidade {charge.competencia ? `— ${formatCompetencia(charge.competencia)}` : ""}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-mono text-lg font-bold text-amora-950">{formatBRL(charge.valor)}</p>
        {!ocultarAcoes && <span className="text-xs font-semibold">{STATUS_EMOJI[status]} {STATUS_LABEL[status]}</span>}
      </div>
      {!ocultarAcoes && (
        <div onClick={(e) => e.stopPropagation()}>
          <DeleteButton url={`/api/admin/charges/${charge.id}`} confirmMessage="Excluir esta cobrança?" />
        </div>
      )}
    </div>
  );
}

/** Título mostra o tipo (ex: "Diária"), não "Cobrança extra" — isso já
 * fica só no cabeçalho da seção. A descrição livre do admin vai embaixo. */
function ExtraRow({ charge, onEdit, ocultarAcoes }: { charge: Charge; onEdit: () => void; ocultarAcoes: boolean }) {
  const status = statusEfetivo(charge);
  const tipoLabel = TIPOS_COBRANCA_EXTRA.find((t) => t.value === charge.tipo)?.label ?? charge.descricao;
  return (
    <div
      role={ocultarAcoes ? undefined : "button"}
      tabIndex={ocultarAcoes ? undefined : 0}
      onClick={ocultarAcoes ? undefined : onEdit}
      onKeyDown={ocultarAcoes ? undefined : (e) => e.key === "Enter" && onEdit()}
      className={`flex items-center justify-between gap-3 border-b border-dashed border-amora-900/10 py-3.5 last:border-0 ${ocultarAcoes ? "" : "cursor-pointer"}`}
    >
      <div className="min-w-0 flex-1 text-left">
        <p className="text-sm font-semibold uppercase leading-normal tracking-wide text-amora-700">{tipoLabel}</p>
        {charge.descricao && <p className="text-xs leading-normal text-ink/40">{charge.descricao}</p>}
      </div>
      <div className="shrink-0 text-right">
        <p className="font-mono text-base font-bold text-amora-950">{formatBRL(charge.valor)}</p>
        {!ocultarAcoes && <span className="text-xs font-semibold">{STATUS_EMOJI[status]} {STATUS_LABEL[status]}</span>}
      </div>
      {!ocultarAcoes && (
        <div onClick={(e) => e.stopPropagation()}>
          <DeleteButton url={`/api/admin/charges/${charge.id}`} confirmMessage="Excluir esta cobrança?" />
        </div>
      )}
    </div>
  );
}

export default function StudentChargesHub({
  student,
  charges,
  chavePix,
}: {
  student: Student;
  charges: Charge[];
  chavePix?: string;
}) {
  const router = useRouter();
  const reciboRef = useRef<HTMLDivElement>(null);
  const [modo, setModo] = useState<"lista" | "nova-extra" | string>("lista");
  const [exportando, setExportando] = useState<"baixar" | "enviar" | null>(null);

  const mensalidades = charges.filter((c) => c.categoria === "mensalidade").sort((a, b) => b.vencimento.localeCompare(a.vencimento));
  const extras = charges.filter((c) => c.categoria === "extra").sort((a, b) => b.vencimento.localeCompare(a.vencimento));
  const editando = !["lista", "nova-extra"].includes(modo) ? charges.find((c) => c.id === modo) : undefined;
  const total = charges.reduce((soma, c) => soma + c.valor, 0);

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
      if (acao === "baixar") {
        await baixarReciboPdf(reciboRef.current, nomeArquivo);
      } else {
        const mensagem = `Recibo de mensalidade — ${student.nome} 💜 Pequenas Amoras`;
        await enviarReciboPdf(reciboRef.current, nomeArquivo, mensagem);
      }
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
        <div className="bg-white px-6 py-7 text-center">
          <img src="/brand/recibo-header.png" alt="Amoras — Recibo de mensalidade" className="mx-auto h-20 w-auto sm:h-28" />
          <div className="mt-3 flex justify-center">
            <p className="rounded-full bg-amora-100 px-3 py-1.5 text-[11px] font-bold uppercase leading-normal tracking-wide text-amora-700">
              {student.nome}
            </p>
          </div>
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

          {charges.length > 0 && (
            <div className="mt-3 flex items-center justify-between border-t border-amora-900/10 pt-3">
              <p className="text-sm font-bold uppercase leading-normal tracking-wide text-amora-950">Total</p>
              <p className="font-mono text-lg font-bold leading-normal text-amora-950">{formatBRL(total)}</p>
            </div>
          )}

          {chavePix && <PixLine chavePix={chavePix} ocultarAcoes={ocultarAcoes} />}
        </div>

        {!ocultarAcoes && (
          <div className="flex border-t border-amora-900/8">
            <button
              type="button"
              onClick={() => setModo("nova-extra")}
              className="btn-primary flex flex-1 items-center justify-center gap-1.5 px-5 py-3 text-sm font-bold text-white"
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

      {modo === "nova-extra" && (
        <section className="rounded-2xl border border-amora-900/8 bg-white p-5 shadow-card">
          <ChargeForm categoria="extra" students={[student]} onSaved={handleSaved} />
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

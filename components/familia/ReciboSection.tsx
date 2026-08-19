"use client";

import { useRef, useState } from "react";
import { Charge, Student } from "@/lib/types";
import { baixarReciboPdf, enviarReciboPdf } from "@/lib/receipt-pdf";
import { formatBRL } from "@/lib/format";
import ChargeCard from "@/components/familia/ChargeCard";
import { HiOutlineArrowDownTray, HiOutlineShare } from "react-icons/hi2";

export default function ReciboSection({
  student,
  mensalidades,
  extras,
  chavePix,
}: {
  student: Student;
  mensalidades: Charge[];
  extras: Charge[];
  chavePix?: string;
}) {
  const reciboRef = useRef<HTMLDivElement>(null);
  const [exportando, setExportando] = useState<"baixar" | "enviar" | null>(null);
  const total = [...mensalidades, ...extras].reduce((soma, c) => soma + c.valor, 0);

  async function handleExportar(acao: "baixar" | "enviar") {
    if (!reciboRef.current) return;
    setExportando(acao);
    try {
      const nomeArquivo = `recibo-${student.nome.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      if (acao === "baixar") {
        await baixarReciboPdf(reciboRef.current, nomeArquivo);
      } else {
        const mensagem = `Recibo — ${student.nome} 💜 Pequenas Amoras`;
        await enviarReciboPdf(reciboRef.current, nomeArquivo, mensagem);
      }
    } catch {
      // silencioso — cancelar o compartilhamento não é um erro de verdade
    } finally {
      setExportando(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div ref={reciboRef} className="overflow-hidden rounded-2xl border border-amora-900/8 bg-white shadow-card">
        <div className="hero-space hero-space-gradient px-6 py-7 text-center">
          <img src="/brand/recibo-header.png" alt="Amoras — Recibo de mensalidade" className="mx-auto h-14 w-auto sm:h-16" />
          <p
            className="mx-auto mt-3 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase leading-normal tracking-wide text-rosa-200"
            style={{ display: "table" }}
          >
            {student.nome}
          </p>
        </div>

        <div className="flex flex-col gap-3 p-4">
          {mensalidades.length === 0 && extras.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink/40">Nenhuma cobrança lançada ainda.</p>
          ) : (
            [...mensalidades, ...extras].map((c) => (
              <ChargeCard key={c.id} charge={c} ocultarStatus={exportando !== null} />
            ))
          )}
        </div>

        {(mensalidades.length > 0 || extras.length > 0) && (
          <div className="mx-4 mb-4 flex items-center justify-between border-t border-amora-900/10 pt-3">
            <p className="text-sm font-bold uppercase leading-normal tracking-wide text-amora-950">Total</p>
            <p className="font-mono text-lg font-bold leading-normal text-amora-950">{formatBRL(total)}</p>
          </div>
        )}

        {chavePix && (
          <p className="mx-4 mb-4 rounded-lg bg-folha/10 px-3 py-2 text-center text-xs font-semibold leading-normal text-folha">
            Chave PIX para pagamento: {chavePix}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => handleExportar("baixar")}
          disabled={exportando !== null}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-amora-900/15 px-4 py-2.5 text-sm font-semibold text-amora-700 hover:border-amora-600 disabled:opacity-60"
        >
          <HiOutlineArrowDownTray className="h-4 w-4" /> {exportando === "baixar" ? "Gerando..." : "Baixar recibo"}
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
    </div>
  );
}

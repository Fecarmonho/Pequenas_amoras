"use client";

import { useRef, useState } from "react";
import { Charge, Student } from "@/lib/types";
import { baixarReciboPdf, enviarReciboPdf } from "@/lib/receipt-pdf";
import ChargeCard from "@/components/familia/ChargeCard";
import { HiOutlineArrowDownTray, HiOutlineShare } from "react-icons/hi2";

export default function ReciboSection({
  student,
  mensalidades,
  extras,
}: {
  student: Student;
  mensalidades: Charge[];
  extras: Charge[];
}) {
  const reciboRef = useRef<HTMLDivElement>(null);
  const [exportando, setExportando] = useState<"baixar" | "enviar" | null>(null);

  async function handleExportar(acao: "baixar" | "enviar") {
    if (!reciboRef.current) return;
    setExportando(acao);
    try {
      const nomeArquivo = `recibo-${student.nome.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      if (acao === "baixar") await baixarReciboPdf(reciboRef.current, nomeArquivo);
      else await enviarReciboPdf(reciboRef.current, nomeArquivo);
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
          <img src="/brand/logo-badge.png" alt="Pequenas Amoras" className="mx-auto h-14 w-14 rounded-full" />
          <p className="mt-2 font-display text-base font-bold leading-normal text-white">Pequenas Amoras</p>
          <p className="mt-0.5 text-xs leading-normal text-white/60">Contraturno Escolar e Recreação Infantil</p>
          <p
            className="mx-auto mt-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase leading-normal tracking-wide text-rosa-200"
            style={{ display: "table" }}
          >
            Recibo — {student.nome}
          </p>
        </div>

        <div className="flex flex-col gap-3 p-4">
          {mensalidades.length === 0 && extras.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink/40">Nenhuma cobrança lançada ainda.</p>
          ) : (
            [...mensalidades, ...extras].map((c) => <ChargeCard key={c.id} charge={c} />)
          )}
        </div>
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

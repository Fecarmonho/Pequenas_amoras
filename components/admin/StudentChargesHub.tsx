"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Charge, Student } from "@/lib/types";
import { statusEfetivo, STATUS_LABEL, STATUS_EMOJI } from "@/lib/charge-status";
import { formatBRL, formatDate, formatCompetencia } from "@/lib/format";
import ChargeForm from "@/components/admin/ChargeForm";
import DeleteButton from "@/components/admin/DeleteButton";
import { HiOutlinePlus } from "react-icons/hi2";

function ParcelaRow({ charge, onEdit }: { charge: Charge; onEdit: () => void }) {
  const status = statusEfetivo(charge);
  return (
    <div className="border-b border-dashed border-amora-900/15 py-4 last:border-0">
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={onEdit} className="min-w-0 flex-1 text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-amora-700">
            {charge.competencia ? formatCompetencia(charge.competencia) : charge.descricao}
          </p>
          <p className="mt-1 text-xs text-ink/40">Vencimento {formatDate(charge.vencimento)}</p>
        </button>
        <DeleteButton url={`/api/admin/charges/${charge.id}`} confirmMessage="Excluir esta cobrança?" />
      </div>
      <div className="mt-2 flex items-end justify-between">
        <div>
          <p className="text-[11px] text-ink/40">Valor da parcela</p>
          <p className="font-mono text-xl font-bold text-amora-950">{formatBRL(charge.valor)}</p>
        </div>
        <span className="text-xs font-semibold">{STATUS_EMOJI[status]} {STATUS_LABEL[status]}</span>
      </div>
    </div>
  );
}

function ExtraRow({ charge, onEdit }: { charge: Charge; onEdit: () => void }) {
  const status = statusEfetivo(charge);
  return (
    <div className="flex items-center justify-between gap-3 border-b border-amora-900/5 py-3 last:border-0">
      <button type="button" onClick={onEdit} className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-medium text-ink hover:text-amora-700">{charge.descricao}</p>
        <p className="text-xs text-ink/40">Vence {formatDate(charge.vencimento)}</p>
      </button>
      <span className="shrink-0 text-sm font-semibold text-ink">{formatBRL(charge.valor)}</span>
      <span className="shrink-0 text-xs font-semibold">{STATUS_EMOJI[status]} {STATUS_LABEL[status]}</span>
      <DeleteButton url={`/api/admin/charges/${charge.id}`} confirmMessage="Excluir esta cobrança?" />
    </div>
  );
}

/** A "folha timbrada" da mensalidade — logo + nome da escola no topo,
 * parcelas listadas como linhas de recibo (valor em destaque). */
function ReciboMensalidade({ student, charges }: { student: Student; charges: Charge[] }) {
  const router = useRouter();
  const [modo, setModo] = useState<"lista" | "nova" | string>("lista");

  function handleSaved() {
    setModo("lista");
    router.refresh();
  }

  const editando = modo !== "lista" && modo !== "nova" ? charges.find((c) => c.id === modo) : undefined;

  return (
    <section className="overflow-hidden rounded-2xl border border-amora-900/8 bg-white shadow-card">
      <div className="hero-space hero-space-gradient flex flex-col items-center gap-2 px-6 py-6 text-center">
        <img src="/brand/logo-badge.png" alt="Pequenas Amoras" className="h-14 w-14 rounded-full" />
        <div>
          <p className="font-display text-base font-bold text-white">Pequenas Amoras</p>
          <p className="text-xs text-white/60">Contraturno Escolar e Recreação Infantil</p>
        </div>
        <p className="mt-1 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-rosa-200">
          Recibo de mensalidade — {student.nome}
        </p>
      </div>

      <div className="px-5 py-2">
        {modo === "lista" && (
          <>
            {charges.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink/40">Nenhuma parcela lançada ainda.</p>
            ) : (
              charges.map((c) => <ParcelaRow key={c.id} charge={c} onEdit={() => setModo(c.id)} />)
            )}
          </>
        )}

        {modo === "nova" && (
          <div className="py-4">
            <ChargeForm categoria="mensalidade" students={[student]} onSaved={handleSaved} />
            <button type="button" onClick={() => setModo("lista")} className="mt-3 text-sm font-semibold text-ink/40 hover:text-ink/70">
              Cancelar
            </button>
          </div>
        )}

        {editando && (
          <div className="py-4">
            <ChargeForm categoria="mensalidade" students={[student]} charge={editando} onSaved={handleSaved} />
            <button type="button" onClick={() => setModo("lista")} className="mt-3 text-sm font-semibold text-ink/40 hover:text-ink/70">
              Cancelar
            </button>
          </div>
        )}
      </div>

      {modo === "lista" && (
        <button
          type="button"
          onClick={() => setModo("nova")}
          className="btn-primary flex w-full items-center justify-center gap-1.5 px-5 py-3 text-sm font-bold text-white"
        >
          <HiOutlinePlus className="h-4 w-4" /> Nova parcela
        </button>
      )}
    </section>
  );
}

function CobrancasExtras({ student, charges }: { student: Student; charges: Charge[] }) {
  const router = useRouter();
  const [modo, setModo] = useState<"lista" | "nova" | string>("lista");

  function handleSaved() {
    setModo("lista");
    router.refresh();
  }

  const editando = modo !== "lista" && modo !== "nova" ? charges.find((c) => c.id === modo) : undefined;

  return (
    <section className="rounded-2xl border border-amora-900/8 bg-white p-5 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-bold text-amora-950">Cobranças extras</h2>
        {modo === "lista" && (
          <button
            type="button"
            onClick={() => setModo("nova")}
            className="flex items-center gap-1 text-sm font-semibold text-amora-700 hover:underline"
          >
            <HiOutlinePlus className="h-4 w-4" /> Nova
          </button>
        )}
      </div>

      {modo === "lista" && (
        <div>
          {charges.length === 0 ? (
            <p className="py-4 text-center text-sm text-ink/40">Nada lançado ainda.</p>
          ) : (
            charges.map((c) => <ExtraRow key={c.id} charge={c} onEdit={() => setModo(c.id)} />)
          )}
        </div>
      )}

      {modo === "nova" && (
        <div>
          <ChargeForm categoria="extra" students={[student]} onSaved={handleSaved} />
          <button type="button" onClick={() => setModo("lista")} className="mt-3 text-sm font-semibold text-ink/40 hover:text-ink/70">
            Cancelar
          </button>
        </div>
      )}

      {editando && (
        <div>
          <ChargeForm categoria="extra" students={[student]} charge={editando} onSaved={handleSaved} />
          <button type="button" onClick={() => setModo("lista")} className="mt-3 text-sm font-semibold text-ink/40 hover:text-ink/70">
            Cancelar
          </button>
        </div>
      )}
    </section>
  );
}

export default function StudentChargesHub({ student, charges }: { student: Student; charges: Charge[] }) {
  const mensalidades = charges.filter((c) => c.categoria === "mensalidade").sort((a, b) => b.vencimento.localeCompare(a.vencimento));
  const extras = charges.filter((c) => c.categoria === "extra").sort((a, b) => b.vencimento.localeCompare(a.vencimento));

  return (
    <div className="flex flex-col gap-6">
      <ReciboMensalidade student={student} charges={mensalidades} />
      <CobrancasExtras student={student} charges={extras} />
    </div>
  );
}

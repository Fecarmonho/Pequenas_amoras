"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Charge, Student } from "@/lib/types";
import { statusEfetivo, STATUS_LABEL, STATUS_EMOJI } from "@/lib/charge-status";
import { formatBRL, formatDate, formatCompetencia } from "@/lib/format";
import ChargeForm from "@/components/admin/ChargeForm";
import DeleteButton from "@/components/admin/DeleteButton";
import { HiOutlinePlus } from "react-icons/hi2";

function ChargeRow({ charge, onEdit }: { charge: Charge; onEdit: () => void }) {
  const status = statusEfetivo(charge);
  return (
    <div className="flex items-center justify-between gap-3 border-b border-amora-900/5 py-3 last:border-0">
      <button type="button" onClick={onEdit} className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-medium text-ink hover:text-amora-700">
          {charge.competencia ? formatCompetencia(charge.competencia) : charge.descricao}
        </p>
        <p className="text-xs text-ink/40">Vence {formatDate(charge.vencimento)}</p>
      </button>
      <span className="shrink-0 text-sm font-semibold text-ink">{formatBRL(charge.valor)}</span>
      <span className="shrink-0 text-xs font-semibold">{STATUS_EMOJI[status]} {STATUS_LABEL[status]}</span>
      <DeleteButton url={`/api/admin/charges/${charge.id}`} confirmMessage="Excluir esta cobrança?" />
    </div>
  );
}

function ChargeSection({
  titulo,
  categoria,
  student,
  charges,
}: {
  titulo: string;
  categoria: "mensalidade" | "extra";
  student: Student;
  charges: Charge[];
}) {
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
        <h2 className="font-display text-base font-bold text-amora-950">{titulo}</h2>
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
            charges.map((c) => <ChargeRow key={c.id} charge={c} onEdit={() => setModo(c.id)} />)
          )}
        </div>
      )}

      {modo === "nova" && (
        <div>
          <ChargeForm categoria={categoria} students={[student]} onSaved={handleSaved} />
          <button type="button" onClick={() => setModo("lista")} className="mt-3 text-sm font-semibold text-ink/40 hover:text-ink/70">
            Cancelar
          </button>
        </div>
      )}

      {editando && (
        <div>
          <ChargeForm categoria={categoria} students={[student]} charge={editando} onSaved={handleSaved} />
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
      <ChargeSection titulo="Mensalidades" categoria="mensalidade" student={student} charges={mensalidades} />
      <ChargeSection titulo="Cobranças extras" categoria="extra" student={student} charges={extras} />
    </div>
  );
}

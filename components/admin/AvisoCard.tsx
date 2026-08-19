"use client";

import { useRouter } from "next/navigation";
import { Aviso } from "@/lib/types";
import { formatDate } from "@/lib/format";
import DeleteButton from "@/components/admin/DeleteButton";
import { HiOutlinePencil } from "react-icons/hi2";

const DESTINATARIO_LABEL: Record<Aviso["destinatario"]["tipo"], string> = {
  todos: "Todos",
  estudante: "1 estudante",
  modalidade: "Modalidade",
};

export default function AvisoCard({ aviso, onEdit }: { aviso: Aviso; onEdit: () => void }) {
  const router = useRouter();

  async function toggleAtivo() {
    await fetch(`/api/admin/avisos/${aviso.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !aviso.ativo }),
    });
    router.refresh();
  }

  return (
    <div className="flex items-start gap-4 rounded-2xl border border-amora-900/8 bg-white p-4 shadow-card">
      {aviso.imagem && (
        <img src={aviso.imagem} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
      )}
      <div className="min-w-0 flex-1">
        <p className="font-display text-sm font-bold text-amora-950">{aviso.titulo}</p>
        <p className="mt-1 text-xs text-ink/50">{formatDate(aviso.data)} · {DESTINATARIO_LABEL[aviso.destinatario.tipo]}</p>
        <p className="mt-2 text-sm text-ink/70">{aviso.texto}</p>
        {aviso.arquivoUrl && (
          <a href={aviso.arquivoUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-semibold text-amora-700 hover:underline">
            📎 Ver anexo
          </a>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <button
          onClick={toggleAtivo}
          className={`rounded-full px-3 py-1.5 text-xs font-bold ${aviso.ativo ? "bg-folha/15 text-folha" : "bg-ink/5 text-ink/40"}`}
        >
          {aviso.ativo ? "Ativo" : "Inativo"}
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            aria-label="Editar"
            className="rounded-lg p-2 text-ink/40 transition-colors hover:bg-amora-100 hover:text-amora-700"
          >
            <HiOutlinePencil className="h-4 w-4" />
          </button>
          <DeleteButton url={`/api/admin/avisos/${aviso.id}`} confirmMessage="Excluir este aviso?" />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Aviso, Student } from "@/lib/types";
import AvisoForm from "@/components/admin/AvisoForm";
import AvisoCard from "@/components/admin/AvisoCard";

export default function AvisosManager({ avisos, students }: { avisos: Aviso[]; students: Student[] }) {
  const [editando, setEditando] = useState<Aviso | null>(null);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-amora-700">
          {editando ? "Editar aviso" : "Novo aviso"}
        </h2>
        <AvisoForm key={editando?.id ?? "novo"} students={students} aviso={editando ?? undefined} onSaved={() => setEditando(null)} />
      </div>

      <div>
        <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-amora-700">Publicados</h2>
        <div className="flex flex-col gap-3">
          {avisos.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-amora-900/15 p-6 text-center text-sm text-ink/40">
              Nenhum aviso publicado ainda.
            </p>
          ) : (
            avisos.map((a) => <AvisoCard key={a.id} aviso={a} onEdit={() => setEditando(a)} />)
          )}
        </div>
      </div>
    </div>
  );
}

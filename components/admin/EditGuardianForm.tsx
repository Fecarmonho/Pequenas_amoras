"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Guardian } from "@/lib/types";

const inputClass =
  "mt-1 w-full rounded-xl border border-amora-900/15 bg-white px-4 py-2.5 text-sm text-ink focus:border-amora-600 focus:outline-none";

export default function EditGuardianForm({ guardian }: { guardian: Guardian }) {
  const router = useRouter();
  const [nome, setNome] = useState(guardian.nome);
  const [telefone, setTelefone] = useState(guardian.telefone);
  const [whatsapp, setWhatsapp] = useState(guardian.whatsapp ?? "");
  const [parentesco, setParentesco] = useState(guardian.parentesco);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/guardians/${guardian.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, telefone, whatsapp, parentesco }),
      });
      if (!response.ok) throw new Error("Não foi possível salvar.");
      router.push("/admin/responsaveis");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-amora-900/8 bg-white p-6 shadow-card">
      <label className="block text-sm font-medium text-ink/70">
        Nome completo
        <input required value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm font-medium text-ink/70">
          Telefone
          <input value={telefone} onChange={(e) => setTelefone(e.target.value)} className={inputClass} />
        </label>
        <label className="block text-sm font-medium text-ink/70">
          WhatsApp
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={inputClass} />
        </label>
      </div>
      <label className="block text-sm font-medium text-ink/70">
        Grau de parentesco
        <input value={parentesco} onChange={(e) => setParentesco(e.target.value)} className={inputClass} />
      </label>
      <p className="text-xs text-ink/40">CPF e e-mail de login não podem ser alterados por aqui.</p>

      {error && <p className="text-sm font-medium text-rosa-600">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary mt-2 rounded-full px-6 py-3 font-display font-bold text-white disabled:opacity-60">
        {loading ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}

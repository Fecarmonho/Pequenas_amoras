"use client";

import { useState } from "react";

export default function ChavePixConfig({ chavePixInicial }: { chavePixInicial?: string }) {
  const [chavePix, setChavePix] = useState(chavePixInicial ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [erro, setErro] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setErro(false);
    try {
      const response = await fetch("/api/admin/configuracoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chavePix }),
      });
      if (!response.ok) {
        setErro(true);
        return;
      }
      setSaved(true);
    } catch {
      setErro(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2 rounded-2xl border border-amora-900/8 bg-white p-4 shadow-card sm:flex-row sm:items-end sm:gap-3">
      <label className="block flex-1 text-sm font-medium text-ink/70">
        Chave PIX (usada em todos os recibos)
        <input
          value={chavePix}
          onChange={(e) => {
            setChavePix(e.target.value);
            setSaved(false);
          }}
          placeholder="CPF, e-mail, telefone ou chave aleatória"
          className="mt-1 w-full rounded-xl border border-amora-900/15 bg-white px-4 py-2.5 text-sm text-ink focus:border-amora-600 focus:outline-none"
        />
      </label>
      <button
        type="submit"
        disabled={saving}
        className="btn-primary shrink-0 rounded-full px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
      >
        {saving ? "Salvando..." : saved ? "Salvo ✓" : "Salvar"}
      </button>
      {erro && <p className="text-sm font-medium text-rosa-600 sm:basis-full">Não foi possível salvar. Tente novamente.</p>}
    </form>
  );
}

"use client";

import { useState } from "react";
import { Configuracoes } from "@/lib/types";
import { processarFoto } from "@/lib/image-compress";

const inputClass =
  "mt-1 w-full rounded-xl border border-amora-900/15 bg-white px-4 py-2.5 text-sm text-ink focus:border-amora-600 focus:outline-none";

export default function ConfiguracoesForm({ config }: { config: Configuracoes }) {
  const [form, setForm] = useState(config);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [erro, setErro] = useState(false);
  const [processandoFoto, setProcessandoFoto] = useState(false);

  function set<K extends keyof Configuracoes>(key: K, value: Configuracoes[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setProcessandoFoto(true);
    try {
      set("fundadoraFoto", await processarFoto(file));
    } finally {
      setProcessandoFoto(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErro(false);
    try {
      const response = await fetch("/api/admin/configuracoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-amora-900/8 bg-white p-6 shadow-card">
      <label className="block text-sm font-medium text-ink/70">
        Nome da escola
        <input value={form.nomeEscola} onChange={(e) => set("nomeEscola", e.target.value)} className={inputClass} />
      </label>
      <label className="block text-sm font-medium text-ink/70">
        Slogan
        <input value={form.slogan} onChange={(e) => set("slogan", e.target.value)} className={inputClass} />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm font-medium text-ink/70">
          WhatsApp (formato 55DDNÚMERO)
          <input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} className={inputClass} placeholder="5515991182670" />
        </label>
        <label className="block text-sm font-medium text-ink/70">
          Instagram (sem @)
          <input value={form.instagram} onChange={(e) => set("instagram", e.target.value)} className={inputClass} placeholder="pequenas.amoras" />
        </label>
      </div>
      <label className="block text-sm font-medium text-ink/70">
        Endereço
        <input value={form.endereco} onChange={(e) => set("endereco", e.target.value)} className={inputClass} />
      </label>
      <label className="block text-sm font-medium text-ink/70">
        Horário de atendimento
        <input value={form.horarioAtendimento} onChange={(e) => set("horarioAtendimento", e.target.value)} className={inputClass} />
      </label>
      <label className="block text-sm font-medium text-ink/70">
        Texto institucional (seção &ldquo;Sobre&rdquo; do site)
        <textarea value={form.textoInstitucional} onChange={(e) => set("textoInstitucional", e.target.value)} rows={4} className={inputClass} />
      </label>

      <div className="rounded-xl border border-amora-900/10 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-amora-700">
          Seção &ldquo;Fundadora&rdquo; da home
        </p>
        <p className="mt-1 text-xs text-ink/40">
          Só aparece no site depois que nome e história estiverem preenchidos.
        </p>

        <label className="mt-3 block text-sm font-medium text-ink/70">
          Nome da fundadora
          <input value={form.fundadoraNome ?? ""} onChange={(e) => set("fundadoraNome", e.target.value)} className={inputClass} />
        </label>

        <div className="mt-3">
          <span className="block text-sm font-medium text-ink/70">Foto</span>
          <div className="mt-1 flex items-center gap-4">
            {form.fundadoraFoto ? (
              <img src={form.fundadoraFoto} alt="Prévia" className="h-20 w-20 rounded-full border border-ink/10 object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-ink/15 text-[10px] text-ink/30">
                Sem foto
              </div>
            )}
            <label className="cursor-pointer rounded-full border border-amora-900/15 px-4 py-2 text-sm font-semibold text-ink/70 hover:border-amora-600">
              {processandoFoto ? "Processando..." : form.fundadoraFoto ? "Trocar" : "Escolher"}
              <input type="file" accept="image/*" onChange={handleFotoChange} disabled={processandoFoto} className="hidden" />
            </label>
          </div>
        </div>

        <label className="mt-3 block text-sm font-medium text-ink/70">
          História
          <textarea
            value={form.fundadoraHistoria ?? ""}
            onChange={(e) => set("fundadoraHistoria", e.target.value)}
            rows={4}
            className={inputClass}
            placeholder="Um pouco da trajetória e da motivação por trás da Pequenas Amoras..."
          />
        </label>
      </div>

      {saved && <p className="text-sm font-medium text-folha">Salvo com sucesso ✓</p>}
      {erro && <p className="text-sm font-medium text-rosa-600">Não foi possível salvar. Tente novamente — se persistir, faça login de novo.</p>}

      <button type="submit" disabled={saving} className="btn-primary rounded-full px-6 py-3 font-display font-bold text-white disabled:opacity-60">
        {saving ? "Salvando..." : "Salvar configurações"}
      </button>
    </form>
  );
}

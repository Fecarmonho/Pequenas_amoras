"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { processarFoto } from "@/lib/image-compress";

const inputClass =
  "mt-1 w-full rounded-xl border border-amora-900/15 bg-white px-4 py-2.5 text-sm text-ink focus:border-amora-600 focus:outline-none";

export default function BannerForm() {
  const router = useRouter();
  const [imagem, setImagem] = useState<string | null>(null);
  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState("");
  const [botaoTexto, setBotaoTexto] = useState("");
  const [botaoLink, setBotaoLink] = useState("");
  const [processando, setProcessando] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImagemChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setProcessando(true);
    setError(null);
    try {
      setImagem(await processarFoto(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao processar a imagem.");
    } finally {
      setProcessando(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!imagem) {
      setError("Envie uma imagem para o slide.");
      return;
    }
    if (!titulo) {
      setError("Preencha o título do slide.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imagem,
          titulo,
          subtitulo: subtitulo || undefined,
          descricao: descricao || undefined,
          data: data || undefined,
          botaoTexto: botaoTexto || undefined,
          botaoLink: botaoLink || undefined,
        }),
      });
      if (!response.ok) throw new Error("Não foi possível salvar o aviso.");
      setImagem(null);
      setTitulo("");
      setSubtitulo("");
      setDescricao("");
      setData("");
      setBotaoTexto("");
      setBotaoLink("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-amora-900/8 bg-white p-6 shadow-card">
      <div>
        <span className="block text-sm font-medium text-ink/70">Imagem do slide</span>
        <div className="mt-1 flex items-center gap-4">
          {imagem ? (
            <img src={imagem} alt="Prévia" className="h-20 w-32 rounded-lg border border-ink/10 object-cover" />
          ) : (
            <div className="flex h-20 w-32 items-center justify-center rounded-lg border border-dashed border-ink/15 text-[10px] text-ink/30">Sem imagem</div>
          )}
          <label className="cursor-pointer rounded-full border border-amora-900/15 px-4 py-2 text-sm font-semibold text-ink/70 hover:border-amora-600">
            {processando ? "Processando..." : imagem ? "Trocar" : "Escolher"}
            <input type="file" accept="image/*" onChange={handleImagemChange} disabled={processando} className="hidden" />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-ink/70">
          Título
          <input required value={titulo} onChange={(e) => setTitulo(e.target.value)} className={inputClass} placeholder="Semana da Diversão" />
        </label>
        <label className="text-sm font-medium text-ink/70">
          Data (opcional)
          <input value={data} onChange={(e) => setData(e.target.value)} className={inputClass} placeholder="18 a 22 de agosto" />
        </label>
      </div>

      <label className="block text-sm font-medium text-ink/70">
        Subtítulo (opcional)
        <input value={subtitulo} onChange={(e) => setSubtitulo(e.target.value)} className={inputClass} />
      </label>

      <label className="block text-sm font-medium text-ink/70">
        Descrição curta (opcional)
        <input value={descricao} onChange={(e) => setDescricao(e.target.value)} className={inputClass} />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-ink/70">
          Texto do botão (opcional)
          <input value={botaoTexto} onChange={(e) => setBotaoTexto(e.target.value)} className={inputClass} placeholder="Saiba mais" />
        </label>
        <label className="text-sm font-medium text-ink/70">
          Link do botão (opcional)
          <input value={botaoLink} onChange={(e) => setBotaoLink(e.target.value)} className={inputClass} placeholder="/#atividades" />
        </label>
      </div>

      {error && <p className="text-sm font-medium text-rosa-600">{error}</p>}

      <button type="submit" disabled={saving || processando} className="btn-primary rounded-full px-6 py-3 font-display font-bold text-white disabled:opacity-60">
        {saving ? "Salvando..." : "Adicionar ao carrossel"}
      </button>
    </form>
  );
}

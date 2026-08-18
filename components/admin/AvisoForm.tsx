"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { DestinatarioTipo, MODALIDADES, Student } from "@/lib/types";
import { processarFoto } from "@/lib/image-compress";

const inputClass =
  "mt-1 w-full rounded-xl border border-amora-900/15 bg-white px-4 py-2.5 text-sm text-ink focus:border-amora-600 focus:outline-none";

export default function AvisoForm({ students }: { students: Student[] }) {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [tipo, setTipo] = useState<DestinatarioTipo>("todos");
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [modalidade, setModalidade] = useState<string>(MODALIDADES[0]);
  const [imagem, setImagem] = useState("");
  const [processandoImagem, setProcessandoImagem] = useState(false);
  const [arquivoUrl, setArquivoUrl] = useState("");
  const [enviandoArquivo, setEnviandoArquivo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImagemChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setProcessandoImagem(true);
    try {
      setImagem(await processarFoto(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao processar a imagem.");
    } finally {
      setProcessandoImagem(false);
    }
  }

  async function handleArquivoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setEnviandoArquivo(true);
    setError(null);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/admin/avisos/upload",
      });
      setArquivoUrl(blob.url);
    } catch (err) {
      setError("Não foi possível enviar o PDF. Verifique se o Vercel Blob está configurado (BLOB_READ_WRITE_TOKEN).");
    } finally {
      setEnviandoArquivo(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const destinatario =
        tipo === "estudante" ? { tipo, studentId } : tipo === "modalidade" ? { tipo, modalidade } : { tipo };

      const response = await fetch("/api/admin/avisos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo,
          texto,
          data,
          destinatario,
          imagem: imagem || undefined,
          arquivoUrl: arquivoUrl || undefined,
        }),
      });
      if (!response.ok) throw new Error("Não foi possível salvar o aviso.");
      setTitulo("");
      setTexto("");
      setImagem("");
      setArquivoUrl("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-amora-900/8 bg-white p-6 shadow-card">
      <label className="block text-sm font-medium text-ink/70">
        Título
        <input required value={titulo} onChange={(e) => setTitulo(e.target.value)} className={inputClass} />
      </label>
      <label className="block text-sm font-medium text-ink/70">
        Texto
        <textarea required value={texto} onChange={(e) => setTexto(e.target.value)} rows={3} className={inputClass} />
      </label>
      <label className="block text-sm font-medium text-ink/70">
        Data
        <input required type="date" value={data} onChange={(e) => setData(e.target.value)} className={inputClass} />
      </label>

      <div>
        <span className="block text-sm font-medium text-ink/70">Imagem (opcional)</span>
        <div className="mt-1 flex items-center gap-4">
          {imagem ? (
            <img src={imagem} alt="Prévia" className="h-16 w-16 rounded-xl border border-ink/10 object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-ink/15 text-[10px] text-ink/30">
              Sem imagem
            </div>
          )}
          <label className="cursor-pointer rounded-full border border-amora-900/15 px-4 py-2 text-sm font-semibold text-ink/70 hover:border-amora-600">
            {processandoImagem ? "Processando..." : imagem ? "Trocar" : "Escolher"}
            <input type="file" accept="image/*" onChange={handleImagemChange} disabled={processandoImagem} className="hidden" />
          </label>
        </div>
      </div>

      <label className="block text-sm font-medium text-ink/70">
        Anexar PDF (opcional)
        <input type="file" accept="application/pdf" onChange={handleArquivoChange} disabled={enviandoArquivo} className="mt-1 w-full text-sm text-ink/60" />
        {enviandoArquivo && <span className="text-xs text-amora-700">Enviando...</span>}
        {arquivoUrl && !enviandoArquivo && <p className="mt-1 truncate text-xs text-folha">✓ PDF anexado</p>}
      </label>

      <label className="block text-sm font-medium text-ink/70">
        Destinatário
        <select value={tipo} onChange={(e) => setTipo(e.target.value as DestinatarioTipo)} className={inputClass}>
          <option value="todos">Todos os responsáveis</option>
          <option value="estudante">Um estudante específico</option>
          <option value="modalidade">Uma modalidade</option>
        </select>
      </label>

      {tipo === "estudante" && (
        <label className="block text-sm font-medium text-ink/70">
          Estudante
          <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className={inputClass}>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.nome}</option>
            ))}
          </select>
        </label>
      )}

      {tipo === "modalidade" && (
        <label className="block text-sm font-medium text-ink/70">
          Modalidade
          <select value={modalidade} onChange={(e) => setModalidade(e.target.value)} className={inputClass}>
            {MODALIDADES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </label>
      )}

      {error && <p className="text-sm font-medium text-rosa-600">{error}</p>}

      <button type="submit" disabled={saving} className="btn-primary rounded-full px-6 py-3 font-display font-bold text-white disabled:opacity-60">
        {saving ? "Salvando..." : "Publicar aviso"}
      </button>
    </form>
  );
}

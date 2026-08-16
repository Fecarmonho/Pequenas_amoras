"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DestinatarioTipo, MODALIDADES, Student } from "@/lib/types";

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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        body: JSON.stringify({ titulo, texto, data, destinatario }),
      });
      if (!response.ok) throw new Error("Não foi possível salvar o aviso.");
      setTitulo("");
      setTexto("");
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

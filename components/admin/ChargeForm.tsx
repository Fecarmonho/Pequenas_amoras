"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { Charge, CategoriaCobranca, TipoCobranca, Student, TIPOS_COBRANCA_EXTRA } from "@/lib/types";
import { proximoVencimento } from "@/lib/vencimento";

const inputClass =
  "mt-1 w-full rounded-xl border border-amora-900/15 bg-white px-4 py-2.5 text-sm text-ink focus:border-amora-600 focus:outline-none";

export default function ChargeForm({
  categoria,
  students,
  charge,
  backHref,
  onSaved,
  diaVencimentoPadrao,
}: {
  categoria: CategoriaCobranca;
  students: Student[];
  charge?: Charge;
  /** Pra onde voltar depois de salvar quando o form é uma página cheia. */
  backHref?: string;
  /** Quando o form é usado embutido (ex: hub financeiro do aluno), chama
   * isso em vez de navegar. */
  onSaved?: () => void;
  /** Dia fixo de vencimento do aluno (Student.diaVencimento) — só usado
   * pra sugerir a data ao lançar uma mensalidade nova. */
  diaVencimentoPadrao?: number;
}) {
  const router = useRouter();
  const isEdit = Boolean(charge);

  const [studentId, setStudentId] = useState(charge?.studentId ?? students[0]?.id ?? "");
  const [tipo, setTipo] = useState<TipoCobranca>(charge?.tipo ?? (categoria === "mensalidade" ? "mensalidade" : "diaria"));
  const [competencia, setCompetencia] = useState(charge?.competencia ?? new Date().toISOString().slice(0, 7));
  const [descricao, setDescricao] = useState(charge?.descricao ?? (categoria === "mensalidade" ? "Mensalidade" : ""));
  const [valor, setValor] = useState(charge?.valor?.toString() ?? "");
  const [vencimento, setVencimento] = useState(
    charge?.vencimento ??
      (categoria === "mensalidade" && diaVencimentoPadrao
        ? proximoVencimento(diaVencimentoPadrao)
        : new Date().toISOString().slice(0, 10))
  );
  const [status, setStatus] = useState(charge?.status ?? "pendente");
  const [observacao, setObservacao] = useState(charge?.observacao ?? "");
  const [pdfUrl, setPdfUrl] = useState(charge?.boleto?.pdfUrl ?? "");

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/admin/charges/upload-boleto",
      });
      setPdfUrl(blob.url);
    } catch (err) {
      setError("Não foi possível enviar o PDF. Verifique se o Vercel Blob está configurado (BLOB_READ_WRITE_TOKEN).");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const boleto = pdfUrl ? { pdfUrl } : undefined;
    const payload = {
      studentId,
      categoria,
      tipo,
      competencia: categoria === "mensalidade" ? competencia : undefined,
      descricao,
      valor: Number(valor),
      vencimento,
      status,
      observacao,
      boleto,
    };

    try {
      const response = isEdit
        ? await fetch(`/api/admin/charges/${charge!.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/charges", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Não foi possível salvar.");

      if (onSaved) {
        onSaved();
      } else if (backHref) {
        router.push(backHref);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-amora-900/8 bg-white p-6 shadow-card">
      {students.length > 1 ? (
        <label className="block text-sm font-medium text-ink/70">
          Estudante
          <select required value={studentId} onChange={(e) => setStudentId(e.target.value)} className={inputClass}>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.nome}</option>
            ))}
          </select>
        </label>
      ) : (
        <input type="hidden" value={studentId} readOnly />
      )}

      {categoria === "extra" && (
        <label className="block text-sm font-medium text-ink/70">
          Tipo de cobrança
          <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoCobranca)} className={inputClass}>
            {TIPOS_COBRANCA_EXTRA.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </label>
      )}

      {categoria === "mensalidade" && (
        <label className="block text-sm font-medium text-ink/70">
          Competência
          <input type="month" required value={competencia} onChange={(e) => setCompetencia(e.target.value)} className={inputClass} />
        </label>
      )}

      <label className="block text-sm font-medium text-ink/70">
        Descrição
        <input required value={descricao} onChange={(e) => setDescricao(e.target.value)} className={inputClass} />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm font-medium text-ink/70">
          Valor (R$)
          <input required type="number" step="0.01" min="0" value={valor} onChange={(e) => setValor(e.target.value)} className={inputClass} />
        </label>
        <label className="block text-sm font-medium text-ink/70">
          Vencimento
          <input required type="date" value={vencimento} onChange={(e) => setVencimento(e.target.value)} className={inputClass} />
        </label>
      </div>

      {isEdit && (
        <label className="block text-sm font-medium text-ink/70">
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value as "pendente" | "pago")} className={inputClass}>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
          </select>
        </label>
      )}

      <label className="block text-sm font-medium text-ink/70">
        Observação (opcional)
        <textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} rows={2} className={inputClass} />
      </label>

      {categoria === "mensalidade" && (
        <div className="rounded-xl border border-amora-900/10 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-amora-700">Boleto (opcional)</p>
          <label className="mt-3 block text-sm font-medium text-ink/70">
            Anexar PDF
            <input type="file" accept="application/pdf" onChange={handleFileChange} className="mt-1 w-full text-sm text-ink/60" />
            {uploading && <span className="text-xs text-amora-700">Enviando...</span>}
            {pdfUrl && !uploading && <p className="mt-1 truncate text-xs text-folha">✓ PDF anexado</p>}
          </label>
        </div>
      )}

      {error && <p className="text-sm font-medium text-rosa-600">{error}</p>}

      <button type="submit" disabled={loading || uploading} className="btn-primary mt-2 rounded-full px-6 py-3 font-display font-bold text-white disabled:opacity-60">
        {loading ? "Salvando..." : isEdit ? "Salvar alterações" : "Lançar cobrança"}
      </button>
    </form>
  );
}

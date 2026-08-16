"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Guardian, PessoaAutorizada, Student, MODALIDADES } from "@/lib/types";
import { HiOutlineTrash, HiOutlinePlus } from "react-icons/hi2";

const inputClass =
  "mt-1 w-full rounded-xl border border-amora-900/15 bg-white px-4 py-2.5 text-sm text-ink focus:border-amora-600 focus:outline-none";

const TABS = [
  { id: "dados", label: "Dados do estudante" },
  { id: "responsaveis", label: "Responsáveis" },
  { id: "autorizados", label: "Autorizados" },
  { id: "observacoes", label: "Observações" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function StudentForm({ guardians, student }: { guardians: Guardian[]; student?: Student }) {
  const router = useRouter();
  const isEdit = Boolean(student);

  const [tab, setTab] = useState<TabId>("dados");
  const [nome, setNome] = useState(student?.nome ?? "");
  const [dataNascimento, setDataNascimento] = useState(student?.dataNascimento ?? "");
  const [cpf, setCpf] = useState(student?.cpf ?? "");
  const [dataMatricula, setDataMatricula] = useState(student?.dataMatricula ?? new Date().toISOString().slice(0, 10));
  const [modalidade, setModalidade] = useState(student?.modalidade ?? MODALIDADES[0]);
  const [status, setStatus] = useState(student?.status ?? "ativo");
  const [guardianIds, setGuardianIds] = useState<string[]>(student?.guardianIds ?? []);
  const [pessoasAutorizadas, setPessoasAutorizadas] = useState<PessoaAutorizada[]>(student?.pessoasAutorizadas ?? []);
  const [observacoes, setObservacoes] = useState(student?.observacoes ?? "");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleGuardian(id: string) {
    setGuardianIds((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
  }

  function addAutorizado() {
    setPessoasAutorizadas((prev) => [...prev, { nome: "", parentesco: "" }]);
  }

  function updateAutorizado(index: number, field: keyof PessoaAutorizada, value: string) {
    setPessoasAutorizadas((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  }

  function removeAutorizado(index: number) {
    setPessoasAutorizadas((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = { nome, dataNascimento, cpf, dataMatricula, modalidade, status, guardianIds, pessoasAutorizadas, observacoes };

    try {
      const response = isEdit
        ? await fetch(`/api/admin/students/${student!.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/students", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ student: payload }),
          });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Não foi possível salvar.");

      router.push("/admin/estudantes");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar estudante.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-amora-900/8 bg-white shadow-card">
      <div className="flex gap-1 overflow-x-auto border-b border-amora-900/8 px-3 pt-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === t.id ? "border-b-2 border-amora-700 text-amora-700" : "text-ink/40 hover:text-ink/70"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {tab === "dados" && (
          <div className="flex flex-col gap-4">
            <label className="block text-sm font-medium text-ink/70">
              Nome completo
              <input required value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm font-medium text-ink/70">
                Data de nascimento
                <input required type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} className={inputClass} />
              </label>
              <label className="block text-sm font-medium text-ink/70">
                CPF (opcional)
                <input value={cpf} onChange={(e) => setCpf(e.target.value)} className={inputClass} />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm font-medium text-ink/70">
                Data de matrícula
                <input required type="date" value={dataMatricula} onChange={(e) => setDataMatricula(e.target.value)} className={inputClass} />
              </label>
              <label className="block text-sm font-medium text-ink/70">
                Modalidade
                <select value={modalidade} onChange={(e) => setModalidade(e.target.value)} className={inputClass}>
                  {MODALIDADES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </label>
            </div>
            {isEdit && (
              <label className="block text-sm font-medium text-ink/70">
                Status
                <select value={status} onChange={(e) => setStatus(e.target.value as "ativo" | "inativo")} className={inputClass}>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </label>
            )}
          </div>
        )}

        {tab === "responsaveis" && (
          <div>
            <p className="mb-3 text-sm text-ink/50">Selecione os responsáveis vinculados a este estudante.</p>
            {guardians.length === 0 ? (
              <p className="rounded-xl border border-dashed border-amora-900/15 p-4 text-center text-sm text-ink/40">
                Nenhum responsável cadastrado ainda. Cadastre em &ldquo;Responsáveis&rdquo; primeiro.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {guardians.map((g) => (
                  <label key={g.id} className="flex items-center gap-3 rounded-xl border border-amora-900/10 px-4 py-3 text-sm">
                    <input type="checkbox" checked={guardianIds.includes(g.id)} onChange={() => toggleGuardian(g.id)} className="h-4 w-4 accent-amora-700" />
                    <span className="font-medium text-ink">{g.nome}</span>
                    <span className="text-ink/40">{g.parentesco} · {g.email}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "autorizados" && (
          <div>
            <p className="mb-3 text-sm text-ink/50">Pessoas autorizadas a buscar o estudante, além dos responsáveis.</p>
            <div className="flex flex-col gap-3">
              {pessoasAutorizadas.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={p.nome}
                    onChange={(e) => updateAutorizado(i, "nome", e.target.value)}
                    placeholder="Nome"
                    className={inputClass}
                  />
                  <input
                    value={p.parentesco}
                    onChange={(e) => updateAutorizado(i, "parentesco", e.target.value)}
                    placeholder="Parentesco"
                    className={inputClass}
                  />
                  <button type="button" onClick={() => removeAutorizado(i)} className="shrink-0 rounded-lg p-2 text-ink/40 hover:bg-rosa-100 hover:text-rosa-600">
                    <HiOutlineTrash className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addAutorizado}
              className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-amora-700 hover:underline"
            >
              <HiOutlinePlus className="h-4 w-4" /> Adicionar pessoa autorizada
            </button>
          </div>
        )}

        {tab === "observacoes" && (
          <label className="block text-sm font-medium text-ink/70">
            Observações e informações administrativas
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={6}
              className={inputClass}
            />
          </label>
        )}

        {error && <p className="mt-4 text-sm font-medium text-rosa-600">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary mt-6 rounded-full px-6 py-3 font-display font-bold text-white disabled:opacity-60">
          {loading ? "Salvando..." : isEdit ? "Salvar alterações" : "Cadastrar estudante"}
        </button>
      </div>
    </form>
  );
}

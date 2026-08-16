"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { maskCpf } from "@/lib/cpf";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-ink/70">
      {label}
      {children}
    </label>
  );
}

const inputClass =
  "mt-1 w-full rounded-xl border border-amora-900/15 bg-white px-4 py-2.5 text-sm text-ink focus:border-amora-600 focus:outline-none";

export default function NovoResponsavelPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [parentesco, setParentesco] = useState("");
  const [senhaProvisoria, setSenhaProvisoria] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [criado, setCriado] = useState<{ email: string; senha: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/admin/guardians", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, cpf, telefone, whatsapp, email, parentesco, senhaProvisoria }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Não foi possível criar o responsável.");
      setCriado({ email, senha: senhaProvisoria });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar responsável.");
    } finally {
      setLoading(false);
    }
  }

  if (criado) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-amora-900/8 bg-white p-6 text-center shadow-card">
        <p className="text-3xl">🎉</p>
        <h1 className="mt-3 font-display text-xl font-bold text-amora-950">Responsável cadastrado!</h1>
        <p className="mt-2 text-sm text-ink/60">
          Repasse esses dados de acesso para a família (por WhatsApp, por exemplo):
        </p>
        <div className="mt-4 rounded-xl bg-amora-50 p-4 text-left text-sm">
          <p><strong>Login:</strong> {criado.email}</p>
          <p><strong>Senha provisória:</strong> {criado.senha}</p>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => router.push("/admin/responsaveis")}
            className="btn-primary rounded-full px-5 py-2.5 text-sm font-bold text-white"
          >
            Voltar para responsáveis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 font-display text-2xl font-bold text-amora-950">Novo responsável</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-amora-900/8 bg-white p-6 shadow-card">
        <Field label="Nome completo">
          <input required value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="CPF">
            <input required value={cpf} onChange={(e) => setCpf(maskCpf(e.target.value))} className={inputClass} placeholder="000.000.000-00" />
          </Field>
          <Field label="Grau de parentesco">
            <input required value={parentesco} onChange={(e) => setParentesco(e.target.value)} className={inputClass} placeholder="Mãe, pai, avó..." />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Telefone">
            <input required value={telefone} onChange={(e) => setTelefone(e.target.value)} className={inputClass} placeholder="(15) 90000-0000" />
          </Field>
          <Field label="WhatsApp">
            <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={inputClass} placeholder="(15) 90000-0000" />
          </Field>
        </div>
        <Field label="E-mail (login de acesso)">
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Senha provisória (repassar pra família depois)">
          <input required value={senhaProvisoria} onChange={(e) => setSenhaProvisoria(e.target.value)} className={inputClass} />
        </Field>

        {error && <p className="text-sm font-medium text-rosa-600">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary mt-2 rounded-full px-6 py-3 font-display font-bold text-white disabled:opacity-60">
          {loading ? "Salvando..." : "Cadastrar responsável"}
        </button>
      </form>
    </div>
  );
}

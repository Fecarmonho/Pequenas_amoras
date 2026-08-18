"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Admin } from "@/lib/types";
import { HiOutlineTrash, HiOutlineClipboardDocument } from "react-icons/hi2";

const inputClass =
  "mt-1 w-full rounded-xl border border-amora-900/15 bg-white px-4 py-2.5 text-sm text-ink focus:border-amora-600 focus:outline-none";

function TelaLinkGerado({ email, link, onVoltar }: { email: string; link: string; onVoltar: () => void }) {
  const [copiado, setCopiado] = useState(false);

  async function copiarLink() {
    await navigator.clipboard.writeText(link);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-amora-900/8 bg-white p-6 text-center shadow-card">
      <p className="text-3xl">🎉</p>
      <h2 className="mt-3 font-display text-xl font-bold text-amora-950">Acesso criado!</h2>
      <p className="mt-2 text-sm text-ink/60">
        A pessoa usa esse login e cria a própria senha ao abrir o link — repasse por onde for mais fácil (e-mail, WhatsApp, pessoalmente):
      </p>
      <div className="mt-4 rounded-xl bg-amora-50 p-4 text-left text-sm">
        <p><strong>Login:</strong> {email}</p>
      </div>
      <button
        type="button"
        onClick={copiarLink}
        className="btn-primary mt-4 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white"
      >
        <HiOutlineClipboardDocument className="h-4 w-4" /> {copiado ? "Link copiado!" : "Copiar link"}
      </button>
      <button onClick={onVoltar} className="mt-5 text-sm font-semibold text-ink/40 hover:text-ink/70">
        Voltar
      </button>
    </div>
  );
}

export default function AdminUsersManager({ admins, currentUid }: { admins: Admin[]; currentUid: string }) {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState<string | null>(null);
  const [linkGerado, setLinkGerado] = useState<{ email: string; link: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Não foi possível criar o acesso.");
      setNome("");
      setEmail("");
      setLinkGerado({ email: data.email, link: data.link });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar o acesso.");
    } finally {
      setLoading(false);
    }
  }

  async function handleExcluir(uid: string) {
    if (!confirm("Excluir o acesso dessa pessoa ao painel?")) return;
    setExcluindo(uid);
    try {
      const response = await fetch(`/api/admin/admins/${uid}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Não foi possível excluir.");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao excluir.");
    } finally {
      setExcluindo(null);
    }
  }

  if (linkGerado) {
    return <TelaLinkGerado email={linkGerado.email} link={linkGerado.link} onVoltar={() => setLinkGerado(null)} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-amora-900/8 bg-white shadow-card">
        <ul className="divide-y divide-amora-900/5">
          {admins.map((a) => (
            <li key={a.uid} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">
                  {a.nome} {a.uid === currentUid && <span className="text-xs font-normal text-ink/40">(você)</span>}
                </p>
                <p className="truncate text-xs text-ink/40">{a.email}</p>
              </div>
              {a.uid !== currentUid && admins.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleExcluir(a.uid)}
                  disabled={excluindo !== null}
                  aria-label="Excluir"
                  className="shrink-0 rounded-lg p-2 text-ink/40 transition-colors hover:bg-rosa-100 hover:text-rosa-600 disabled:opacity-50"
                >
                  <HiOutlineTrash className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
          {admins.length === 0 && (
            <li className="p-4 text-sm text-ink/40">Nenhum usuário cadastrado ainda.</li>
          )}
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-amora-900/8 bg-white p-6 shadow-card">
        <p className="text-sm font-bold uppercase tracking-wide text-amora-700">Adicionar usuário</p>
        <label className="block text-sm font-medium text-ink/70">
          Nome
          <input required value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} />
        </label>
        <label className="block text-sm font-medium text-ink/70">
          E-mail
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </label>

        {error && <p className="text-sm font-medium text-rosa-600">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary rounded-full px-6 py-3 font-display font-bold text-white disabled:opacity-60">
          {loading ? "Criando..." : "Criar acesso"}
        </button>
      </form>
    </div>
  );
}

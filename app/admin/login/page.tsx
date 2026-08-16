"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase-client";

export default function AdminLoginPage() {
  const router = useRouter();

  // null = ainda checando; true = já existe admin (login normal);
  // false = ninguém cadastrado ainda (mostra tela de criar conta principal).
  const [hasAdmins, setHasAdmins] = useState<boolean | null>(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/bootstrap")
      .then((r) => r.json())
      .then((data) => setHasAdmins(Boolean(data.hasAdmins)))
      .catch(() => setHasAdmins(true));
  }, []);

  async function loginWithFirebase() {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await credential.user.getIdToken();

    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!response.ok) throw new Error("Não foi possível criar a sessão.");

    router.push("/admin");
    router.refresh();
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginWithFirebase();
    } catch (err) {
      setError("Email ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBootstrap(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não são iguais.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Não foi possível criar a conta.");

      await loginWithFirebase();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar a conta.");
    } finally {
      setLoading(false);
    }
  }

  if (hasAdmins === null) {
    return (
      <main className="hero-space hero-space-gradient flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-white/40">Carregando...</p>
      </main>
    );
  }

  const isBootstrap = !hasAdmins;

  return (
    <main className="hero-space hero-space-gradient starfield flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={isBootstrap ? handleBootstrap : handleLogin}
        className="w-full max-w-sm rounded-3xl border border-white/10 bg-amora-950/60 p-8 shadow-glow backdrop-blur-sm"
      >
        <div className="mb-2 flex justify-center">
          <img src="/brand/logo-badge.png" alt="Pequenas Amoras" className="h-16 w-16 rounded-full" />
        </div>
        <h1 className="text-center font-display text-2xl font-bold text-white">
          Painel <span className="text-rosa-300">Pequenas Amoras</span>
        </h1>
        <p className="mt-1 text-center text-sm text-white/50">
          {isBootstrap
            ? "Primeiro acesso — crie a conta principal do painel."
            : "Entre com seu email e senha."}
        </p>

        {isBootstrap && (
          <label className="mt-6 block text-sm font-medium text-white/80">
            Seu nome
            <input
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white focus:border-rosa-300 focus:outline-none"
              autoComplete="name"
            />
          </label>
        )}

        <label className={`block text-sm font-medium text-white/80 ${isBootstrap ? "mt-4" : "mt-6"}`}>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white focus:border-rosa-300 focus:outline-none"
            autoComplete="email"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-white/80">
          Senha
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white focus:border-rosa-300 focus:outline-none"
            autoComplete={isBootstrap ? "new-password" : "current-password"}
          />
        </label>

        {isBootstrap && (
          <label className="mt-4 block text-sm font-medium text-white/80">
            Confirmar senha
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white focus:border-rosa-300 focus:outline-none"
              autoComplete="new-password"
            />
          </label>
        )}

        {error && <p className="mt-4 text-sm font-medium text-rosa-300">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary mt-6 w-full rounded-full px-6 py-3.5 font-display font-bold text-white disabled:opacity-60"
        >
          {loading ? "Aguarde..." : isBootstrap ? "Criar conta e entrar" : "Entrar"}
        </button>
      </form>
    </main>
  );
}

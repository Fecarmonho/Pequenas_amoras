"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase-client";
import FloatingStars from "@/components/decor/FloatingStars";

export default function FamilyLoginPage() {
  const router = useRouter();
  const [identificador, setIdentificador] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  async function resolverEmail(): Promise<string> {
    const response = await fetch("/api/familia/resolver-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identificador }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Não encontramos um cadastro com esses dados.");
    return data.email as string;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const email = await resolverEmail();
      const credential = await signInWithEmailAndPassword(auth, email, senha);
      const idToken = await credential.user.getIdToken();

      const response = await fetch("/api/familia/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!response.ok) throw new Error("Não foi possível entrar. Tente novamente.");

      router.push("/familia");
      router.refresh();
    } catch (err) {
      setError("CPF/e-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setError(null);
    setInfo(null);
    if (!identificador) {
      setError("Digite seu CPF ou e-mail acima antes de pedir a redefinição.");
      return;
    }
    setResetLoading(true);
    try {
      const email = await resolverEmail();
      await sendPasswordResetEmail(auth, email);
    } catch {
      // Mensagem genérica de propósito — não revela se o cadastro existe.
    } finally {
      setResetLoading(false);
      setInfo("Se encontrarmos esse cadastro, enviamos um link de redefinição de senha por e-mail.");
    }
  }

  return (
    <main className="hero-space hero-space-gradient starfield relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <FloatingStars count={5} />

      <form
        onSubmit={handleLogin}
        className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-amora-950/60 p-8 shadow-glow backdrop-blur-sm"
      >
        <div className="mb-2 flex justify-center">
          <img src="/brand/logo-badge.png" alt="Pequenas Amoras" className="h-16 w-16 rounded-full" />
        </div>
        <h1 className="text-center font-display text-2xl font-bold text-white">
          Área da <span className="text-rosa-300">Família</span>
        </h1>
        <p className="mt-1 text-center text-sm text-white/60">Acompanhe tudo sobre seu filho, num só lugar.</p>

        <label className="mt-6 block text-sm font-medium text-white/80">
          CPF ou e-mail
          <input
            required
            value={identificador}
            onChange={(e) => setIdentificador(e.target.value)}
            placeholder="000.000.000-00 ou email@exemplo.com"
            className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/30 focus:border-rosa-300 focus:outline-none"
            autoComplete="username"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-white/80">
          Senha
          <input
            type="password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white focus:border-rosa-300 focus:outline-none"
            autoComplete="current-password"
          />
        </label>

        {error && <p className="mt-4 text-sm font-medium text-rosa-300">{error}</p>}
        {info && <p className="mt-4 text-sm font-medium text-dourado">{info}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary mt-6 w-full rounded-full px-6 py-3.5 font-display font-bold text-white disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <button
          type="button"
          onClick={handleForgotPassword}
          disabled={resetLoading}
          className="mt-4 w-full text-center text-sm font-semibold text-white/60 underline-offset-2 hover:text-white hover:underline disabled:opacity-60"
        >
          {resetLoading ? "Enviando..." : "Esqueci minha senha"}
        </button>
      </form>
    </main>
  );
}

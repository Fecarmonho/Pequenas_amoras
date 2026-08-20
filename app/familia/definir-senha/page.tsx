"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { auth } from "@/lib/firebase-client";
import FloatingStars from "@/components/decor/FloatingStars";

export default function DefinirSenhaPage() {
  return (
    <Suspense fallback={null}>
      <DefinirSenhaForm />
    </Suspense>
  );
}

function DefinirSenhaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  const [email, setEmail] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(true);
  const [erroLink, setErroLink] = useState<string | null>(null);

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    // Depois de já ter dado certo, ignora qualquer mudança na URL — o
    // redirecionamento automático pro login (alguns segundos depois de
    // criar a senha) muda a URL da página, e sem essa checagem esse
    // mesmo efeito rodava de novo vendo a URL nova (sem oobCode) e
    // mostrava "link inválido" por engano, mesmo já tendo funcionado.
    if (sucesso) return;

    if (!oobCode) {
      setErroLink("Link inválido — falta um código.");
      setVerificando(false);
      return;
    }
    verifyPasswordResetCode(auth, oobCode)
      .then((emailVerificado) => setEmail(emailVerificado))
      .catch(() => setErroLink("Esse link expirou ou já foi usado. Peça um novo pra escola."))
      .finally(() => setVerificando(false));
  }, [oobCode, sucesso]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (senha.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmarSenha) {
      setError("As senhas não são iguais.");
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode!, senha);
      setSucesso(true);
      setTimeout(() => router.push("/familia/login"), 2500);
    } catch (err) {
      setError("Não foi possível salvar a senha. Tenta pedir um novo link pra escola.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="hero-space hero-space-gradient starfield relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <FloatingStars count={5} />

      <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-amora-950/60 p-8 shadow-glow backdrop-blur-sm">
        <div className="mb-2 flex justify-center">
          <img src="/brand/logo-badge.png" alt="Pequenas Amoras" className="h-16 w-16 rounded-full" />
        </div>
        <h1 className="text-center font-display text-2xl font-bold text-white">
          Criar <span className="text-rosa-300">senha</span>
        </h1>

        {verificando && <p className="mt-6 text-center text-sm text-white/50">Verificando o link...</p>}

        {!verificando && erroLink && !sucesso && (
          <p className="mt-6 text-center text-sm font-medium text-rosa-300">{erroLink}</p>
        )}

        {!verificando && email && !sucesso && (
          <form onSubmit={handleSubmit}>
            <p className="mt-1 text-center text-sm text-white/60">Definindo a senha de acesso pra {email}</p>

            <label className="mt-6 block text-sm font-medium text-white/80">
              Nova senha
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white focus:border-rosa-300 focus:outline-none"
                autoComplete="new-password"
              />
            </label>
            <label className="mt-4 block text-sm font-medium text-white/80">
              Confirmar senha
              <input
                type="password"
                required
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white focus:border-rosa-300 focus:outline-none"
                autoComplete="new-password"
              />
            </label>

            {error && <p className="mt-4 text-sm font-medium text-rosa-300">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-6 w-full rounded-full px-6 py-3.5 font-display font-bold text-white disabled:opacity-60"
            >
              {loading ? "Salvando..." : "Criar senha e entrar"}
            </button>
          </form>
        )}

        {sucesso && (
          <div className="mt-6 text-center">
            <p className="text-3xl">🎉</p>
            <p className="mt-2 text-sm text-white/70">Senha criada! Te levando pro login...</p>
          </div>
        )}
      </div>
    </main>
  );
}

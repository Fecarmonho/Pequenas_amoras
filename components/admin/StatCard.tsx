"use client";

import { usePrivacy } from "./PrivacyContext";

const CORES = {
  roxo: "from-amora-700 to-amora-500",
  rosa: "from-rosa-600 to-rosa-400",
  verde: "from-folha to-emerald-400",
  dourado: "from-amber-500 to-dourado",
  vermelho: "from-red-500 to-rosa-500",
} as const;

export default function StatCard({
  label,
  value,
  hint,
  cor,
  sensivel,
}: {
  label: string;
  value: string | number;
  hint?: string;
  cor: keyof typeof CORES;
  /** Marca esse valor como financeiro/sensível — some borrado enquanto o
   * olho de privacidade do painel estiver fechado. */
  sensivel?: boolean;
}) {
  const { oculto } = usePrivacy();
  const escondendo = sensivel && oculto;

  return (
    <div className={`flex h-full flex-col justify-center rounded-2xl bg-gradient-to-br ${CORES[cor]} p-5 text-white shadow-card`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-white/70">{label}</p>
      <p className={`mt-2 font-display text-2xl font-bold sm:text-3xl ${escondendo ? "select-none blur-sm" : ""}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-white/70">{hint}</p>}
    </div>
  );
}

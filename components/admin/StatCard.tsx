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
}: {
  label: string;
  value: string | number;
  hint?: string;
  cor: keyof typeof CORES;
}) {
  return (
    <div className={`flex h-full flex-col justify-center rounded-2xl bg-gradient-to-br ${CORES[cor]} p-5 text-white shadow-card`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-white/70">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold sm:text-3xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-white/70">{hint}</p>}
    </div>
  );
}

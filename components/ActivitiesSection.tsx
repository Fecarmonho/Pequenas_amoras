const ATIVIDADES = [
  { emoji: "🤸", titulo: "Recreação" },
  { emoji: "🧩", titulo: "Brincadeiras" },
  { emoji: "✏️", titulo: "Atividades educativas" },
  { emoji: "🖌️", titulo: "Arte" },
  { emoji: "🎲", titulo: "Jogos" },
  { emoji: "📖", titulo: "Momentos de leitura" },
  { emoji: "🎉", titulo: "Atividades especiais" },
  { emoji: "🤝", titulo: "Dinâmicas em grupo" },
];

export default function ActivitiesSection() {
  return (
    <section id="atividades" className="hero-space-gradient relative overflow-hidden py-16 sm:py-20">
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="badge-soft bg-white/10 text-rosa-200">O que rola por aqui</span>
          <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
            Um dia na Pequenas Amoras é uma aventura completa
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {ATIVIDADES.map((a, i) => (
            <div
              key={a.titulo}
              className="animate-fade-up rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur-sm transition-colors hover:bg-white/10"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="text-3xl">{a.emoji}</span>
              <p className="mt-3 font-display text-sm font-semibold text-white">{a.titulo}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

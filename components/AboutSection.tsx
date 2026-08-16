const DIFERENCIAIS = [
  { emoji: "🎨", titulo: "Atividades criativas", texto: "Arte, oficinas e brincadeiras que estimulam a imaginação." },
  { emoji: "🚀", titulo: "Diversão e aventura", texto: "Cada dia é uma nova descoberta, cheia de energia boa." },
  { emoji: "📚", titulo: "Apoio no contraturno", texto: "Acompanhamento nas tarefas e rotina escolar organizada." },
  { emoji: "❤️", titulo: "Ambiente acolhedor", texto: "Carinho, atenção individual e muita segurança no dia a dia." },
  { emoji: "🌟", titulo: "Desenvolvimento infantil", texto: "Atividades pensadas pra cada fase do crescimento." },
];

export default function AboutSection() {
  return (
    <section id="sobre" className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <span className="badge-soft">Quem somos</span>
        <h2 className="mt-4 font-display text-3xl font-bold text-amora-950 sm:text-4xl">
          Um espaço pensado para o seu filho crescer com alegria
        </h2>
        <p className="mt-4 text-base leading-relaxed text-ink/60 sm:text-lg">
          A Pequenas Amoras é uma escola de contraturno escolar e recreação infantil dedicada a
          oferecer um ambiente seguro, acolhedor e divertido. Enquanto os pais trabalham, os
          pequenos brincam, aprendem e se desenvolvem com o apoio de uma equipe atenta a cada
          detalhe.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {DIFERENCIAIS.map((d, i) => (
          <div
            key={d.titulo}
            className="card-soft animate-fade-up p-6 text-center"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <span className="text-3xl">{d.emoji}</span>
            <h3 className="mt-3 font-display text-sm font-bold text-amora-950">{d.titulo}</h3>
            <p className="mt-2 text-xs leading-relaxed text-ink/55">{d.texto}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

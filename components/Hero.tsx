import Link from "next/link";
import FloatingStars from "@/components/decor/FloatingStars";

export default function Hero() {
  return (
    <section className="hero-space hero-space-gradient starfield relative overflow-hidden">
      <FloatingStars count={6} />

      <div className="relative mx-auto grid max-w-6xl items-center gap-6 px-4 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:py-28">
        <div className="relative mx-auto w-48 sm:w-64 lg:order-2 lg:w-full lg:max-w-sm">
          <div className="absolute inset-0 -z-10 rounded-full bg-rosa-500/20 blur-3xl" aria-hidden="true" />
          <img
            src="/brand/logo-badge.png"
            alt="Astronautas da Pequenas Amoras flutuando entre estrelas"
            className="w-full animate-float-slow drop-shadow-[0_30px_60px_rgba(93,38,163,0.55)]"
          />
        </div>

        <div className="text-center lg:order-1 lg:text-left">
          <span className="badge-soft bg-white/10 text-rosa-200">
            🚀 Contraturno escolar e recreação infantil
          </span>

          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-6xl">
            Onde brincar, aprender e crescer fazem parte da{" "}
            <span className="bg-gradient-to-r from-rosa-300 to-dourado bg-clip-text text-transparent">
              mesma aventura
            </span>
            .
          </h1>

          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/70 sm:text-lg lg:mx-0">
            Na Pequenas Amoras, seu filho tem um espaço acolhedor para o contraturno escolar,
            cheio de recreação, atividades e muito carinho — com toda a segurança e organização
            que a sua família merece.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link href="/#sobre" className="btn-primary shine w-full rounded-full px-7 py-3.5 text-center font-display font-bold text-white sm:w-auto">
              Conheça a Pequenas Amoras
            </Link>
            <Link href="/familia/login" className="btn-outline w-full rounded-full px-7 py-3.5 text-center font-display font-bold sm:w-auto">
              Área da Família
            </Link>
          </div>
        </div>
      </div>

      {/* transição suave pro branco da próxima seção */}
      <div className="h-16 bg-gradient-to-b from-transparent to-paper sm:h-24" aria-hidden="true" />
    </section>
  );
}

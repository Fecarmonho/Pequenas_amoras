import Link from "next/link";
import FloatingStars from "@/components/decor/FloatingStars";

export default function Hero() {
  return (
    <section className="hero-space hero-space-gradient starfield relative overflow-hidden">
      <FloatingStars count={6} />

      <div className="relative mx-auto grid max-w-6xl items-center gap-2 px-4 py-6 sm:gap-6 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:py-28">
        <div className="relative mx-auto w-56 sm:w-80 lg:order-2 lg:w-full lg:max-w-md">
          <div className="absolute inset-0 -z-10 rounded-full bg-rosa-500/20 blur-3xl" aria-hidden="true" />
          {/* Badge menor que o container (não ocupa a largura toda) pra
              sobrar espaço nas bordas — assim os astronautas ficam ao lado,
              sem serem tampados por ele. */}
          <img
            src="/brand/logo-badge.png"
            alt="Astronautas da Pequenas Amoras flutuando entre estrelas"
            className="relative mx-auto w-3/4 animate-float-slow drop-shadow-[0_30px_60px_rgba(93,38,163,0.55)]"
          />
          <img
            src="/brand/astronautas-voando.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -right-2 -top-2 w-24 animate-float-slower opacity-90 drop-shadow-[0_20px_40px_rgba(93,38,163,0.5)] sm:-right-4 sm:top-0 sm:w-36 lg:w-44"
          />
        </div>

        <div className="text-center lg:order-1 lg:text-left">
          <span className="badge-soft hidden bg-white/10 text-rosa-200 sm:inline-flex">
            🚀 Contraturno escolar e recreação infantil
          </span>

          <h1 className="mt-1 font-display text-2xl font-bold leading-[1.15] text-white sm:mt-5 sm:text-5xl lg:text-6xl">
            Onde brincar, aprender e crescer fazem parte da{" "}
            <span className="bg-gradient-to-r from-rosa-300 to-dourado bg-clip-text text-transparent">
              mesma aventura
            </span>
            .
          </h1>

          <p className="mx-auto mt-2 hidden max-w-lg text-sm leading-relaxed text-white/70 sm:mt-5 sm:block sm:text-lg lg:mx-0">
            Na Pequenas Amoras, seu filho tem um espaço acolhedor para o contraturno escolar,
            cheio de recreação, atividades e muito carinho — com toda a segurança e organização
            que a sua família merece.
          </p>

          <div className="mt-3 flex flex-col items-center gap-2 sm:mt-8 sm:flex-row sm:justify-center sm:gap-3 lg:justify-start">
            <Link href="/#sobre" className="btn-primary shine w-full rounded-full px-7 py-2.5 text-center font-display font-bold text-white sm:w-auto sm:py-3.5">
              Conheça a Pequenas Amoras
            </Link>
            <Link href="/familia/login" className="btn-outline w-full rounded-full px-7 py-2.5 text-center font-display font-bold sm:w-auto sm:py-3.5">
              Área da Família
            </Link>
          </div>
        </div>
      </div>

      {/* transição suave pro branco da próxima seção */}
      <div className="h-1 bg-gradient-to-b from-transparent to-paper sm:h-24" aria-hidden="true" />
    </section>
  );
}

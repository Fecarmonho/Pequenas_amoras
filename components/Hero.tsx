import Link from "next/link";
import FloatingStars from "@/components/decor/FloatingStars";

export default function Hero() {
  return (
    <section className="hero-space hero-space-gradient starfield relative overflow-hidden">
      <FloatingStars count={6} />

      <div className="relative mx-auto grid max-w-6xl items-center gap-2 px-4 pb-6 pt-4 sm:gap-6 sm:pb-20 sm:pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:pb-24 lg:pt-14">
        <div className="relative mx-auto w-44 sm:w-64 lg:order-2 lg:w-full lg:max-w-sm">
          <div className="absolute inset-0 -z-10 rounded-full bg-rosa-500/20 blur-3xl" aria-hidden="true" />
          <img
            src="/brand/logo-badge.png"
            alt="Astronautas da Pequenas Amoras flutuando entre estrelas"
            className="w-full animate-float-slow drop-shadow-[0_30px_60px_rgba(93,38,163,0.55)]"
          />
          {/* left-full / right-full: começam exatamente na borda do badge,
              então nunca sobrepõem ele, não importa o tamanho da tela —
              sem precisar mexer no tamanho/posição do badge em si. Um de
              cada lado (o da esquerda espelhado, "vindo" na direção do
              badge), e cada um flutua num sentido — um sobe, outro desce. */}
          <img
            src="/brand/astronautas-voando.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute left-full top-1/2 ml-1 w-14 -translate-y-1/2 animate-float-down opacity-90 drop-shadow-[0_20px_40px_rgba(93,38,163,0.5)] sm:ml-3 sm:w-24 lg:ml-4 lg:w-32"
          />
          <img
            src="/brand/astronautas-voando.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute right-full top-1/2 mr-1 w-14 -translate-y-1/2 scale-x-[-1] animate-float-slow opacity-90 drop-shadow-[0_20px_40px_rgba(93,38,163,0.5)] sm:mr-3 sm:w-24 lg:mr-4 lg:w-32"
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

          <div className="mt-6 flex flex-col items-center gap-2 sm:mt-8 sm:flex-row sm:justify-center sm:gap-3 lg:justify-start">
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

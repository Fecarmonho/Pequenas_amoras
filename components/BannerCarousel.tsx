"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

export interface CarouselSlide {
  id: string;
  titulo: string;
  subtitulo?: string;
  descricao?: string;
  data?: string;
  imagem: string;
  botaoTexto?: string;
  botaoLink?: string;
}

/** Carrossel de avisos/novidades da home — gerenciado pelo admin a partir
 * da Fase 6 (por enquanto recebe as slides prontas via prop). Usa scroll
 * nativo com snap (funciona por gesto no celular) + setas/dots pra
 * desktop, evitando reimplementar física de arraste. */
export default function BannerCarousel({ slides }: { slides: CarouselSlide[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      goTo((active + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, slides.length]);

  function goTo(index: number) {
    const track = trackRef.current;
    if (!track) return;
    // scrollIntoView mexe na rolagem da página inteira (mesmo com
    // block:"nearest"), não só do carrossel — por isso a tela "subia" a
    // cada troca de slide. scrollTo só afeta a rolagem horizontal do track.
    track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
    setActive(index);
  }

  function handleScroll() {
    const track = trackRef.current;
    if (!track) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    if (index !== active) setActive(index);
  }

  if (slides.length === 0) return null;

  return (
    <section className="relative mx-auto max-w-6xl px-4 pb-4 pt-0 sm:py-14" aria-label="Avisos e novidades">
      <div className="relative">
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto rounded-3xl"
        >
          {slides.map((slide) => (
            <div key={slide.id} className="relative aspect-[4/5] w-full shrink-0 snap-start sm:aspect-[16/9]">
              <img src={slide.imagem} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-amora-950/90 via-amora-900/40 to-amora-900/10" />

              <div className="relative flex h-full flex-col justify-end p-6 sm:p-10">
                {slide.data && (
                  <span className="mb-3 inline-block w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    {slide.data}
                  </span>
                )}
                <h3 className="font-display text-2xl font-bold leading-tight text-white drop-shadow sm:text-4xl">
                  {slide.titulo}
                </h3>
                {slide.subtitulo && (
                  <p className="mt-2 max-w-md text-sm text-white/85 sm:text-base">{slide.subtitulo}</p>
                )}
                {slide.descricao && (
                  <p className="mt-1 max-w-md text-xs text-white/65 sm:text-sm">{slide.descricao}</p>
                )}
                {slide.botaoTexto && slide.botaoLink && (
                  <Link
                    href={slide.botaoLink}
                    className="btn-primary mt-4 w-fit rounded-full px-5 py-2.5 text-sm font-bold text-white"
                  >
                    {slide.botaoTexto}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {slides.length > 1 && (
          <>
            <button
              aria-label="Anterior"
              onClick={() => goTo((active - 1 + slides.length) % slides.length)}
              className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 text-amora-800 shadow-card transition-transform hover:scale-110 sm:flex"
            >
              <HiChevronLeft className="h-5 w-5" />
            </button>
            <button
              aria-label="Próximo"
              onClick={() => goTo((active + 1) % slides.length)}
              className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 text-amora-800 shadow-card transition-transform hover:scale-110 sm:flex"
            >
              <HiChevronRight className="h-5 w-5" />
            </button>

            <div className="mt-4 flex justify-center gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  aria-label={`Ir para o slide ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === active ? "w-6 bg-amora-700" : "w-2 bg-amora-700/25"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

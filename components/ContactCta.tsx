import { FaWhatsapp } from "react-icons/fa6";
import { getConfiguracoes } from "@/lib/config-db";
import { buildWhatsappLink } from "@/lib/whatsapp";
import BerryIcon from "@/components/decor/BerryIcon";

export default async function ContactCta() {
  const config = await getConfiguracoes();

  return (
    <section id="contato" className="mx-auto max-w-6xl px-4 pb-16 sm:pb-20">
      <div className="hero-space-gradient starfield relative overflow-hidden rounded-3xl px-6 py-14 text-center shadow-glow sm:px-12">
        <div className="relative mx-auto max-w-xl">
          <BerryIcon className="mx-auto h-9 w-9" />
          <h2 className="mt-4 font-display text-2xl font-bold text-white sm:text-3xl">
            Vem fazer parte da família {config.nomeEscola}
          </h2>
          <p className="mt-3 text-sm text-white/70 sm:text-base">
            Fale com a gente pelo WhatsApp e conheça de perto o nosso espaço, nossa proposta e
            como funciona a matrícula.
          </p>
          <div className="mt-7 flex items-center justify-center gap-3">
            <BerryIcon className="hidden h-9 w-9 shrink-0 sm:block" />
            <a
              href={buildWhatsappLink(config.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-full border-2 border-dashed border-white/25 bg-amora-950 px-6 py-3 font-display font-bold text-white shadow-lg transition-transform hover:scale-105 sm:px-7 sm:py-3.5"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                <FaWhatsapp className="h-4 w-4" />
              </span>
              Conversar no WhatsApp
            </a>
            <BerryIcon className="hidden h-9 w-9 shrink-0 sm:block" />
          </div>
        </div>
      </div>
    </section>
  );
}

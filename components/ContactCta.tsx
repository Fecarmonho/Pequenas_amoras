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
          <a
            href={buildWhatsappLink(config.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary shine mt-7 inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-display font-bold text-white"
          >
            <FaWhatsapp className="h-5 w-5" /> Conversar no WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

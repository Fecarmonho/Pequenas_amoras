import { FaWhatsapp } from "react-icons/fa6";
import { getConfiguracoes } from "@/lib/config-db";
import { buildWhatsappLink } from "@/lib/whatsapp";
import BerryIcon from "@/components/decor/BerryIcon";

export default async function ContactCta() {
  const config = await getConfiguracoes();

  return (
    <section id="contato" className="mx-auto max-w-6xl px-4 pb-16 sm:pb-20">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rosa-100 via-white to-amora-100 shadow-glow">
        <BerryIcon className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rotate-12 opacity-60 sm:h-36 sm:w-36" />

        <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch lg:gap-0 lg:p-0">
          <div className="mx-auto w-full max-w-xs overflow-hidden rounded-3xl shadow-card lg:mx-0 lg:max-w-none lg:rounded-none lg:rounded-l-3xl">
            <img src="/brand/contato-foto.png" alt="Criança da Pequenas Amoras brincando" className="h-full w-full object-cover" />
          </div>

          <div className="text-center lg:flex lg:flex-col lg:justify-center lg:px-12 lg:py-10 lg:text-left">
            <BerryIcon className="mx-auto h-9 w-9 lg:mx-0" />
            <h2 className="mt-4 font-display text-2xl font-bold text-amora-950 sm:text-3xl">
              Vem fazer parte da família {config.nomeEscola}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-ink/60 sm:text-base lg:mx-0">
              Fale com a gente pelo WhatsApp e conheça de perto o nosso espaço, nossa proposta e
              como funciona a matrícula.
            </p>

            <div className="mt-7 flex items-center justify-center gap-3 lg:justify-start">
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
      </div>
    </section>
  );
}

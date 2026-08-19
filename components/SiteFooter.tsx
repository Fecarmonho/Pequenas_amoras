import Link from "next/link";
import { FaWhatsapp, FaInstagram } from "react-icons/fa6";
import { HiOutlineMapPin, HiOutlineClock } from "react-icons/hi2";
import { getConfiguracoes } from "@/lib/config-db";
import { buildWhatsappLink } from "@/lib/whatsapp";
import BerryIcon from "@/components/decor/BerryIcon";

/** Evita pedaços do endereço quebrando linha de um jeito estranho no
 * celular: "Nº" separado do número, e a cidade + UF (depois da última
 * vírgula) separados — junta essas partes com espaço não-quebrável, sem
 * mexer no resto do texto. */
function semQuebraNoFinal(endereco: string) {
  const semNumeroQuebrado = endereco.replace(/(N[ºo°]\.?) (\d)/gi, `$1 $2`);
  const ultimaVirgula = semNumeroQuebrado.lastIndexOf(",");
  if (ultimaVirgula === -1) return semNumeroQuebrado;
  return (
    semNumeroQuebrado.slice(0, ultimaVirgula + 1) +
    semNumeroQuebrado.slice(ultimaVirgula + 1).replace(/ /g, " ")
  );
}

export default async function SiteFooter() {
  const config = await getConfiguracoes();
  const ano = new Date().getFullYear();

  return (
    <footer className="hero-space hero-space-gradient relative overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <img src="/brand/logo-badge.png" alt={config.nomeEscola} className="h-12 w-12 rounded-full" />
              <div>
                <p className="font-display text-lg font-bold text-white">{config.nomeEscola}</p>
                <p className="text-xs text-white/60">{config.slogan}</p>
              </div>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-white/60">
              <BerryIcon className="h-4 w-4" />
              Onde brincar, aprender e crescer fazem parte da mesma aventura.
            </p>
          </div>

          <div>
            <p className="font-display text-sm font-bold uppercase tracking-wide text-rosa-300">Links rápidos</p>
            <nav className="mt-4 flex flex-col gap-2 text-sm text-white/70">
              <Link href="/#sobre" className="transition-colors hover:text-white">Sobre nós</Link>
              <Link href="/#atividades" className="transition-colors hover:text-white">Atividades</Link>
              <Link href="/#galeria" className="transition-colors hover:text-white">Galeria</Link>
              <Link href="/familia/login" className="transition-colors hover:text-white">Área da Família</Link>
            </nav>
          </div>

          <div>
            <p className="font-display text-sm font-bold uppercase tracking-wide text-rosa-300">Contato</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/70">
              <a href={buildWhatsappLink(config.whatsapp)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition-colors hover:text-white">
                <FaWhatsapp className="h-4 w-4 shrink-0" /> {config.whatsapp}
              </a>
              <a href={`https://instagram.com/${config.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition-colors hover:text-white">
                <FaInstagram className="h-4 w-4 shrink-0" /> @{config.instagram}
              </a>
            </div>
          </div>

          <div>
            <p className="font-display text-sm font-bold uppercase tracking-wide text-rosa-300">Horário</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/70">
              <p className="flex items-start gap-2">
                <HiOutlineMapPin className="mt-0.5 h-4 w-4 shrink-0" /> {semQuebraNoFinal(config.endereco)}
              </p>
              <p className="flex items-start gap-2">
                <HiOutlineClock className="mt-0.5 h-4 w-4 shrink-0" /> {config.horarioAtendimento}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-white/40">
          © {ano} {config.nomeEscola} — {config.slogan}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}

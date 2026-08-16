import BerryIcon from "@/components/decor/BerryIcon";

interface FounderSectionProps {
  nome: string;
  foto?: string;
  historia: string;
}

/** Só é renderizada pela Home quando há nome + história cadastrados em
 * /admin/configuracoes — sem conteúdo real, a seção simplesmente não
 * aparece (ver app/(site)/page.tsx). */
export default function FounderSection({ nome, foto, historia }: FounderSectionProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <div className="flex flex-col items-center gap-8 rounded-3xl border border-amora-900/5 bg-white p-8 shadow-card sm:flex-row sm:gap-10 sm:p-12">
        {foto ? (
          <img
            src={foto}
            alt={nome}
            className="h-40 w-40 shrink-0 rounded-full object-cover shadow-glow sm:h-48 sm:w-48"
          />
        ) : (
          <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amora-600 to-rosa-500 font-display text-4xl font-bold text-white sm:h-48 sm:w-48">
            {nome.charAt(0)}
          </div>
        )}

        <div className="text-center sm:text-left">
          <span className="badge-soft inline-flex items-center gap-1.5">
            <BerryIcon className="h-3.5 w-3.5" /> Nossa fundadora
          </span>
          <h2 className="mt-3 font-display text-2xl font-bold text-amora-950 sm:text-3xl">{nome}</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/60 sm:text-base">{historia}</p>
        </div>
      </div>
    </section>
  );
}

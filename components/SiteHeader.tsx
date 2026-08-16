import Link from "next/link";
import MobileNav from "@/components/MobileNav";

const LINKS = [
  { href: "/", label: "Início" },
  { href: "/#sobre", label: "Sobre nós" },
  { href: "/#atividades", label: "Atividades" },
  { href: "/#galeria", label: "Galeria" },
  { href: "/#contato", label: "Contato" },
];

export default function SiteHeader() {
  return (
    <header className="hero-space sticky top-0 z-40 border-b border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/brand/logo-badge.png"
            alt="Pequenas Amoras"
            className="h-11 w-11 rounded-full ring-2 ring-rosa-300/40"
          />
          <span className="font-display text-lg font-bold text-white">
            Pequenas <span className="text-rosa-300">Amoras</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-white/75 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link href="/familia/login" className="btn-primary rounded-full px-5 py-2 text-sm font-bold text-white">
            Área da Família
          </Link>
        </div>

        <MobileNav links={LINKS} />
      </div>
    </header>
  );
}

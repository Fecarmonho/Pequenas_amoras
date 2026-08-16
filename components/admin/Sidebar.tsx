"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "📊", exact: true },
  { href: "/admin/estudantes", label: "Estudantes", icon: "🧒" },
  { href: "/admin/responsaveis", label: "Responsáveis", icon: "👪" },
  { href: "/admin/financeiro/mensalidades", label: "Mensalidades", icon: "💜" },
  { href: "/admin/financeiro/cobrancas-extras", label: "Cobranças Extras", icon: "➕" },
  { href: "/admin/avisos", label: "Avisos", icon: "📣" },
  { href: "/admin/banners", label: "Carrossel", icon: "🎠" },
  { href: "/admin/galeria", label: "Galeria", icon: "🖼️" },
  { href: "/admin/configuracoes", label: "Configurações", icon: "⚙️" },
] as const;

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {ITEMS.map((item) => {
        const active = isActive(pathname, item.href, "exact" in item && item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
              active ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span aria-hidden>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <aside className="hero-space hidden w-64 shrink-0 flex-col gap-6 border-r border-white/10 p-5 md:flex">
        <Link href="/admin" className="flex items-center gap-3">
          <img src="/brand/logo-badge.png" alt="Pequenas Amoras" className="h-10 w-10 rounded-full" />
          <span className="font-display text-lg font-bold text-white">
            Pequenas <span className="text-rosa-300">Amoras</span>
          </span>
        </Link>
        <NavLinks />
      </aside>

      {/* Mobile: barra superior + menu deslizante */}
      <div className="hero-space flex items-center justify-between border-b border-white/10 px-4 py-3 md:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <img src="/brand/logo-badge.png" alt="Pequenas Amoras" className="h-8 w-8 rounded-full" />
          <span className="font-display text-base font-bold text-white">Pequenas Amoras</span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="rounded-lg border border-white/15 px-3 py-1.5 text-white/80"
        >
          ☰
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="hero-space absolute inset-y-0 left-0 flex w-72 flex-col gap-6 p-5">
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-bold text-white">Menu</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="rounded-lg border border-white/15 px-2.5 py-1 text-white/80"
              >
                ✕
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

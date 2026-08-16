"use client";

import { useState } from "react";
import Link from "next/link";
import { HiBars3, HiXMark } from "react-icons/hi2";

interface NavLink {
  href: string;
  label: string;
}

export default function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        className="rounded-full p-2 text-white/90 transition-colors hover:bg-white/10"
      >
        <HiBars3 className="h-7 w-7" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-amora-950/60 backdrop-blur-sm animate-fade-in"
          />
          <nav className="hero-space-gradient relative flex h-full w-72 max-w-[80vw] flex-col gap-1 p-6 shadow-2xl animate-fade-up">
            <button
              onClick={() => setOpen(false)}
              aria-label="Fechar menu"
              className="mb-6 ml-auto rounded-full p-2 text-white/90 hover:bg-white/10"
            >
              <HiXMark className="h-6 w-6" />
            </button>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-base font-semibold text-white/85 transition-colors hover:bg-white/10 hover:text-white"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/familia/login"
              onClick={() => setOpen(false)}
              className="btn-primary mt-4 rounded-full px-5 py-3 text-center text-sm font-bold text-white"
            >
              Área da Família
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}

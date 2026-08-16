import type { Metadata, Viewport } from "next";
import { Fredoka, Poppins } from "next/font/google";
import "./globals.css";

// Fonte de destaque arredondada e alegre — títulos, hero, botões. Combina
// com o traço lúdico da logo (astronautas, amoras) sem virar "infantil
// demais": mantém peso e proporção legíveis num contexto profissional.
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

// Corpo de texto — geométrica, extremamente legível em telas pequenas
// (importante: a maior parte do público vai acessar pelo celular).
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Pequenas Amoras — Contraturno Escolar e Recreação Infantil",
    template: "%s | Pequenas Amoras",
  },
  description:
    "Onde brincar, aprender e crescer fazem parte da mesma aventura. Contraturno escolar e recreação infantil com segurança, carinho e diversão.",
};

export const viewport: Viewport = {
  themeColor: "#5D26A3",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${fredoka.variable} ${poppins.variable}`}>
      <body>{children}</body>
    </html>
  );
}

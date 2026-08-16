import { redirect } from "next/navigation";
import Link from "next/link";
import { getFamilySession } from "@/lib/family-session";
import LogoutButton from "@/components/familia/LogoutButton";

export default async function FamilyDashboardLayout({ children }: { children: React.ReactNode }) {
  // Validação de verdade da sessão acontece aqui, no servidor — o
  // middleware só faz uma checagem rápida de "existe cookie ou não".
  const session = await getFamilySession();
  if (!session) redirect("/familia/login");

  return (
    <div className="min-h-screen bg-paper">
      <header className="hero-space sticky top-0 z-40 border-b border-white/10">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3.5">
          <Link href="/familia" className="flex items-center gap-3">
            <img src="/brand/logo-badge.png" alt="Pequenas Amoras" className="h-10 w-10 rounded-full" />
            <span className="font-display text-base font-bold text-white">Área da Família</span>
          </Link>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6 sm:py-8">{children}</main>
    </div>
  );
}

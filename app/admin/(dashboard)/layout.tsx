import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-session";
import Sidebar from "@/components/admin/Sidebar";
import LogoutButton from "@/components/admin/LogoutButton";
import { PrivacyProvider } from "@/components/admin/PrivacyContext";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  // Validação de verdade da sessão acontece aqui, no servidor — o
  // middleware só faz uma checagem rápida de "existe cookie ou não".
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <PrivacyProvider>
      <div className="flex min-h-screen flex-col bg-paper md:flex-row">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <header className="hidden items-center justify-between border-b border-amora-900/8 bg-white px-6 py-4 md:flex">
            <p className="text-sm text-ink/50">{session.email}</p>
            <LogoutButton />
          </header>
          <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
        </div>
      </div>
    </PrivacyProvider>
  );
}

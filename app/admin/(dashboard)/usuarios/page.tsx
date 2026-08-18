import { getAdminSession } from "@/lib/admin-session";
import { getAllAdmins } from "@/lib/admins-db";
import AdminUsersManager from "@/components/admin/AdminUsersManager";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const session = await getAdminSession();
  const admins = await getAllAdmins();

  return (
    <div>
      <h1 className="mb-2 font-display text-2xl font-bold text-amora-950">Usuários do painel</h1>
      <p className="mb-6 text-sm text-ink/50">
        Quem tem acesso pra administrar o site — cada um define a própria senha ao ser cadastrado.
      </p>

      <AdminUsersManager admins={admins} currentUid={session?.uid ?? ""} />
    </div>
  );
}

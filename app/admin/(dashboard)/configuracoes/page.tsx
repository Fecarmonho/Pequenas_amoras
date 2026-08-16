import { getConfiguracoes } from "@/lib/config-db";
import ConfiguracoesForm from "@/components/admin/ConfiguracoesForm";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const config = await getConfiguracoes();

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 font-display text-2xl font-bold text-amora-950">Configurações</h1>
      <ConfiguracoesForm config={config} />
    </div>
  );
}

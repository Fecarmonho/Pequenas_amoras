import { getAllAvisos } from "@/lib/avisos-db";
import { getAllStudents } from "@/lib/students-db";
import AvisoForm from "@/components/admin/AvisoForm";
import AvisoCard from "@/components/admin/AvisoCard";

export const dynamic = "force-dynamic";

export default async function AvisosPage() {
  const [avisos, students] = await Promise.all([getAllAvisos(), getAllStudents()]);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-amora-950">Avisos</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-amora-700">Novo aviso</h2>
          <AvisoForm students={students} />
        </div>

        <div>
          <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-amora-700">Publicados</h2>
          <div className="flex flex-col gap-3">
            {avisos.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-amora-900/15 p-6 text-center text-sm text-ink/40">
                Nenhum aviso publicado ainda.
              </p>
            ) : (
              avisos.map((a) => <AvisoCard key={a.id} aviso={a} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

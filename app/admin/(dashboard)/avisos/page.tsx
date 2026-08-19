import { getAllAvisos } from "@/lib/avisos-db";
import { getAllStudents } from "@/lib/students-db";
import AvisosManager from "@/components/admin/AvisosManager";

export const dynamic = "force-dynamic";

export default async function AvisosPage() {
  const [avisos, students] = await Promise.all([getAllAvisos(), getAllStudents()]);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-amora-950">Avisos</h1>
      <AvisosManager avisos={avisos} students={students} />
    </div>
  );
}

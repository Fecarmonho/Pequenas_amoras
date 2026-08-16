import { getAllGuardians } from "@/lib/guardians-db";
import StudentForm from "@/components/admin/StudentForm";

export const dynamic = "force-dynamic";

export default async function NovoEstudantePage() {
  const guardians = await getAllGuardians();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 font-display text-2xl font-bold text-amora-950">Novo estudante</h1>
      <StudentForm guardians={guardians} />
    </div>
  );
}

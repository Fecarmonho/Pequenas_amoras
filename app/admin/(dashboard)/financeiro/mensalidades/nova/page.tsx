import { getAllStudents } from "@/lib/students-db";
import ChargeForm from "@/components/admin/ChargeForm";

export const dynamic = "force-dynamic";

export default async function NovaMensalidadePage() {
  const students = await getAllStudents();

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 font-display text-2xl font-bold text-amora-950">Nova mensalidade</h1>
      <ChargeForm categoria="mensalidade" students={students} backHref="/admin/financeiro/mensalidades" />
    </div>
  );
}

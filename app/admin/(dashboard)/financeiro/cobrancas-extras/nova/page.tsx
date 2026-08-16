import { getAllStudents } from "@/lib/students-db";
import ChargeForm from "@/components/admin/ChargeForm";

export const dynamic = "force-dynamic";

export default async function NovaCobrancaExtraPage() {
  const students = await getAllStudents();

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 font-display text-2xl font-bold text-amora-950">Nova cobrança extra</h1>
      <ChargeForm categoria="extra" students={students} backHref="/admin/financeiro/cobrancas-extras" />
    </div>
  );
}

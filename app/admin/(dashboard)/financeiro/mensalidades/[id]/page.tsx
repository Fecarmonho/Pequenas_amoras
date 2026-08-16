import { notFound } from "next/navigation";
import { getAllCharges } from "@/lib/charges-db";
import { getAllStudents } from "@/lib/students-db";
import ChargeForm from "@/components/admin/ChargeForm";

export const dynamic = "force-dynamic";

export default async function EditarMensalidadePage({ params }: { params: { id: string } }) {
  const [charges, students] = await Promise.all([getAllCharges(), getAllStudents()]);
  const charge = charges.find((c) => c.id === params.id);
  if (!charge) notFound();

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 font-display text-2xl font-bold text-amora-950">Editar mensalidade</h1>
      <ChargeForm categoria="mensalidade" students={students} charge={charge} backHref="/admin/financeiro/mensalidades" />
    </div>
  );
}

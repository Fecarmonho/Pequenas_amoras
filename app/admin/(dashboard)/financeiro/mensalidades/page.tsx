import Link from "next/link";
import { getAllCharges } from "@/lib/charges-db";
import { getAllStudents } from "@/lib/students-db";
import ChargeTable from "@/components/admin/ChargeTable";
import { HiOutlinePlus } from "react-icons/hi2";

export const dynamic = "force-dynamic";

export default async function MensalidadesPage() {
  const [charges, students] = await Promise.all([getAllCharges(), getAllStudents()]);
  const mensalidades = charges.filter((c) => c.categoria === "mensalidade");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-amora-950">Mensalidades</h1>
        <Link
          href="/admin/financeiro/mensalidades/nova"
          className="btn-primary flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold text-white"
        >
          <HiOutlinePlus className="h-4 w-4" /> Nova mensalidade
        </Link>
      </div>
      <ChargeTable charges={mensalidades} students={students} editBasePath="/admin/financeiro/mensalidades" />
    </div>
  );
}

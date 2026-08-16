import Link from "next/link";
import { getAllStudents } from "@/lib/students-db";
import { getAllCharges } from "@/lib/charges-db";
import { getAllGuardians } from "@/lib/guardians-db";
import { getAllAvisos } from "@/lib/avisos-db";
import { statusEfetivo } from "@/lib/charge-status";
import { formatBRL } from "@/lib/format";
import StatCard from "@/components/admin/StatCard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [students, charges, guardians, avisos] = await Promise.all([
    getAllStudents(),
    getAllCharges(),
    getAllGuardians(),
    getAllAvisos(),
  ]);

  const pagas = charges.filter((c) => statusEfetivo(c) === "pago");
  const pendentes = charges.filter((c) => statusEfetivo(c) === "pendente");
  const vencidas = charges.filter((c) => statusEfetivo(c) === "vencido");
  const recebido = pagas.reduce((soma, c) => soma + c.valor, 0);
  const emAberto = [...pendentes, ...vencidas].reduce((soma, c) => soma + c.valor, 0);
  const diarias = charges.filter((c) => c.categoria === "extra").length;

  const estudantesRecentes = [...students]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-amora-950">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Estudantes ativos" value={students.filter((s) => s.status === "ativo").length} cor="roxo" />
        <StatCard label="Responsáveis" value={guardians.length} cor="roxo" />
        <StatCard label="Mensalidades pagas" value={pagas.length} cor="verde" />
        <StatCard label="Pendentes" value={pendentes.length} hint="🟡" cor="dourado" />
        <StatCard label="Vencidas" value={vencidas.length} hint="🔴" cor="vermelho" />
        <StatCard label="Recebido" value={formatBRL(recebido)} cor="verde" />
        <StatCard label="Em aberto" value={formatBRL(emAberto)} cor="rosa" />
        <StatCard label="Diárias lançadas" value={diarias} cor="roxo" />
        <StatCard label="Avisos ativos" value={avisos.filter((a) => a.ativo).length} cor="rosa" />
      </div>

      <div className="mt-8 rounded-2xl border border-amora-900/8 bg-white p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-amora-950">Estudantes cadastrados recentemente</h2>
          <Link href="/admin/estudantes" className="text-sm font-semibold text-amora-700 hover:underline">
            Ver todos
          </Link>
        </div>
        {estudantesRecentes.length === 0 ? (
          <p className="text-sm text-ink/40">Nenhum estudante cadastrado ainda.</p>
        ) : (
          <ul className="divide-y divide-amora-900/5">
            {estudantesRecentes.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{s.nome}</p>
                  <p className="text-xs text-ink/40">{s.modalidade}</p>
                </div>
                <span className="badge-soft">{s.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

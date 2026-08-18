import Link from "next/link";
import { getAllStudents } from "@/lib/students-db";
import { getAllCharges } from "@/lib/charges-db";
import { getConfiguracoes } from "@/lib/config-db";
import { statusEfetivo, STATUS_LABEL, STATUS_EMOJI } from "@/lib/charge-status";
import { formatBRL, formatDate } from "@/lib/format";
import { HiChevronRight } from "react-icons/hi2";
import { Charge } from "@/lib/types";
import ChavePixConfig from "@/components/admin/ChavePixConfig";

export const dynamic = "force-dynamic";

export default async function MensalidadesPage() {
  const [students, charges, config] = await Promise.all([getAllStudents(), getAllCharges(), getConfiguracoes()]);

  const mensalidadePorAluno = new Map<string, Charge>();
  for (const c of charges) {
    if (c.categoria !== "mensalidade") continue;
    const atual = mensalidadePorAluno.get(c.studentId);
    if (!atual || c.vencimento > atual.vencimento) mensalidadePorAluno.set(c.studentId, c);
  }

  return (
    <div>
      <h1 className="mb-2 font-display text-2xl font-bold text-amora-950">Mensalidades</h1>
      <p className="mb-6 text-sm text-ink/50">
        Clique num estudante pra ver o histórico completo, editar a mensalidade e lançar cobranças extras.
      </p>

      <ChavePixConfig chavePixInicial={config.chavePix} />

      <div className="overflow-x-auto rounded-2xl border border-amora-900/8 bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-amora-900/8 text-xs uppercase tracking-wide text-ink/40">
            <tr>
              <th className="px-4 py-3">Estudante</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Vencimento</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-amora-900/5">
            {students.map((s) => {
              const charge = mensalidadePorAluno.get(s.id);
              const status = charge ? statusEfetivo(charge) : null;
              return (
                <tr key={s.id}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/financeiro/mensalidades/${s.id}`} className="font-medium text-amora-700 hover:underline">
                      {s.nome}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink/60">{charge ? formatBRL(charge.valor) : "—"}</td>
                  <td className="px-4 py-3 text-ink/60">{charge ? formatDate(charge.vencimento) : "—"}</td>
                  <td className="px-4 py-3">
                    {status ? (
                      <span className="text-xs font-semibold">{STATUS_EMOJI[status]} {STATUS_LABEL[status]}</span>
                    ) : (
                      <span className="text-xs text-ink/30">Sem mensalidade</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/financeiro/mensalidades/${s.id}`}>
                      <HiChevronRight className="ml-auto h-4 w-4 text-ink/30" />
                    </Link>
                  </td>
                </tr>
              );
            })}
            {students.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink/40">
                  Nenhum estudante cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

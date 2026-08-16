import Link from "next/link";
import { getFamilySession } from "@/lib/family-session";
import { getStudentsByIds } from "@/lib/students-db";
import { getChargesByStudents } from "@/lib/charges-db";
import { getAvisosParaEstudante } from "@/lib/avisos-db";
import { statusEfetivo } from "@/lib/charge-status";
import { formatBRL, formatDate } from "@/lib/format";
import { HiOutlineArrowLeft, HiOutlineExclamationTriangle, HiOutlineClock, HiOutlineMegaphone } from "react-icons/hi2";
import { Aviso } from "@/lib/types";

export const dynamic = "force-dynamic";

const DIAS_ALERTA_VENCIMENTO = 5;

/**
 * Notificações são computadas na hora (mensalidades vencendo/vencidas +
 * avisos recentes), não um sistema de envio de e-mail/push de verdade —
 * fica pronto pra plugar um canal de envio real no futuro sem mudar essa
 * tela.
 */
export default async function NotificacoesPage() {
  const session = await getFamilySession();
  if (!session) return null;

  const students = await getStudentsByIds(session.guardian.studentIds);
  const charges = await getChargesByStudents(students.map((s) => s.id));
  const studentsById = new Map(students.map((s) => [s.id, s]));

  const hoje = new Date();
  const limite = new Date(hoje);
  limite.setDate(limite.getDate() + DIAS_ALERTA_VENCIMENTO);
  const limiteIso = limite.toISOString().slice(0, 10);

  const vencidas = charges.filter((c) => statusEfetivo(c) === "vencido");
  const vencendo = charges.filter(
    (c) => statusEfetivo(c) === "pendente" && c.vencimento <= limiteIso
  );

  const avisosPorEstudante = await Promise.all(students.map((s) => getAvisosParaEstudante(s)));
  const avisosMap = new Map<string, Aviso>();
  avisosPorEstudante.flat().forEach((a) => avisosMap.set(a.id, a));
  const avisosRecentes = Array.from(avisosMap.values())
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 8);

  return (
    <div>
      <Link href="/familia" className="flex items-center gap-1.5 text-sm font-semibold text-amora-700">
        <HiOutlineArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <h1 className="mt-4 font-display text-2xl font-bold text-amora-950">Notificações</h1>

      {vencidas.length > 0 && (
        <section className="mt-6">
          <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-rosa-600">
            <HiOutlineExclamationTriangle className="h-4 w-4" /> Vencidas
          </h2>
          <div className="mt-3 flex flex-col gap-2">
            {vencidas.map((c) => (
              <div key={c.id} className="rounded-2xl border border-rosa-200 bg-rosa-50 p-4 text-sm">
                <p className="font-semibold text-amora-950">{studentsById.get(c.studentId)?.nome} — {c.descricao}</p>
                <p className="text-xs text-rosa-600">Venceu em {formatDate(c.vencimento)} · {formatBRL(c.valor)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {vencendo.length > 0 && (
        <section className="mt-6">
          <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-amora-700">
            <HiOutlineClock className="h-4 w-4" /> Vencendo em breve
          </h2>
          <div className="mt-3 flex flex-col gap-2">
            {vencendo.map((c) => (
              <div key={c.id} className="card-soft p-4 text-sm">
                <p className="font-semibold text-amora-950">{studentsById.get(c.studentId)?.nome} — {c.descricao}</p>
                <p className="text-xs text-ink/50">Vence em {formatDate(c.vencimento)} · {formatBRL(c.valor)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6 pb-4">
        <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-amora-700">
          <HiOutlineMegaphone className="h-4 w-4" /> Avisos recentes
        </h2>
        <div className="mt-3 flex flex-col gap-2">
          {avisosRecentes.length === 0 ? (
            <p className="text-sm text-ink/40">Nenhum aviso recente.</p>
          ) : (
            avisosRecentes.map((a) => (
              <div key={a.id} className="card-soft p-4 text-sm">
                <p className="font-semibold text-amora-950">{a.titulo}</p>
                <p className="text-xs text-ink/50">{formatDate(a.data)}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {vencidas.length === 0 && vencendo.length === 0 && avisosRecentes.length === 0 && (
        <p className="mt-8 text-center text-sm text-ink/40">Tudo em dia por aqui 🎉</p>
      )}
    </div>
  );
}

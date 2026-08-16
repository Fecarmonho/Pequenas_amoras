import Link from "next/link";
import { getFamilySession } from "@/lib/family-session";
import { getStudentsByIds } from "@/lib/students-db";
import { getChargesByStudents } from "@/lib/charges-db";
import { statusEfetivo } from "@/lib/charge-status";
import { HiOutlineBell, HiChevronRight } from "react-icons/hi2";

export const dynamic = "force-dynamic";

export default async function FamilyDashboardPage() {
  const session = await getFamilySession();
  if (!session) return null; // já redirecionado pelo layout

  const { guardian } = session;
  const students = await getStudentsByIds(guardian.studentIds);
  const charges = await getChargesByStudents(students.map((s) => s.id));

  function pendencias(studentId: string) {
    return charges.filter((c) => c.studentId === studentId && statusEfetivo(c) !== "pago").length;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-amora-950">
        Olá, {guardian.nome.split(" ")[0]} <span aria-hidden>❤️</span>
      </h1>
      <p className="mt-1 text-sm text-ink/50">Bem-vinda(o) à Área da Família da Pequenas Amoras.</p>

      <Link
        href="/familia/notificacoes"
        className="card-soft mt-6 flex items-center justify-between p-4 sm:p-5"
      >
        <span className="flex items-center gap-3 text-sm font-semibold text-amora-950">
          <HiOutlineBell className="h-5 w-5 text-rosa-500" /> Notificações
        </span>
        <HiChevronRight className="h-5 w-5 text-ink/30" />
      </Link>

      <h2 className="mt-8 font-display text-lg font-bold text-amora-950">Seus filhos</h2>

      {students.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-amora-900/15 p-6 text-center text-sm text-ink/40">
          Nenhum estudante vinculado à sua conta ainda. Fale com a administração da escola.
        </p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {students.map((student) => {
            const pend = pendencias(student.id);
            return (
              <Link
                key={student.id}
                href={`/familia/estudante/${student.id}`}
                className="card-soft flex items-center gap-4 p-5"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amora-600 to-rosa-500 font-display text-xl font-bold text-white">
                  {student.nome.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-base font-bold text-amora-950">{student.nome}</p>
                  <p className="text-xs text-ink/50">{student.modalidade}</p>
                  {pend > 0 && (
                    <span className="mt-1 inline-block rounded-full bg-rosa-100 px-2.5 py-0.5 text-xs font-semibold text-rosa-600">
                      {pend} pendência{pend > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <HiChevronRight className="h-5 w-5 shrink-0 text-ink/30" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

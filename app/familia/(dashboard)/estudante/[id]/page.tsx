import { notFound } from "next/navigation";
import Link from "next/link";
import { getFamilySession } from "@/lib/family-session";
import { getStudentForGuardian } from "@/lib/students-db";
import { getChargesByStudent } from "@/lib/charges-db";
import { getAvisosParaEstudante } from "@/lib/avisos-db";
import { getConfiguracoes } from "@/lib/config-db";
import { garantirMensalidadesAteHoje } from "@/lib/mensalidade-renovacao";
import { formatDate } from "@/lib/format";
import ReciboSection from "@/components/familia/ReciboSection";
import { HiOutlineArrowLeft } from "react-icons/hi2";

export const dynamic = "force-dynamic";

export default async function StudentPage({ params }: { params: { id: string } }) {
  const session = await getFamilySession();
  if (!session) return null;

  // Checagem de posse: só retorna o estudante se ele pertencer a este
  // responsável — trocar o :id na URL pra outro estudante não vaza nada.
  const student = await getStudentForGuardian(params.id, session.session.uid);
  if (!student) notFound();

  await garantirMensalidadesAteHoje(student);

  const [charges, avisos, config] = await Promise.all([
    getChargesByStudent(student.id),
    getAvisosParaEstudante(student),
    getConfiguracoes(),
  ]);

  const mensalidades = charges.filter((c) => c.categoria === "mensalidade");
  const extras = charges.filter((c) => c.categoria === "extra");

  return (
    <div>
      <Link href="/familia" className="flex items-center gap-1.5 text-sm font-semibold text-amora-700">
        <HiOutlineArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <div className="mt-4 flex items-center gap-4">
        {student.foto ? (
          <img src={student.foto} alt={student.nome} className="h-16 w-16 shrink-0 rounded-full object-cover" />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amora-600 to-rosa-500 font-display text-2xl font-bold text-white">
            {student.nome.charAt(0)}
          </div>
        )}
        <div>
          <h1 className="font-display text-2xl font-bold text-amora-950">{student.nome}</h1>
          <p className="text-sm text-ink/50">{student.modalidade}</p>
        </div>
      </div>

      <section className="card-soft mt-6 p-5">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-amora-700">
          Dados do estudante
        </h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-ink/40">Nascimento</dt>
            <dd className="font-medium text-ink/80">{formatDate(student.dataNascimento)}</dd>
          </div>
          <div>
            <dt className="text-ink/40">Matrícula</dt>
            <dd className="font-medium text-ink/80">{formatDate(student.dataMatricula)}</dd>
          </div>
        </dl>
        {student.pessoasAutorizadas.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-ink/40">Pessoas autorizadas a buscar</p>
            <p className="text-sm font-medium text-ink/80">
              {student.pessoasAutorizadas.map((p) => p.nome).join(", ")}
            </p>
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold text-amora-950">Financeiro</h2>
        <div className="mt-3">
          <ReciboSection student={student} mensalidades={mensalidades} extras={extras} chavePix={config.chavePix} />
        </div>
      </section>

      <section className="mt-8 pb-4">
        <h2 className="font-display text-lg font-bold text-amora-950">Avisos</h2>
        <div className="mt-3 flex flex-col gap-3">
          {avisos.length === 0 ? (
            <p className="text-sm text-ink/40">Nenhum aviso no momento.</p>
          ) : (
            avisos.map((a) => (
              <div key={a.id} className="card-soft overflow-hidden p-4">
                {a.imagem && (
                  <img src={a.imagem} alt="" className="-m-4 mb-3 h-40 w-[calc(100%+2rem)] max-w-none object-cover" />
                )}
                <p className="font-display text-sm font-bold text-amora-950">{a.titulo}</p>
                <p className="mt-1 text-xs text-ink/50">{formatDate(a.data)}</p>
                <p className="mt-2 text-sm text-ink/70">{a.texto}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

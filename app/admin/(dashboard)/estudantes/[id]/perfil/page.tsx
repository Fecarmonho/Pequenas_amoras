import { notFound } from "next/navigation";
import Link from "next/link";
import { getStudentById } from "@/lib/students-db";
import { getGuardianById } from "@/lib/guardians-db";
import { formatDate } from "@/lib/format";
import { HiOutlineArrowLeft, HiOutlinePencil, HiOutlineCurrencyDollar } from "react-icons/hi2";

export const dynamic = "force-dynamic";

export default async function PerfilEstudantePage({ params }: { params: { id: string } }) {
  const student = await getStudentById(params.id);
  if (!student) notFound();
  const guardian = student.guardianIds[0] ? await getGuardianById(student.guardianIds[0]) : null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <Link href="/admin/estudantes" className="flex items-center gap-1.5 text-sm font-semibold text-amora-700">
          <HiOutlineArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <Link
          href={`/admin/estudantes/${student.id}`}
          className="flex items-center gap-1.5 rounded-full border border-amora-900/15 px-4 py-2 text-sm font-semibold text-amora-700 hover:border-amora-600"
        >
          <HiOutlinePencil className="h-4 w-4" /> Editar
        </Link>
      </div>

      <div className="mt-4 flex items-center gap-4">
        {student.foto ? (
          <img src={student.foto} alt={student.nome} className="h-20 w-20 shrink-0 rounded-full object-cover" />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amora-600 to-rosa-500 font-display text-2xl font-bold text-white">
            {student.nome.charAt(0)}
          </div>
        )}
        <div>
          <h1 className="font-display text-2xl font-bold text-amora-950">{student.nome}</h1>
          <p className="text-sm text-ink/50">{student.modalidade}</p>
          <span className={`badge-soft mt-1 inline-block ${student.status === "inativo" ? "bg-ink/5 text-ink/40" : ""}`}>
            {student.status}
          </span>
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
          {student.cpf && (
            <div>
              <dt className="text-ink/40">CPF</dt>
              <dd className="font-medium text-ink/80">{student.cpf}</dd>
            </div>
          )}
          {student.diaVencimento && (
            <div>
              <dt className="text-ink/40">Vencimento fixo</dt>
              <dd className="font-medium text-ink/80">Todo dia {student.diaVencimento}</dd>
            </div>
          )}
        </dl>
        {student.observacoes && (
          <div className="mt-3">
            <p className="text-xs text-ink/40">Observações</p>
            <p className="whitespace-pre-line text-sm text-ink/80">{student.observacoes}</p>
          </div>
        )}
      </section>

      <section className="card-soft mt-4 p-5">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-amora-700">
          Responsável
        </h2>
        {guardian ? (
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-ink/40">Nome</dt>
              <dd className="font-medium text-ink/80">{guardian.nome}</dd>
            </div>
            <div>
              <dt className="text-ink/40">Telefone</dt>
              <dd className="font-medium text-ink/80">{guardian.telefone}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-ink/40">Login</dt>
              <dd className="font-medium text-ink/80">{guardian.email}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-2 text-sm text-ink/40">Nenhum acesso cadastrado ainda.</p>
        )}
      </section>

      {student.pessoasAutorizadas.length > 0 && (
        <section className="card-soft mt-4 p-5">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-amora-700">
            Pessoas autorizadas a buscar
          </h2>
          <ul className="mt-3 flex flex-col gap-1 text-sm text-ink/80">
            {student.pessoasAutorizadas.map((p, i) => (
              <li key={i}>{p.nome} — {p.parentesco}</li>
            ))}
          </ul>
        </section>
      )}

      <Link
        href={`/admin/financeiro/mensalidades/${student.id}`}
        className="btn-primary mt-6 flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white"
      >
        <HiOutlineCurrencyDollar className="h-4 w-4" /> Ver financeiro
      </Link>
    </div>
  );
}

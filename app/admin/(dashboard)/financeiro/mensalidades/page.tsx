import { getAllStudents } from "@/lib/students-db";
import { getAllCharges } from "@/lib/charges-db";
import { getConfiguracoes } from "@/lib/config-db";
import { garantirMensalidadesEmLote } from "@/lib/mensalidade-renovacao";
import { statusEfetivo } from "@/lib/charge-status";
import { hojeISO } from "@/lib/hoje";
import { formatCompetencia } from "@/lib/format";
import { Charge, Student } from "@/lib/types";
import ChavePixConfig from "@/components/admin/ChavePixConfig";
import MensalidadesTabs, { MensalidadeStudentRow, HistoricoRow } from "@/components/admin/MensalidadesTabs";

export const dynamic = "force-dynamic";

/** Uma linha por estudante — se ele não tem cobrança em aberto (mês atual,
 * ou nenhuma pendência), volta null nos campos de cobrança em vez de sumir
 * da lista. É assim que "todas as cadastradas no sistema" continua
 * aparecendo mesmo sem mensalidade lançada ainda. */
function linhaPorAluno(s: Student, charge: Charge | undefined): MensalidadeStudentRow {
  return {
    studentId: s.id,
    studentNome: s.nome,
    chargeId: charge?.id ?? null,
    competencia: charge?.competencia ?? null,
    valor: charge?.valor ?? null,
    vencimento: charge?.vencimento ?? null,
    valorFixo: s.valorMensalidade ?? null,
    diaVencimentoFixo: s.diaVencimento ?? null,
    status: charge ? statusEfetivo(charge) : null,
  };
}

export default async function MensalidadesPage() {
  const [students, config, chargesExistentes] = await Promise.all([getAllStudents(), getConfiguracoes(), getAllCharges()]);

  // A mensalidade do mês renova sozinha (repete o valor da última) — só
  // precisa checar isso pros estudantes ativos, toda vez que essa tela
  // abre, antes de buscar as cobranças pra exibir. Em lote (reaproveitando
  // as cobranças já buscadas acima, uma escrita só) em vez de uma consulta
  // e uma escrita por aluno — ficava lento com muitos estudantes.
  const ativos = students.filter((s) => s.status === "ativo");
  const novasCharges = await garantirMensalidadesEmLote(ativos, chargesExistentes);
  const charges = [...chargesExistentes, ...novasCharges];
  const studentsPorId = new Map(students.map((s) => [s.id, s]));
  const mesAtual = hojeISO().slice(0, 7);

  // Mês vigente por aluno, ainda não paga.
  const vigentePorAluno = new Map<string, Charge>();
  for (const c of charges) {
    if (c.categoria === "mensalidade" && c.competencia === mesAtual && c.status !== "pago") {
      vigentePorAluno.set(c.studentId, c);
    }
  }

  // Mensalidade em aberto mais recente por aluno, de qualquer mês — pega a
  // mais atual de cada um, então uma parcela atrasada de mês anterior não
  // fica escondida (some do "mês vigente" só quando não é a mais recente).
  const abertaMaisRecentePorAluno = new Map<string, Charge>();
  for (const c of charges) {
    if (c.categoria !== "mensalidade" || c.status === "pago" || !c.competencia) continue;
    const atual = abertaMaisRecentePorAluno.get(c.studentId);
    if (!atual || c.competencia > atual.competencia!) abertaMaisRecentePorAluno.set(c.studentId, c);
  }

  // "Mês vigente" só lista quem tem cobrança em aberto pra esse mês — ao
  // marcar como recebida, o aluno some daqui na hora (vai pro histórico).
  // "Todas" continua por estudante (todo mundo cadastrado aparece, com
  // "Sem mensalidade" quando não há nada em aberto), pra não esconder
  // quem nunca teve mensalidade lançada.
  const vigente: MensalidadeStudentRow[] = students
    .filter((s) => vigentePorAluno.has(s.id))
    .map((s) => linhaPorAluno(s, vigentePorAluno.get(s.id)));
  const todasEmAberto: MensalidadeStudentRow[] = students.map((s) => linhaPorAluno(s, abertaMaisRecentePorAluno.get(s.id)));

  const historico: HistoricoRow[] = charges
    .filter((c) => c.categoria === "mensalidade" && c.status === "pago")
    .sort((a, b) => (b.pagoEm ?? b.vencimento).localeCompare(a.pagoEm ?? a.vencimento))
    .map((c) => ({
      chargeId: c.id,
      studentId: c.studentId,
      studentNome: studentsPorId.get(c.studentId)?.nome ?? null,
      competencia: c.competencia ?? null,
      valor: c.valor,
      pagoEm: c.pagoEm ?? null,
    }));

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-amora-950">Mensalidades</h1>

      <div className="mb-6">
        <ChavePixConfig chavePixInicial={config.chavePix} />
      </div>

      <MensalidadesTabs
        mesAtualLabel={formatCompetencia(mesAtual)}
        vigente={vigente}
        todasEmAberto={todasEmAberto}
        historico={historico}
        charges={charges}
        studentsPorId={Object.fromEntries(students.map((s) => [s.id, s.nome]))}
      />
    </div>
  );
}

import { getAllStudents } from "@/lib/students-db";
import { getAllCharges } from "@/lib/charges-db";
import { getConfiguracoes } from "@/lib/config-db";
import { garantirMensalidadesAteHoje } from "@/lib/mensalidade-renovacao";
import { statusEfetivo } from "@/lib/charge-status";
import { formatCompetencia } from "@/lib/format";
import { Charge } from "@/lib/types";
import ChavePixConfig from "@/components/admin/ChavePixConfig";
import MensalidadesTabs, { VigenteRow, AbertoRow, HistoricoRow } from "@/components/admin/MensalidadesTabs";

export const dynamic = "force-dynamic";

export default async function MensalidadesPage() {
  const [students, config] = await Promise.all([getAllStudents(), getConfiguracoes()]);

  // A mensalidade do mês renova sozinha (repete o valor da última) — só
  // precisa checar isso pros estudantes ativos, toda vez que essa tela
  // abre, antes de buscar as cobranças pra exibir.
  await Promise.all(students.filter((s) => s.status === "ativo").map((s) => garantirMensalidadesAteHoje(s)));

  const charges = await getAllCharges();
  const studentsPorId = new Map(students.map((s) => [s.id, s]));
  const mesAtual = new Date().toISOString().slice(0, 7);

  // Mês vigente por aluno, ainda não paga — é a área de trabalho do dia a
  // dia: marcar como recebida aqui, ou entrar no aluno pra lançar uma
  // cobrança extra.
  const vigentePorAluno = new Map<string, Charge>();
  for (const c of charges) {
    if (c.categoria === "mensalidade" && c.competencia === mesAtual && c.status !== "pago") {
      vigentePorAluno.set(c.studentId, c);
    }
  }
  const vigente: VigenteRow[] = students
    .filter((s) => vigentePorAluno.has(s.id))
    .map((s) => {
      const charge = vigentePorAluno.get(s.id)!;
      return {
        studentId: s.id,
        studentNome: s.nome,
        chargeId: charge.id,
        valor: charge.valor,
        vencimento: charge.vencimento,
        status: statusEfetivo(charge),
      };
    });

  // Todas as mensalidades em aberto, de qualquer mês — visão geral pra não
  // deixar uma parcela atrasada de mês anterior invisível.
  const todasEmAberto: AbertoRow[] = charges
    .filter((c) => c.categoria === "mensalidade" && c.status !== "pago")
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento))
    .map((c) => ({
      chargeId: c.id,
      studentId: c.studentId,
      studentNome: studentsPorId.get(c.studentId)?.nome ?? null,
      competencia: c.competencia ?? null,
      valor: c.valor,
      vencimento: c.vencimento,
      status: statusEfetivo(c),
    }));

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
      />
    </div>
  );
}

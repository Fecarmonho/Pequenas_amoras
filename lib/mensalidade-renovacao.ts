import "server-only";
import { Student } from "@/lib/types";
import { getChargesByStudent, createCharge } from "@/lib/charges-db";

function competenciaAtual(): string {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

function proximaCompetencia(competencia: string): string {
  const [ano, mes] = competencia.split("-").map(Number);
  const data = new Date(ano, mes, 1); // mes (1-12) como índice 0-based já cai no mês seguinte
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
}

function vencimentoParaCompetencia(competencia: string, dia: number): string {
  const [ano, mes] = competencia.split("-").map(Number);
  const ultimoDiaDoMes = new Date(ano, mes, 0).getDate();
  const diaAjustado = Math.min(dia, ultimoDiaDoMes);
  return new Date(ano, mes - 1, diaAjustado).toISOString().slice(0, 10);
}

/**
 * Garante que a mensalidade do mês atual exista pra esse estudante, com
 * o valor sempre lido de `student.valorMensalidade` (configurado uma vez
 * no cadastro, editável lá) — assim a mensalidade "renova sozinha" todo
 * mês, sem precisar lançar nada manualmente. Preenche também meses que
 * ficaram sem lançamento (ex: ninguém abriu o painel por um tempo), um
 * de cada vez, até chegar no mês atual. Se o valor mudar no cadastro
 * (ex: reajuste), os meses ainda não gerados já saem com o valor novo —
 * os que já existem como cobrança não são tocados.
 *
 * Não faz nada sem `diaVencimento` (não dá pra saber quando vence) nem
 * sem `valorMensalidade` em estudantes que nunca tiveram mensalidade
 * lançada — nesse caso não tem valor nenhum pra repetir.
 */
export async function garantirMensalidadesAteHoje(student: Student): Promise<void> {
  const dia = student.diaVencimento;
  if (!dia) return;

  const charges = await getChargesByStudent(student.id);
  const mensalidades = charges.filter((c) => c.categoria === "mensalidade" && c.competencia);
  const hoje = competenciaAtual();

  if (mensalidades.length === 0) {
    if (!student.valorMensalidade) return;
    await createCharge({
      studentId: student.id,
      categoria: "mensalidade",
      tipo: "mensalidade",
      competencia: hoje,
      descricao: "Mensalidade",
      valor: student.valorMensalidade,
      vencimento: vencimentoParaCompetencia(hoje, dia),
      status: "pendente",
      createdAt: new Date().toISOString(),
    });
    return;
  }

  // Sem valor cadastrado no estudante (dado antigo, de antes desse
  // campo existir) — repete o valor da última parcela, como sempre foi.
  const ultima = mensalidades.reduce((a, b) => (a.competencia! > b.competencia! ? a : b));
  const valor = student.valorMensalidade ?? ultima.valor;

  let comp = proximaCompetencia(ultima.competencia!);
  let seguranca = 0;
  while (comp <= hoje && seguranca < 36) {
    await createCharge({
      studentId: student.id,
      categoria: "mensalidade",
      tipo: "mensalidade",
      competencia: comp,
      descricao: "Mensalidade",
      valor,
      vencimento: vencimentoParaCompetencia(comp, dia),
      status: "pendente",
      createdAt: new Date().toISOString(),
    });
    comp = proximaCompetencia(comp);
    seguranca++;
  }
}

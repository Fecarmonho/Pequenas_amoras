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
 * Garante que a mensalidade do mês atual exista pra esse estudante,
 * repetindo o valor da última parcela lançada — assim a mensalidade
 * "renova sozinha" todo mês, sem precisar clicar em nada. Preenche
 * também meses que ficaram sem lançamento (ex: ninguém abriu o painel
 * por um tempo), um de cada vez, até chegar no mês atual.
 *
 * Não faz nada se o aluno nunca teve nenhuma mensalidade lançada — o
 * primeiro valor sempre vem do cadastro (aba Mensalidade do formulário),
 * porque não tem como adivinhar o valor sem isso.
 */
export async function garantirMensalidadesAteHoje(student: Student): Promise<void> {
  const charges = await getChargesByStudent(student.id);
  const mensalidades = charges.filter((c) => c.categoria === "mensalidade" && c.competencia);
  if (mensalidades.length === 0) return;

  const ultima = mensalidades.reduce((a, b) => (a.competencia! > b.competencia! ? a : b));
  const hoje = competenciaAtual();
  const dia = student.diaVencimento ?? Number(ultima.vencimento.slice(8, 10));

  let comp = proximaCompetencia(ultima.competencia!);
  let seguranca = 0;
  while (comp <= hoje && seguranca < 36) {
    await createCharge({
      studentId: student.id,
      categoria: "mensalidade",
      tipo: "mensalidade",
      competencia: comp,
      descricao: "Mensalidade",
      valor: ultima.valor,
      vencimento: vencimentoParaCompetencia(comp, dia),
      status: "pendente",
      createdAt: new Date().toISOString(),
    });
    comp = proximaCompetencia(comp);
    seguranca++;
  }
}

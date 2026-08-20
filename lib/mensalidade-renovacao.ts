import "server-only";
import { Student, Charge } from "@/lib/types";
import { getChargesByStudent, createCharge, createChargesEmLote } from "@/lib/charges-db";
import { hojeISO } from "@/lib/hoje";

function competenciaAtual(): string {
  return hojeISO().slice(0, 7); // YYYY-MM, no fuso de Brasília
}

function proximaCompetencia(competencia: string): string {
  const [ano, mes] = competencia.split("-").map(Number);
  const data = new Date(Date.UTC(ano, mes, 1)); // mes (1-12) como índice 0-based já cai no mês seguinte
  return `${data.getUTCFullYear()}-${String(data.getUTCMonth() + 1).padStart(2, "0")}`;
}

function vencimentoParaCompetencia(competencia: string, dia: number): string {
  const [ano, mes] = competencia.split("-").map(Number);
  const ultimoDiaDoMes = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
  const diaAjustado = Math.min(dia, ultimoDiaDoMes);
  return new Date(Date.UTC(ano, mes - 1, diaAjustado)).toISOString().slice(0, 10);
}

/**
 * Calcula quais mensalidades estão faltando pra esse estudante até hoje
 * (mês atual + meses que ficaram sem lançamento), sem tocar no banco —
 * só a conta. Compartilhada pelas duas versões abaixo (uma aluno por vez
 * e em lote) pra não duplicar essa lógica de mês/valor.
 */
function cobrancasFaltantes(student: Student, mensalidadesDoAluno: Charge[]): Omit<Charge, "id">[] {
  const dia = student.diaVencimento;
  if (!dia) return [];

  const hoje = competenciaAtual();
  const agora = new Date().toISOString();
  const mensalidades = mensalidadesDoAluno.filter((c) => c.categoria === "mensalidade" && c.competencia);

  if (mensalidades.length === 0) {
    if (!student.valorMensalidade) return [];
    return [
      {
        studentId: student.id,
        categoria: "mensalidade",
        tipo: "mensalidade",
        competencia: hoje,
        descricao: "Mensalidade",
        valor: student.valorMensalidade,
        vencimento: vencimentoParaCompetencia(hoje, dia),
        status: "pendente",
        createdAt: agora,
      },
    ];
  }

  // Sem valor cadastrado no estudante (dado antigo, de antes desse campo
  // existir) — repete o valor da última parcela, como sempre foi.
  const ultima = mensalidades.reduce((a, b) => (a.competencia! > b.competencia! ? a : b));
  const valor = student.valorMensalidade ?? ultima.valor;

  const faltantes: Omit<Charge, "id">[] = [];
  let comp = proximaCompetencia(ultima.competencia!);
  let seguranca = 0;
  while (comp <= hoje && seguranca < 36) {
    faltantes.push({
      studentId: student.id,
      categoria: "mensalidade",
      tipo: "mensalidade",
      competencia: comp,
      descricao: "Mensalidade",
      valor,
      vencimento: vencimentoParaCompetencia(comp, dia),
      status: "pendente",
      createdAt: agora,
    });
    comp = proximaCompetencia(comp);
    seguranca++;
  }
  return faltantes;
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
 * Versão de um aluno só (busca as cobranças dele na hora) — usada onde só
 * há um estudante pra checar por vez (ex: página da família). Pra checar
 * muitos alunos de uma vez (dashboard, lista de mensalidades do admin),
 * usa garantirMensalidadesEmLote — evita uma consulta + escrita separada
 * pra cada aluno, que fica lento com muitos cadastros.
 */
export async function garantirMensalidadesAteHoje(student: Student): Promise<void> {
  const charges = await getChargesByStudent(student.id);
  const faltantes = cobrancasFaltantes(student, charges);
  for (const c of faltantes) await createCharge(c);
}

/**
 * Mesma coisa, mas pra vários alunos de uma vez, reaproveitando cobranças
 * já buscadas (sem fazer uma consulta nova por aluno) e escrevendo tudo
 * num lote só do Firestore (em vez de uma escrita por cobrança faltante).
 * Devolve as cobranças recém-criadas, pra quem chamou já ter em mãos sem
 * precisar buscar de novo no banco.
 */
export async function garantirMensalidadesEmLote(students: Student[], charges: Charge[]): Promise<Charge[]> {
  const porAluno = new Map<string, Charge[]>();
  for (const c of charges) {
    if (c.categoria !== "mensalidade") continue;
    const lista = porAluno.get(c.studentId);
    if (lista) lista.push(c);
    else porAluno.set(c.studentId, [c]);
  }

  const faltantes = students.flatMap((s) => cobrancasFaltantes(s, porAluno.get(s.id) ?? []));
  if (faltantes.length === 0) return [];
  return createChargesEmLote(faltantes);
}

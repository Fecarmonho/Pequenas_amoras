/** Próxima ocorrência do dia fixo de vencimento — mês atual se ainda não
 * passou, senão mês seguinte. Ajusta pro último dia do mês quando o dia
 * escolhido não existe nele (ex: dia 31 em fevereiro). */
export function proximoVencimento(dia: number): string {
  const hoje = new Date();
  let ano = hoje.getFullYear();
  let mes = hoje.getMonth(); // 0-11
  if (dia < hoje.getDate()) mes += 1;

  const ultimoDiaDoMes = new Date(ano, mes + 1, 0).getDate();
  const diaAjustado = Math.min(dia, ultimoDiaDoMes);
  const data = new Date(ano, mes, diaAjustado);
  return data.toISOString().slice(0, 10);
}

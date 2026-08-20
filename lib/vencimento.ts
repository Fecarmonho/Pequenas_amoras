import { hojeISO } from "@/lib/hoje";

/** Próxima ocorrência do dia fixo de vencimento — mês atual se ainda não
 * passou, senão mês seguinte. Ajusta pro último dia do mês quando o dia
 * escolhido não existe nele (ex: dia 31 em fevereiro). Tudo calculado a
 * partir do dia de hoje em Brasília (ver lib/hoje.ts) e com aritmética
 * em UTC, pra não depender do fuso horário configurado no servidor. */
export function proximoVencimento(dia: number): string {
  const [anoStr, mesStr, diaStr] = hojeISO().split("-");
  const ano = Number(anoStr);
  let mes = Number(mesStr) - 1; // 0-11
  if (dia < Number(diaStr)) mes += 1;

  const ultimoDiaDoMes = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate();
  const diaAjustado = Math.min(dia, ultimoDiaDoMes);
  return new Date(Date.UTC(ano, mes, diaAjustado)).toISOString().slice(0, 10);
}

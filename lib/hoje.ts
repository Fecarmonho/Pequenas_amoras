/**
 * Data de "hoje" no fuso de Brasília (America/Sao_Paulo), sempre em
 * YYYY-MM-DD — nunca usar `new Date().toISOString()` puro pra "hoje".
 *
 * O servidor roda em UTC, e Brasília está 3h atrás. Perto da meia-noite
 * UTC (21h–00h em Brasília) o UTC já virou o dia seguinte enquanto
 * ainda é "hoje" no Brasil. Isso fazia uma mensalidade com vencimento
 * hoje sumir do Dashboard ("Vencendo hoje" comparava com o dia UTC,
 * já adiantado) mas continuar aparecendo no "Mês vigente" (que só olha
 * o mês, não o dia exato, então o descompasso não aparecia lá).
 */
export function hojeISO(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

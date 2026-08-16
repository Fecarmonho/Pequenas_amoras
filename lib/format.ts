export function formatBRL(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Recebe "YYYY-MM-DD" e devolve "DD/MM/AAAA" sem passar por Date (evita
 * problema de fuso horário deslocando o dia). */
export function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

export function formatCompetencia(competencia: string): string {
  const [y, m] = competencia.split("-");
  const MESES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  return `${MESES[Number(m) - 1]}/${y}`;
}

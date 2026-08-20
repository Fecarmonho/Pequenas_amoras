import { Charge, StatusCobrancaEfetivo } from "@/lib/types";
import { hojeISO } from "@/lib/hoje";

/** "Vencido" nunca é gravado no banco — é sempre derivado na hora da
 * leitura, evitando precisar de um cron pra manter o status em dia. */
export function statusEfetivo(charge: Pick<Charge, "status" | "vencimento">): StatusCobrancaEfetivo {
  if (charge.status === "pago") return "pago";
  return charge.vencimento < hojeISO() ? "vencido" : "pendente";
}

export const STATUS_LABEL: Record<StatusCobrancaEfetivo, string> = {
  pago: "Pago",
  pendente: "Pendente",
  vencido: "Vencido",
};

export const STATUS_EMOJI: Record<StatusCobrancaEfetivo, string> = {
  pago: "🟢",
  pendente: "🟡",
  vencido: "🔴",
};

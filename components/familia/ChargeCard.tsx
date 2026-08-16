import { Charge } from "@/lib/types";
import { statusEfetivo, STATUS_LABEL, STATUS_EMOJI } from "@/lib/charge-status";
import { formatBRL, formatDate, formatCompetencia } from "@/lib/format";
import { HiOutlineArrowDownTray } from "react-icons/hi2";

export default function ChargeCard({ charge }: { charge: Charge }) {
  const status = statusEfetivo(charge);
  const boletoUrl = charge.boleto?.pdfUrl || charge.boleto?.linkUrl;

  return (
    <div className="card-soft flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="min-w-0">
        <p className="font-display text-sm font-bold text-amora-950">
          {charge.competencia ? formatCompetencia(charge.competencia) : charge.descricao}
        </p>
        {charge.competencia && <p className="text-xs text-ink/50">{charge.descricao}</p>}
        <p className="mt-1 text-xs text-ink/50">Vencimento: {formatDate(charge.vencimento)}</p>
        {charge.observacao && <p className="mt-1 text-xs text-ink/40">{charge.observacao}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="text-right">
          <p className="font-display text-base font-bold text-amora-950">{formatBRL(charge.valor)}</p>
          <span className="text-xs font-semibold">
            {STATUS_EMOJI[status]} {STATUS_LABEL[status]}
          </span>
        </div>
        {boletoUrl && status !== "pago" && (
          <a
            href={boletoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold text-white"
          >
            <HiOutlineArrowDownTray className="h-4 w-4" /> Boleto
          </a>
        )}
      </div>
    </div>
  );
}

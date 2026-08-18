import { Charge } from "@/lib/types";
import { statusEfetivo, STATUS_LABEL, STATUS_EMOJI } from "@/lib/charge-status";
import { formatBRL, formatDate, formatCompetencia } from "@/lib/format";
import { HiOutlineArrowDownTray } from "react-icons/hi2";
import BerryIcon from "@/components/decor/BerryIcon";

const CATEGORIA_LABEL: Record<Charge["categoria"], string> = {
  mensalidade: "Mensalidade",
  extra: "Cobrança extra",
};

/** Cartão em formato de "recibo" — perfuração no meio (as duas bolinhas
 * cortando a borda) separa os dados da cobrança do valor/status, como um
 * canhoto de boleto de verdade. */
export default function ChargeCard({ charge, ocultarStatus }: { charge: Charge; ocultarStatus?: boolean }) {
  const status = statusEfetivo(charge);
  const boletoUrl = charge.boleto?.pdfUrl;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white shadow-card">
      <div className="flex items-center justify-between gap-2 border-b border-dashed border-amora-900/15 px-5 pb-3 pt-4">
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-amora-700">
          <BerryIcon className="h-3.5 w-3.5" /> {CATEGORIA_LABEL[charge.categoria]}
        </span>
        {!ocultarStatus && (
          <span className="text-[11px] font-semibold">{STATUS_EMOJI[status]} {STATUS_LABEL[status]}</span>
        )}
      </div>

      <div className="px-5 py-4">
        <p className="font-display text-sm font-bold text-amora-950">
          {charge.competencia ? formatCompetencia(charge.competencia) : charge.descricao}
        </p>
        {charge.competencia && <p className="text-xs text-ink/50">{charge.descricao}</p>}
        {charge.observacao && <p className="mt-1 text-xs text-ink/40">{charge.observacao}</p>}
      </div>

      {/* perfuração — as bolinhas usam a cor de fundo da página pra "furar" o recibo */}
      <div className="relative border-t border-dashed border-amora-900/15">
        <span className="absolute left-0 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper" aria-hidden="true" />
        <span className="absolute right-0 top-0 h-4 w-4 -translate-y-1/2 translate-x-1/2 rounded-full bg-paper" aria-hidden="true" />
      </div>

      <div className="flex items-center justify-between gap-3 bg-amora-50/60 px-5 py-4">
        <div>
          <p className="text-[11px] text-ink/40">Vencimento</p>
          <p className="text-sm font-semibold text-ink/80">{formatDate(charge.vencimento)}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-ink/40">Valor</p>
          <p className="font-mono text-lg font-bold text-amora-950">{formatBRL(charge.valor)}</p>
        </div>
      </div>

      {boletoUrl && status !== "pago" && (
        <a
          href={boletoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary flex items-center justify-center gap-1.5 px-5 py-3 text-sm font-bold text-white"
        >
          <HiOutlineArrowDownTray className="h-4 w-4" /> Baixar boleto
        </a>
      )}
    </div>
  );
}

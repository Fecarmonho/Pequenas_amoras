import { Charge } from "@/lib/types";
import { statusEfetivo, STATUS_LABEL, STATUS_EMOJI } from "@/lib/charge-status";
import { formatBRL, formatDate, formatCompetencia } from "@/lib/format";
import { HiOutlineArrowDownTray } from "react-icons/hi2";

/** Linha compacta de mensalidade — "Mensalidade — mês/ano" e valor à
 * direita, sem data de vencimento (não é relevante pra família ver
 * aqui). */
export function MensalidadeRow({ charge, ocultarStatus }: { charge: Charge; ocultarStatus?: boolean }) {
  const status = statusEfetivo(charge);
  const boletoUrl = charge.boleto?.pdfUrl;

  return (
    <div className="border-b border-dashed border-amora-900/15 py-3 last:border-0">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold uppercase tracking-wide text-amora-700">
            Mensalidade {charge.competencia ? `— ${formatCompetencia(charge.competencia)}` : ""}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-mono text-base font-bold text-amora-950">{formatBRL(charge.valor)}</p>
          {!ocultarStatus && (
            <span className="text-[11px] font-semibold">{STATUS_EMOJI[status]} {STATUS_LABEL[status]}</span>
          )}
        </div>
      </div>
      {boletoUrl && status !== "pago" && (
        <a
          href={boletoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center justify-center gap-1.5 rounded-full border border-amora-900/15 py-2 text-xs font-bold text-amora-700"
        >
          <HiOutlineArrowDownTray className="h-3.5 w-3.5" /> Baixar boleto
        </a>
      )}
    </div>
  );
}

/** Linha compacta de cobrança extra — só a descrição escrita pelo admin
 * (ex: "Diária do dia 07/07"), sem repetir "Cobrança extra" em cada
 * linha (isso já fica só no título da seção). */
export function ExtraRow({ charge, ocultarStatus }: { charge: Charge; ocultarStatus?: boolean }) {
  const status = statusEfetivo(charge);
  return (
    <div className="flex items-center justify-between gap-3 border-b border-dashed border-amora-900/10 py-2.5 last:border-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">{charge.descricao}</p>
        <p className="truncate text-xs text-ink/40">Vence {formatDate(charge.vencimento)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-sm font-semibold text-ink">{formatBRL(charge.valor)}</span>
        {!ocultarStatus && (
          <span className="text-[11px] font-semibold">{STATUS_EMOJI[status]} {STATUS_LABEL[status]}</span>
        )}
      </div>
    </div>
  );
}

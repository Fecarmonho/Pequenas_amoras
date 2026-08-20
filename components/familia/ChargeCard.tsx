import { Charge, TIPOS_COBRANCA_EXTRA } from "@/lib/types";
import { statusEfetivo, STATUS_LABEL, STATUS_EMOJI } from "@/lib/charge-status";
import { formatBRL, formatCompetencia } from "@/lib/format";
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

/** Linha compacta de cobrança extra — título mostra o tipo (ex:
 * "Diária"), sem repetir "Cobrança extra" (isso já fica só no título da
 * seção); a descrição livre do admin vai embaixo. */
export function ExtraRow({ charge, ocultarStatus }: { charge: Charge; ocultarStatus?: boolean }) {
  const status = statusEfetivo(charge);
  const tipoLabel = TIPOS_COBRANCA_EXTRA.find((t) => t.value === charge.tipo)?.label ?? charge.descricao;
  return (
    <div className="flex items-center justify-between gap-3 border-b border-dashed border-amora-900/10 py-2.5 last:border-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold uppercase tracking-wide text-amora-700">{tipoLabel}</p>
        {charge.descricao && <p className="truncate text-xs text-ink/40">{charge.descricao}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="font-mono text-sm font-bold text-amora-950">{formatBRL(charge.valor)}</span>
        {!ocultarStatus && (
          <span className="text-[11px] font-semibold">{STATUS_EMOJI[status]} {STATUS_LABEL[status]}</span>
        )}
      </div>
    </div>
  );
}

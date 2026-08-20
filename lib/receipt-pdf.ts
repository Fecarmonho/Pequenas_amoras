"use client";

/**
 * Transforma um elemento do DOM (o cartão do recibo) numa imagem
 * (html2canvas) e monta um PDF de uma página com ela (jsPDF). Roda só no
 * navegador — nunca importar isso de um Server Component.
 */
async function gerarPdfBlob(elemento: HTMLElement): Promise<Blob> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  // Sem isso, o html2canvas às vezes tira a foto antes da fonte customizada
  // (Fredoka/Poppins) terminar de carregar — o texto sai com a métrica da
  // fonte de fallback e fica cortado/desalinhado no PDF.
  await document.fonts.ready;
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  const canvas = await html2canvas(elemento, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
  const imgData = canvas.toDataURL("image/png");

  // Página do tamanho exato do recibo (+ margem) em vez de A4 fixo — com
  // A4 fixo, um recibo com várias cobranças ficava mais alto que a
  // página e a parte de baixo (ex: a chave PIX) saía cortada, sem
  // segunda página pra continuar.
  const margemMm = 10;
  const larguraMm = 190;
  const alturaMm = (canvas.height * larguraMm) / canvas.width;
  const doc = new jsPDF({ unit: "mm", format: [larguraMm + margemMm * 2, alturaMm + margemMm * 2] });
  doc.addImage(imgData, "PNG", margemMm, margemMm, larguraMm, alturaMm);

  return doc.output("blob");
}

export async function baixarReciboPdf(elemento: HTMLElement, nomeArquivo: string) {
  const blob = await gerarPdfBlob(elemento);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Usa o menu nativo de compartilhamento do celular (WhatsApp etc.) quando
 * disponível — vai o PDF junto com a frase, não só o arquivo sozinho; sem
 * suporte, cai pro download normal. */
export async function enviarReciboPdf(elemento: HTMLElement, nomeArquivo: string, mensagem?: string) {
  const blob = await gerarPdfBlob(elemento);
  const file = new File([blob], nomeArquivo, { type: "application/pdf" });

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: nomeArquivo, text: mensagem });
    return;
  }

  await baixarReciboPdf(elemento, nomeArquivo);
}

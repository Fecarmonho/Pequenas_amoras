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
  // fonte de fallback e fica cortado/desalinhado no PDF. setTimeout (não
  // requestAnimationFrame) de propósito: rAF fica pausado em aba fora de
  // foco/minimizada, travando a geração pra sempre nesse caso.
  await document.fonts.ready;
  await new Promise((r) => setTimeout(r, 50));

  const canvasCompleto = await html2canvas(elemento, { scale: 2, backgroundColor: "#ffffff", useCORS: true });

  // Página A4 padrão (testamos página de tamanho customizado antes, mas
  // leitores de PDF de celular não lidam bem com página fora do padrão —
  // mostravam só um pedaço, desenquadrado). Um recibo mais alto que uma
  // folha é recortado em fatias do tamanho de uma página ANTES de virar
  // PNG — passar a mesma imagem enorme várias vezes pro jsPDF (uma por
  // página) era lento demais e travava no celular.
  const margemMm = 10;
  const larguraMm = 190;
  const alturaUtilMm = 297 - margemMm * 2;
  const pxPorMm = canvasCompleto.width / larguraMm;
  const alturaUtilPx = Math.floor(alturaUtilMm * pxPorMm);

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let yPx = 0;
  let pagina = 0;
  while (yPx < canvasCompleto.height) {
    const alturaFatiaPx = Math.min(alturaUtilPx, canvasCompleto.height - yPx);
    const fatia = document.createElement("canvas");
    fatia.width = canvasCompleto.width;
    fatia.height = alturaFatiaPx;
    fatia
      .getContext("2d")!
      .drawImage(canvasCompleto, 0, yPx, canvasCompleto.width, alturaFatiaPx, 0, 0, canvasCompleto.width, alturaFatiaPx);

    if (pagina > 0) doc.addPage();
    doc.addImage(fatia.toDataURL("image/png"), "PNG", margemMm, margemMm, larguraMm, alturaFatiaPx / pxPorMm);

    yPx += alturaFatiaPx;
    pagina++;
  }

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

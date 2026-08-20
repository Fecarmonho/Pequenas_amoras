"use client";

/**
 * Transforma um elemento do DOM (o cartão do recibo) numa imagem
 * (html2canvas) e monta um PDF de uma página com ela (jsPDF). Roda só no
 * navegador — nunca importar isso de um Server Component.
 *
 * `pontosDeQuebraSeguros` (opcional): posições em px CSS (relativas ao
 * topo do `elemento`), tiradas do DOM antes de capturar, de lugares onde
 * é seguro cortar a página — ex: o espaço vazio embaixo de cada linha de
 * uma lista. Sem isso, um conteúdo mais alto que uma folha (várias
 * dezenas de linhas, por exemplo) corta exatamente na altura da página,
 * que não tem por que coincidir com o fim de uma linha — cortando o
 * texto no meio. Com os pontos, a quebra usa o mais próximo (e menor ou
 * igual) do limite da página, em vez do limite cru.
 */
async function gerarPdfBlob(elemento: HTMLElement, pontosDeQuebraSeguros?: number[]): Promise<Blob> {
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

  const larguraCssPx = elemento.getBoundingClientRect().width;
  const canvasCompleto = await html2canvas(elemento, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
  const escalaCanvas = canvasCompleto.width / larguraCssPx;

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

  const pontosSegurosPx = (pontosDeQuebraSeguros ?? [])
    .map((y) => Math.round(y * escalaCanvas))
    .sort((a, b) => a - b);

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let yPx = 0;
  let pagina = 0;
  while (yPx < canvasCompleto.height) {
    let alturaFatiaPx = Math.min(alturaUtilPx, canvasCompleto.height - yPx);
    const limite = yPx + alturaFatiaPx;
    // Só ajusta se não é a última fatia (senão ia sobrar espaço em
    // branco no final à toa) — acha o ponto seguro mais alto possível
    // sem passar do limite da página.
    if (limite < canvasCompleto.height) {
      const candidato = [...pontosSegurosPx].reverse().find((p) => p > yPx && p <= limite);
      if (candidato) alturaFatiaPx = candidato - yPx;
    }

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

export async function baixarReciboPdf(elemento: HTMLElement, nomeArquivo: string, pontosDeQuebraSeguros?: number[]) {
  const blob = await gerarPdfBlob(elemento, pontosDeQuebraSeguros);
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
export async function enviarReciboPdf(
  elemento: HTMLElement,
  nomeArquivo: string,
  mensagem?: string,
  pontosDeQuebraSeguros?: number[]
) {
  const blob = await gerarPdfBlob(elemento, pontosDeQuebraSeguros);
  const file = new File([blob], nomeArquivo, { type: "application/pdf" });

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: nomeArquivo, text: mensagem });
    return;
  }

  await baixarReciboPdf(elemento, nomeArquivo, pontosDeQuebraSeguros);
}

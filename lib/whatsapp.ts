export function buildWhatsappLink(numero: string, mensagem?: string): string {
  const texto = mensagem ?? "Olá! Vim pelo site da Pequenas Amoras e gostaria de saber mais 💜";
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

/** Normaliza um telefone cadastrado (com ou sem DDI) pro formato que o
 * wa.me espera — completa com o DDI do Brasil quando faltar. */
export function numeroWhatsapp(telefone: string): string {
  const digits = telefone.replace(/\D/g, "");
  return digits.length <= 11 ? `55${digits}` : digits;
}

export function buildWhatsappLink(numero: string, mensagem?: string): string {
  const texto = mensagem ?? "Olá! Vim pelo site da Pequenas Amoras e gostaria de saber mais 💜";
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

/**
 * Dados institucionais fixos (Fase 1, sem banco ainda). A partir da Fase 6
 * isso passa a vir de `lib/config-db.ts` (coleção `configuracoes`,
 * editável pelo admin) — esses valores viram só o default do seed.
 */
export const SITE_CONFIG = {
  nomeEscola: "Pequenas Amoras",
  slogan: "Contraturno Escolar e Recreação Infantil",
  whatsapp: "5515991182670",
  whatsappExibicao: "(15) 99118-2670",
  instagram: "pequenas.amoras",
  // TODO: confirmar endereço completo com a administradora e preencher
  // aqui (ou em /admin/configuracoes, a partir da Fase 6).
  endereco: "Endereço a confirmar",
  horario: "Segunda a sexta, 7h às 19h",
};

export const WHATSAPP_LINK = `https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent(
  "Olá! Vim pelo site da Pequenas Amoras e gostaria de saber mais 💜"
)}`;

export const INSTAGRAM_LINK = `https://instagram.com/${SITE_CONFIG.instagram}`;

import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import { Configuracoes } from "@/lib/types";
import { SITE_CONFIG } from "@/lib/site-config";

const COLLECTION = "configuracoes";
const DOC_ID = "geral";

const DEFAULT_CONFIG: Configuracoes = {
  nomeEscola: SITE_CONFIG.nomeEscola,
  slogan: SITE_CONFIG.slogan,
  whatsapp: SITE_CONFIG.whatsapp,
  instagram: SITE_CONFIG.instagram,
  endereco: SITE_CONFIG.endereco,
  horarioAtendimento: SITE_CONFIG.horario,
  textoInstitucional:
    "A Pequenas Amoras é uma escola de contraturno escolar e recreação infantil dedicada a oferecer um ambiente seguro, acolhedor e divertido.",
};

export async function getConfiguracoes(): Promise<Configuracoes> {
  try {
    const doc = await adminDb.collection(COLLECTION).doc(DOC_ID).get();
    if (!doc.exists) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...(doc.data() as Partial<Configuracoes>) };
  } catch {
    // Site público não pode quebrar por falta de Firebase configurado
    // ainda (modo demo, ver SETUP-FIREBASE.md) — cai pros valores padrão.
    return DEFAULT_CONFIG;
  }
}

export async function updateConfiguracoes(data: Partial<Configuracoes>): Promise<void> {
  await adminDb.collection(COLLECTION).doc(DOC_ID).set(data, { merge: true });
}

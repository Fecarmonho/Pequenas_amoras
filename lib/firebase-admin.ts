/**
 * Firebase no lado do servidor — NUNCA importe este arquivo de um
 * componente cliente ("use client"). Usa a chave da conta de serviço pra
 * ler/escrever no Firestore e validar sessões de login, ignorando as
 * regras de segurança do Firestore (por isso é o próprio código do
 * servidor que decide quem pode ler/escrever, checando o cookie de sessão
 * antes de cada operação — ver lib/admin-session.ts e lib/family-session.ts).
 *
 * Inicialização é preguiçosa (só na primeira chamada de verdade, não no
 * import do módulo) — assim `next build` consegue coletar os dados das
 * rotas mesmo sem `.env.local` configurado ainda (projeto roda em "modo
 * demo" até o Firebase real ser configurado, ver SETUP-FIREBASE.md).
 */
import { initializeApp, getApps, getApp, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let app: App | null = null;

function initAdmin(): App {
  if (app) return app;
  if (getApps().length) {
    app = getApp();
    return app;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // No painel da Vercel a quebra de linha da chave privada vira "\n"
  // literal — precisamos converter de volta para quebra de linha real.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Variáveis do Firebase Admin não configuradas. Confira FIREBASE_PROJECT_ID, " +
        "FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY no seu .env.local (veja SETUP-FIREBASE.md)."
    );
  }

  app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });

  // Vários campos opcionais do domínio (boleto, competencia, cpf de
  // estudante etc.) chegam como `undefined` — sem isso o Admin SDK rejeita
  // o `set`/`update` inteiro em vez de só omitir o campo.
  getFirestore(app).settings({ ignoreUndefinedProperties: true });

  return app;
}

function lazy<T extends object>(factory: () => T): T {
  let instance: T | null = null;
  return new Proxy({} as T, {
    get(_target, prop, receiver) {
      if (!instance) instance = factory();
      return Reflect.get(instance as object, prop, receiver);
    },
  });
}

export const adminAuth: Auth = lazy(() => getAuth(initAdmin()));
export const adminDb: Firestore = lazy(() => getFirestore(initAdmin()));

/**
 * Firebase no lado do navegador — usado só nas telas de login (admin e
 * família) pra autenticar com email/senha. Essas chaves são públicas por
 * natureza; a segurança de verdade acontece no servidor
 * (lib/firebase-admin.ts + cookies de sessão validados em cada rota
 * /admin e /familia).
 */
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Fallback "demo" só pra o SDK conseguir inicializar sem quebrar o build
// (Next pré-renderiza as telas de login mesmo sendo client component)
// antes do Firebase real estar configurado — ver SETUP-FIREBASE.md. Um
// login de verdade só funciona depois de preencher o .env.local.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "demo-app-id",
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);

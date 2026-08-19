// Apaga estudantes, responsáveis (Firestore + conta no Firebase Auth),
// cobranças e avisos — os dados que aparecem no Dashboard. NÃO mexe em
// admins, configurações, banners ou galeria (conteúdo real do site, não
// dado de teste). Ação irreversível — sem confirmação/dry-run porque é
// um script de uso manual, não roda em produção.
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("Faltam variáveis do Firebase Admin no .env.local. Veja SETUP-FIREBASE.md.");
  process.exit(1);
}

const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const db = getFirestore(app);
const auth = getAuth(app);

async function apagarColecao(nome) {
  const snap = await db.collection(nome).get();
  await Promise.all(snap.docs.map((doc) => doc.ref.delete()));
  return snap.size;
}

async function main() {
  const guardiansSnap = await db.collection("guardians").get();
  let contasApagadas = 0;
  for (const doc of guardiansSnap.docs) {
    const uid = doc.data().uid;
    if (uid) {
      try {
        await auth.deleteUser(uid);
        contasApagadas++;
      } catch {
        // conta já não existia no Auth por algum motivo — segue limpando o resto
      }
    }
  }

  const [estudantes, responsaveis, cobrancas, avisos] = await Promise.all([
    apagarColecao("students"),
    apagarColecao("guardians"),
    apagarColecao("charges"),
    apagarColecao("avisos"),
  ]);

  console.log(`✓ ${estudantes} estudante(s) apagado(s).`);
  console.log(`✓ ${responsaveis} responsável(is) apagado(s) do Firestore (${contasApagadas} conta(s) de acesso apagada(s) do Firebase Auth).`);
  console.log(`✓ ${cobrancas} cobrança(s) apagada(s).`);
  console.log(`✓ ${avisos} aviso(s) apagado(s).`);
  console.log("\nDashboard zerado. Admins, configurações, banners e galeria não foram tocados.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

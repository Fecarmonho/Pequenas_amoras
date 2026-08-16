// Popula o Firestore + Firebase Auth com dados fictícios (claramente
// marcados como DEMO) pra visualizar o site/família/admin durante o
// desenvolvimento. Troque por dados reais direto pelo painel quando for
// pra produção — nada aqui inventa dados reais da escola.
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
db.settings({ ignoreUndefinedProperties: true });

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function getOrCreateUser(email, password, displayName) {
  try {
    const user = await auth.getUserByEmail(email);
    return user.uid;
  } catch {
    const user = await auth.createUser({ email, password, displayName });
    return user.uid;
  }
}

async function main() {
  const agora = new Date().toISOString();

  // ── Admin de demonstração ──────────────────────────────────
  const adminUid = await getOrCreateUser("admin@pequenasamoras.demo", "demo123456", "Administradora Demo");
  await db.collection("admins").doc(adminUid).set({
    uid: adminUid,
    nome: "Administradora Demo",
    email: "admin@pequenasamoras.demo",
  });
  console.log("✓ Admin demo: admin@pequenasamoras.demo / demo123456");

  // ── Responsável + estudante de demonstração ────────────────
  const guardianAuthUid = await getOrCreateUser("ana.oliveira@pequenasamoras.demo", "demo123456", "Ana Oliveira");
  const guardianId = uid();
  await db.collection("guardians").doc(guardianId).set({
    id: guardianId,
    uid: guardianAuthUid,
    nome: "Ana Oliveira",
    cpf: "12345678900",
    telefone: "(15) 99000-0001",
    whatsapp: "(15) 99000-0001",
    email: "ana.oliveira@pequenasamoras.demo",
    parentesco: "Mãe",
    studentIds: [],
    createdAt: agora,
  });

  const studentId = uid();
  await db.collection("students").doc(studentId).set({
    id: studentId,
    nome: "Maria Oliveira",
    dataNascimento: "2018-04-12",
    dataMatricula: "2026-02-01",
    modalidade: "Contraturno Escolar",
    observacoes: "Estudante de demonstração (DEMO) — não é um cadastro real.",
    guardianIds: [guardianId],
    pessoasAutorizadas: [{ nome: "José Oliveira", parentesco: "Pai" }],
    status: "ativo",
    createdAt: agora,
    updatedAt: agora,
  });

  await db.collection("guardians").doc(guardianId).update({ studentIds: [studentId] });
  console.log("✓ Família demo: ana.oliveira@pequenasamoras.demo / demo123456 (filha: Maria Oliveira)");

  // ── Financeiro de demonstração ──────────────────────────────
  await db.collection("charges").doc(uid()).set({
    id: uid(),
    studentId,
    categoria: "mensalidade",
    tipo: "mensalidade",
    competencia: "2026-08",
    descricao: "Mensalidade Agosto/2026 (DEMO)",
    valor: 600,
    vencimento: "2026-08-10",
    status: "pendente",
    boleto: { linkUrl: "https://exemplo.com/boleto-demo.pdf" },
    createdAt: agora,
  });

  await db.collection("charges").doc(uid()).set({
    id: uid(),
    studentId,
    categoria: "extra",
    tipo: "diaria",
    descricao: "Diária adicional (DEMO)",
    valor: 50,
    vencimento: "2026-08-15",
    status: "pendente",
    createdAt: agora,
  });
  console.log("✓ Cobranças demo lançadas (mensalidade + diária).");

  // ── Avisos de demonstração ──────────────────────────────────
  const avisos = [
    { titulo: "Semana da Diversão (DEMO)", texto: "Uma semana cheia de aventuras para os nossos pequenos!", data: "2026-08-18" },
    { titulo: "Dia do Brincar (DEMO)", texto: "Brincadeiras ao ar livre toda sexta-feira.", data: "2026-08-14" },
    { titulo: "Atividade Especial (DEMO)", texto: "Oficina de arte na quinta-feira.", data: "2026-08-13" },
  ];
  for (const aviso of avisos) {
    await db.collection("avisos").doc(uid()).set({
      id: uid(),
      ...aviso,
      destinatario: { tipo: "todos" },
      ativo: true,
      createdAt: agora,
    });
  }
  console.log(`✓ ${avisos.length} avisos demo publicados.`);

  console.log("\nSeed concluído — todos os dados estão marcados como DEMO.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

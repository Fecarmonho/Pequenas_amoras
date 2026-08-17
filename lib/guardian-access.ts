import "server-only";
import { randomBytes } from "crypto";
import { adminAuth } from "@/lib/firebase-admin";
import { createGuardian, getGuardianByEmail } from "@/lib/guardians-db";
import { emailAcessoBase } from "@/lib/slug";

/** Acha um e-mail livre a partir do nome do aluno — "luiza@amoras.com",
 * e se já existir, "luiza2@amoras.com", "luiza3@amoras.com" etc. */
async function emailDisponivel(nomeAluno: string): Promise<string> {
  const base = emailAcessoBase(nomeAluno);
  if (!(await getGuardianByEmail(base))) return base;

  const [usuario, dominio] = base.split("@");
  for (let n = 2; n < 100; n++) {
    const candidato = `${usuario}${n}@${dominio}`;
    if (!(await getGuardianByEmail(candidato))) return candidato;
  }
  // Praticamente impossível chegar aqui — só uma rede de segurança.
  return `${usuario}${Date.now()}@${dominio}`;
}

/**
 * Cria a conta de acesso da família: gera o e-mail a partir do nome do
 * aluno, cria o usuário no Firebase Auth com uma senha aleatória (que
 * nunca é mostrada a ninguém) e devolve um link de "definir senha" —
 * o próprio responsável escolhe a senha real ao abrir esse link, em vez
 * do admin ter que criar e repassar uma senha provisória.
 */
export async function criarAcessoFamilia(params: {
  nomeAluno: string;
  nomeResponsavel: string;
  telefone: string;
  studentId: string;
  origin: string;
}): Promise<{ guardianId: string; email: string; link: string }> {
  const email = await emailDisponivel(params.nomeAluno);
  const senhaAleatoria = randomBytes(24).toString("base64url");

  const userRecord = await adminAuth.createUser({
    email,
    password: senhaAleatoria,
    displayName: params.nomeResponsavel,
  });

  const link = await adminAuth.generatePasswordResetLink(email, {
    url: `${params.origin}/familia/definir-senha`,
  });

  const guardian = await createGuardian({
    uid: userRecord.uid,
    nome: params.nomeResponsavel,
    cpf: "",
    telefone: params.telefone,
    email,
    parentesco: "",
    studentIds: [params.studentId],
    createdAt: new Date().toISOString(),
  });

  return { guardianId: guardian.id, email, link };
}

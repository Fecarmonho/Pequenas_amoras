import "server-only";
import { randomBytes } from "crypto";
import { adminAuth } from "@/lib/firebase-admin";
import { createGuardian, getGuardianByEmail } from "@/lib/guardians-db";
import { emailAcessoBase } from "@/lib/slug";
import { criarTokenDefinirSenha } from "@/lib/password-setup-token";

/** Acha um e-mail livre a partir do usuário desejado (escolhido pelo
 * admin, ou sugerido a partir do nome do aluno) — "luiza@amoras.com", e
 * se já existir, "luiza2@amoras.com", "luiza3@amoras.com" etc. */
async function emailDisponivel(usuarioDesejado: string): Promise<string> {
  const base = emailAcessoBase(usuarioDesejado);
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
  /** O admin pode digitar o usuário desejado; sem isso, sugere a partir
   * do nome do aluno. */
  usuario?: string;
  nomeAluno: string;
  nomeResponsavel: string;
  telefone: string;
  studentId: string;
  origin: string;
}): Promise<{ guardianId: string; email: string; link: string }> {
  const email = await emailDisponivel(params.usuario || params.nomeAluno);
  const senhaAleatoria = randomBytes(24).toString("base64url");

  const userRecord = await adminAuth.createUser({
    email,
    password: senhaAleatoria,
    displayName: params.nomeResponsavel,
  });

  const token = await criarTokenDefinirSenha(userRecord.uid, email);
  const link = `${params.origin}/familia/definir-senha?token=${token}`;

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

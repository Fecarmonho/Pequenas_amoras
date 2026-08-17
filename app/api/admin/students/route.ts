import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { createStudent, updateStudent } from "@/lib/students-db";
import { createGuardian, getGuardianByEmail, addStudentToGuardian } from "@/lib/guardians-db";
import { createCharge } from "@/lib/charges-db";
import { adminAuth } from "@/lib/firebase-admin";
import { logAudit } from "@/lib/audit-db";
import { Student } from "@/lib/types";

interface Payload {
  nome: string;
  foto?: string;
  dataNascimento: string;
  cpf?: string;
  dataMatricula: string;
  modalidade: string;
  status?: Student["status"];
  pessoasAutorizadas: Student["pessoasAutorizadas"];
  observacoes?: string;
  responsavel?: { nome: string; telefone: string; email: string; senhaProvisoria?: string };
  mensalidadeInicial?: { valor: number; vencimento: string };
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const body = (await request.json()) as Payload;
  if (!body.nome || !body.dataNascimento || !body.dataMatricula || !body.modalidade) {
    return NextResponse.json({ error: "Preencha os campos obrigatórios." }, { status: 400 });
  }

  const now = new Date().toISOString();
  const guardianIds: string[] = [];
  let credenciais: { email: string; senha: string } | undefined;

  try {
    // Cria o estudante primeiro (precisamos do id pra vincular o responsável).
    const created = await createStudent({
      nome: body.nome,
      foto: body.foto,
      dataNascimento: body.dataNascimento,
      cpf: body.cpf,
      dataMatricula: body.dataMatricula,
      modalidade: body.modalidade,
      observacoes: body.observacoes,
      guardianIds: [],
      pessoasAutorizadas: body.pessoasAutorizadas ?? [],
      status: body.status ?? "ativo",
      createdAt: now,
      updatedAt: now,
    });

    // Responsável: se já existe um cadastro com esse e-mail, só vincula;
    // senão cria a conta de acesso (Firebase Auth + doc `guardians`) —
    // a família não se autocadastra.
    if (body.responsavel?.email) {
      const { nome: responsavelNome, telefone, email, senhaProvisoria } = body.responsavel;
      const existente = await getGuardianByEmail(email);

      if (existente) {
        guardianIds.push(existente.id);
        await addStudentToGuardian(existente.id, created.id);
      } else {
        if (!senhaProvisoria || senhaProvisoria.length < 6) {
          return NextResponse.json(
            { error: "Informe uma senha provisória com pelo menos 6 caracteres pro responsável." },
            { status: 400 }
          );
        }
        let uid: string;
        try {
          const userRecord = await adminAuth.createUser({ email, password: senhaProvisoria, displayName: responsavelNome });
          uid = userRecord.uid;
        } catch (err: any) {
          if (err?.code !== "auth/email-already-exists") throw err;
          uid = (await adminAuth.getUserByEmail(email)).uid;
        }

        const guardian = await createGuardian({
          uid,
          nome: responsavelNome,
          cpf: "",
          telefone,
          email: email.toLowerCase(),
          parentesco: "",
          studentIds: [created.id],
          createdAt: now,
        });
        guardianIds.push(guardian.id);
        credenciais = { email, senha: senhaProvisoria };
      }

      await updateStudent(created.id, { guardianIds });
    }

    if (body.mensalidadeInicial?.valor && body.mensalidadeInicial.vencimento) {
      await createCharge({
        studentId: created.id,
        categoria: "mensalidade",
        tipo: "mensalidade",
        competencia: body.mensalidadeInicial.vencimento.slice(0, 7),
        descricao: "Mensalidade",
        valor: body.mensalidadeInicial.valor,
        vencimento: body.mensalidadeInicial.vencimento,
        status: "pendente",
        createdAt: now,
      });
    }

    await logAudit({ actorEmail: session.email ?? "admin", acao: "criar", entidade: "student", entidadeId: created.id });

    return NextResponse.json({ ok: true, student: created, credenciais });
  } catch (err: any) {
    const message = err instanceof Error ? err.message : "Não foi possível cadastrar o estudante.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

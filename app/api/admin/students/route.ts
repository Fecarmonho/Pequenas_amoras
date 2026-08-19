import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { createStudent, updateStudent } from "@/lib/students-db";
import { criarAcessoFamilia } from "@/lib/guardian-access";
import { createCharge } from "@/lib/charges-db";
import { logAudit } from "@/lib/audit-db";
import { Student } from "@/lib/types";

interface Payload {
  nome: string;
  foto?: string;
  dataNascimento: string;
  cpf?: string;
  dataMatricula: string;
  modalidade: string;
  periodo?: string;
  status?: Student["status"];
  responsaveis?: Student["responsaveis"];
  pessoasAutorizadas: Student["pessoasAutorizadas"];
  observacoes?: string;
  responsavel?: { nome: string; telefone: string; usuario?: string };
  mensalidadeInicial?: { valor: number; vencimento: string };
  diaVencimento?: number;
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const body = (await request.json()) as Payload;
  if (!body.nome || !body.dataNascimento || !body.dataMatricula || !body.modalidade) {
    return NextResponse.json({ error: "Preencha os campos obrigatórios." }, { status: 400 });
  }

  const now = new Date().toISOString();
  let credenciais: { email: string; link: string; telefone: string } | undefined;

  try {
    // Cria o estudante primeiro (precisamos do id pra vincular o responsável).
    const created = await createStudent({
      nome: body.nome,
      foto: body.foto,
      dataNascimento: body.dataNascimento,
      cpf: body.cpf,
      dataMatricula: body.dataMatricula,
      modalidade: body.modalidade,
      periodo: body.periodo,
      observacoes: body.observacoes,
      diaVencimento: body.diaVencimento,
      guardianIds: [],
      responsaveis: body.responsaveis ?? [],
      pessoasAutorizadas: body.pessoasAutorizadas ?? [],
      status: body.status ?? "ativo",
      createdAt: now,
      updatedAt: now,
    });

    // Acesso da família: gera e-mail a partir do nome do aluno e um link
    // de primeiro acesso (o responsável define a própria senha por lá).
    if (body.responsavel?.nome) {
      const { guardianId, email, link } = await criarAcessoFamilia({
        usuario: body.responsavel.usuario,
        nomeAluno: body.nome,
        nomeResponsavel: body.responsavel.nome,
        telefone: body.responsavel.telefone,
        studentId: created.id,
        origin: request.nextUrl.origin,
      });
      await updateStudent(created.id, { guardianIds: [guardianId] });
      credenciais = { email, link, telefone: body.responsavel.telefone };
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

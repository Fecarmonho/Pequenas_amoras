import Link from "next/link";
import { getAllStudents } from "@/lib/students-db";
import { getAllCharges } from "@/lib/charges-db";
import { getAllAvisos } from "@/lib/avisos-db";
import { getGuardianById } from "@/lib/guardians-db";
import { getConfiguracoes } from "@/lib/config-db";
import { garantirMensalidadesAteHoje } from "@/lib/mensalidade-renovacao";
import { statusEfetivo } from "@/lib/charge-status";
import { formatBRL, formatCompetencia } from "@/lib/format";
import { buildWhatsappLink, numeroWhatsapp } from "@/lib/whatsapp";
import StatCard from "@/components/admin/StatCard";
import MarcarRecebidoButton from "@/components/admin/MarcarRecebidoButton";
import { FaWhatsapp } from "react-icons/fa6";
import { Charge } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [students, avisos, config] = await Promise.all([getAllStudents(), getAllAvisos(), getConfiguracoes()]);

  // Garante que a mensalidade do mês já exista antes de calcular "vencendo
  // hoje" — sem isso, uma mensalidade só aparece aqui depois que alguém
  // abrir a tela de Financeiro > Mensalidades ao menos uma vez no mês.
  await Promise.all(students.filter((s) => s.status === "ativo").map((s) => garantirMensalidadesAteHoje(s)));

  const charges = await getAllCharges();

  const pagas = charges.filter((c) => statusEfetivo(c) === "pago");
  const pendentes = charges.filter((c) => statusEfetivo(c) === "pendente");
  const vencidas = charges.filter((c) => statusEfetivo(c) === "vencido");
  const recebido = pagas.reduce((soma, c) => soma + c.valor, 0);
  const emAberto = [...pendentes, ...vencidas].reduce((soma, c) => soma + c.valor, 0);
  const diarias = charges.filter((c) => c.categoria === "extra").length;

  const estudantesRecentes = [...students]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  // Parcelas e cobranças extras que vencem hoje — pra poder disparar a
  // cobrança pelo WhatsApp direto daqui, usando o telefone cadastrado no
  // responsável do aluno.
  const hojeStr = new Date().toISOString().slice(0, 10);
  const chargesHoje = charges.filter((c) => c.status === "pendente" && c.vencimento === hojeStr);
  const vencendoHoje = await Promise.all(
    chargesHoje.map(async (charge) => {
      const student = students.find((s) => s.id === charge.studentId);
      const guardian = student?.guardianIds[0] ? await getGuardianById(student.guardianIds[0]) : null;
      return { charge, student, guardian };
    })
  );

  // Quando o aluno tem mais de uma cobrança vencendo no mesmo dia (ex:
  // mensalidade + uma diária), a mensagem do WhatsApp fala das duas juntas
  // em vez de mencionar só a que gerou aquela linha específica — a diária
  // sempre acompanha a mensalidade na cobrança de verdade.
  const grupoPorAluno = new Map<string, { total: number; temMensalidade: boolean; count: number }>();
  for (const c of chargesHoje) {
    const atual = grupoPorAluno.get(c.studentId) ?? { total: 0, temMensalidade: false, count: 0 };
    atual.total += c.valor;
    atual.count += 1;
    if (c.categoria === "mensalidade") atual.temMensalidade = true;
    grupoPorAluno.set(c.studentId, atual);
  }

  function mensagemCobranca(charge: Charge, nomeAluno: string): string {
    const grupo = grupoPorAluno.get(charge.studentId)!;
    const pix = config.chavePix ? ` Chave PIX pra pagamento: ${config.chavePix}.` : "";
    if (grupo.count > 1) {
      const descricao = grupo.temMensalidade ? "mensalidade + cobranças extras" : "cobranças extras";
      return `Olá! Passando pra lembrar que a ${descricao} de ${nomeAluno} (${formatBRL(grupo.total)}) vencem hoje.${pix} Qualquer dúvida, estamos à disposição 💜 — Pequenas Amoras`;
    }
    const descricao = charge.competencia ? formatCompetencia(charge.competencia) : charge.descricao;
    return `Olá! Passando pra lembrar que a cobrança "${descricao}" de ${nomeAluno} (${formatBRL(charge.valor)}) vence hoje.${pix} Qualquer dúvida, estamos à disposição 💜 — Pequenas Amoras`;
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-amora-950">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Estudantes ativos" value={students.filter((s) => s.status === "ativo").length} cor="roxo" />
        <StatCard label="Mensalidades pagas" value={pagas.length} cor="verde" />
        <StatCard label="Pendentes" value={pendentes.length} hint="🟡" cor="dourado" />
        <StatCard label="Vencidas" value={vencidas.length} hint="🔴" cor="vermelho" />
        <StatCard label="Recebido" value={formatBRL(recebido)} cor="verde" />
        <StatCard label="Em aberto" value={formatBRL(emAberto)} cor="rosa" />
        <StatCard label="Diárias lançadas" value={diarias} cor="roxo" />
        <StatCard label="Avisos ativos" value={avisos.filter((a) => a.ativo).length} cor="rosa" />
      </div>

      <div className="mt-8 rounded-2xl border border-amora-900/8 bg-white p-5 shadow-card">
        <h2 className="font-display text-lg font-bold text-amora-950">Vencendo hoje</h2>
        {vencendoHoje.length === 0 ? (
          <p className="mt-2 text-sm text-ink/40">Nenhuma cobrança vence hoje.</p>
        ) : (
          <ul className="mt-3 divide-y divide-amora-900/5">
            {vencendoHoje.map(({ charge, student, guardian }) => {
              const descricao = charge.competencia ? formatCompetencia(charge.competencia) : charge.descricao;
              const mensagem = mensagemCobranca(charge, student?.nome ?? "aluno");
              return (
                <li key={charge.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{student?.nome ?? "Aluno removido"}</p>
                    <p className="truncate text-xs text-ink/40">{descricao} — {formatBRL(charge.valor)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <MarcarRecebidoButton chargeId={charge.id} />
                    {guardian?.telefone ? (
                      <a
                        href={buildWhatsappLink(numeroWhatsapp(guardian.telefone), mensagem)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-white"
                      >
                        <FaWhatsapp className="h-3.5 w-3.5" /> Disparar cobrança
                      </a>
                    ) : (
                      <span className="text-xs text-ink/30">Sem telefone cadastrado</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="mt-8 rounded-2xl border border-amora-900/8 bg-white p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-amora-950">Estudantes cadastrados recentemente</h2>
          <Link href="/admin/estudantes" className="text-sm font-semibold text-amora-700 hover:underline">
            Ver todos
          </Link>
        </div>
        {estudantesRecentes.length === 0 ? (
          <p className="text-sm text-ink/40">Nenhum estudante cadastrado ainda.</p>
        ) : (
          <ul className="divide-y divide-amora-900/5">
            {estudantesRecentes.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{s.nome}</p>
                  <p className="text-xs text-ink/40">{s.modalidade}</p>
                </div>
                <span className="badge-soft">{s.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Guardian, PessoaAutorizada, Student, MODALIDADES } from "@/lib/types";
import { processarFoto } from "@/lib/image-compress";
import { slugify } from "@/lib/slug";
import { onlyDigits } from "@/lib/cpf";
import { HiOutlineTrash, HiOutlinePlus, HiOutlineClipboardDocument } from "react-icons/hi2";
import { FaWhatsapp } from "react-icons/fa6";

const inputClass =
  "mt-1 w-full rounded-xl border border-amora-900/15 bg-white px-4 py-2.5 text-sm text-ink focus:border-amora-600 focus:outline-none";

const TABS = [
  { id: "dados", label: "Dados do estudante" },
  { id: "acesso", label: "Acesso da família" },
  { id: "mensalidade", label: "Mensalidade" },
  { id: "autorizados", label: "Autorizados" },
  { id: "observacoes", label: "Observações" },
] as const;

type TabId = (typeof TABS)[number]["id"];
type Credenciais = { email: string; link: string; telefone: string };

function linkWhatsapp(telefone: string, email: string, link: string): string {
  const digits = onlyDigits(telefone);
  const numero = digits.length <= 11 ? `55${digits}` : digits;
  const texto = `Olá! Seu acesso à Área da Família da Pequenas Amoras está pronto 💜\n\nLogin: ${email}\n\nClique no link abaixo pra criar sua senha:\n${link}`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

function TelaCredenciais({ credenciais, onVoltar }: { credenciais: Credenciais; onVoltar: () => void }) {
  const [copiado, setCopiado] = useState(false);

  async function copiarLink() {
    await navigator.clipboard.writeText(credenciais.link);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-amora-900/8 bg-white p-6 text-center shadow-card">
      <p className="text-3xl">🎉</p>
      <h1 className="mt-3 font-display text-xl font-bold text-amora-950">Acesso pronto!</h1>
      <p className="mt-2 text-sm text-ink/60">
        O responsável usa esse login e cria a própria senha ao abrir o link — manda pra ele por WhatsApp:
      </p>
      <div className="mt-4 rounded-xl bg-amora-50 p-4 text-left text-sm">
        <p><strong>Login:</strong> {credenciais.email}</p>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <a
          href={linkWhatsapp(credenciais.telefone, credenciais.email, credenciais.link)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white"
        >
          <FaWhatsapp className="h-4 w-4" /> Enviar por WhatsApp
        </a>
        <button
          type="button"
          onClick={copiarLink}
          className="flex items-center justify-center gap-2 rounded-full border border-amora-900/15 px-5 py-2.5 text-sm font-semibold text-amora-700"
        >
          <HiOutlineClipboardDocument className="h-4 w-4" /> {copiado ? "Link copiado!" : "Copiar link"}
        </button>
      </div>
      <button onClick={onVoltar} className="mt-5 text-sm font-semibold text-ink/40 hover:text-ink/70">
        Voltar
      </button>
    </div>
  );
}

export default function StudentForm({ student, guardian }: { student?: Student; guardian?: Guardian }) {
  const router = useRouter();
  const isEdit = Boolean(student);

  const [tab, setTab] = useState<TabId>("dados");

  // Dados do estudante
  const [nome, setNome] = useState(student?.nome ?? "");
  const [foto, setFoto] = useState(student?.foto ?? "");
  const [processandoFoto, setProcessandoFoto] = useState(false);
  const [dataNascimento, setDataNascimento] = useState(student?.dataNascimento ?? "");
  const [cpf, setCpf] = useState(student?.cpf ?? "");
  const [dataMatricula, setDataMatricula] = useState(student?.dataMatricula ?? new Date().toISOString().slice(0, 10));
  const [modalidade, setModalidade] = useState<string>(student?.modalidade ?? MODALIDADES[0]);
  const [status, setStatus] = useState(student?.status ?? "ativo");

  // Acesso da família (responsável)
  const [responsavelNome, setResponsavelNome] = useState(guardian?.nome ?? "");
  const [responsavelTelefone, setResponsavelTelefone] = useState(guardian?.telefone ?? "");
  const [usuario, setUsuario] = useState("");
  const [usuarioEditadoManualmente, setUsuarioEditadoManualmente] = useState(false);
  const [acessoError, setAcessoError] = useState<string | null>(null);
  const [acessoLoading, setAcessoLoading] = useState<"reenviar" | "excluir" | null>(null);

  // Mensalidade (dia fixo pra sugerir vencimento; valor/data inicial só
  // faz sentido na criação — depois disso, o ciclo mensal é gerenciado em
  // Financeiro > Mensalidades)
  const [diaVencimento, setDiaVencimento] = useState(student?.diaVencimento?.toString() ?? "");
  const [valorMensalidade, setValorMensalidade] = useState("");
  const [vencimentoMensalidade, setVencimentoMensalidade] = useState("");

  const [pessoasAutorizadas, setPessoasAutorizadas] = useState<PessoaAutorizada[]>(student?.pessoasAutorizadas ?? []);
  const [observacoes, setObservacoes] = useState(student?.observacoes ?? "");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [credenciais, setCredenciais] = useState<Credenciais | null>(null);

  // Sugere o usuário a partir do nome do aluno — o admin pode editar à
  // vontade (para de seguir o nome assim que ele mexer no campo).
  useEffect(() => {
    if (!usuarioEditadoManualmente && !guardian) setUsuario(slugify(nome));
  }, [nome, usuarioEditadoManualmente, guardian]);

  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setProcessandoFoto(true);
    try {
      setFoto(await processarFoto(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao processar a foto.");
    } finally {
      setProcessandoFoto(false);
    }
  }

  function addAutorizado() {
    setPessoasAutorizadas((prev) => [...prev, { nome: "", parentesco: "" }]);
  }

  function updateAutorizado(index: number, field: keyof PessoaAutorizada, value: string) {
    setPessoasAutorizadas((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  }

  function removeAutorizado(index: number) {
    setPessoasAutorizadas((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      nome,
      foto: foto || undefined,
      dataNascimento,
      cpf,
      dataMatricula,
      modalidade,
      status,
      pessoasAutorizadas,
      observacoes,
      diaVencimento: diaVencimento ? Number(diaVencimento) : undefined,
      responsavel:
        guardian || usuario || responsavelTelefone || responsavelNome
          ? {
              nome: responsavelNome || `Responsável de ${nome}`,
              telefone: responsavelTelefone,
              usuario: !guardian ? usuario : undefined,
            }
          : undefined,
      mensalidadeInicial:
        valorMensalidade && vencimentoMensalidade
          ? { valor: Number(valorMensalidade), vencimento: vencimentoMensalidade }
          : undefined,
    };

    try {
      const response = isEdit
        ? await fetch(`/api/admin/students/${student!.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/students", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Não foi possível salvar.");

      if (data.credenciais) {
        setCredenciais(data.credenciais);
        return;
      }

      router.push("/admin/estudantes");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar estudante.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReenviarLink() {
    if (!student) return;
    setAcessoError(null);
    setAcessoLoading("reenviar");
    try {
      const response = await fetch(`/api/admin/students/${student.id}/acesso`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Não foi possível gerar o link.");
      setCredenciais({ email: data.email, link: data.link, telefone: data.telefone });
    } catch (err) {
      setAcessoError(err instanceof Error ? err.message : "Erro ao gerar o link.");
    } finally {
      setAcessoLoading(null);
    }
  }

  async function handleExcluirAcesso() {
    if (!student) return;
    if (!confirm("Excluir o acesso desse responsável? Ele perde o login atual e você precisa cadastrar um novo.")) return;
    setAcessoError(null);
    setAcessoLoading("excluir");
    try {
      const response = await fetch(`/api/admin/students/${student.id}/acesso`, { method: "DELETE" });
      if (!response.ok) throw new Error("Não foi possível excluir o acesso.");
      setResponsavelNome("");
      setResponsavelTelefone("");
      router.refresh();
    } catch (err) {
      setAcessoError(err instanceof Error ? err.message : "Erro ao excluir o acesso.");
    } finally {
      setAcessoLoading(null);
    }
  }

  if (credenciais) {
    return (
      <TelaCredenciais
        credenciais={credenciais}
        onVoltar={() => {
          setCredenciais(null);
          if (!isEdit) {
            router.push("/admin/estudantes");
          } else {
            router.refresh();
          }
        }}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-amora-900/8 bg-white shadow-card">
      <div className="flex gap-1 overflow-x-auto border-b border-amora-900/8 px-3 pt-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-t-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
              tab === t.id ? "border-b-2 border-amora-700 text-amora-700" : "text-ink/40 hover:text-ink/70"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {tab === "dados" && (
          <div className="flex flex-col gap-4">
            <div>
              <span className="block text-sm font-medium text-ink/70">Foto</span>
              <div className="mt-1 flex items-center gap-4">
                {foto ? (
                  <img src={foto} alt="Prévia" className="h-20 w-20 rounded-full border border-ink/10 object-cover" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-ink/15 text-[10px] text-ink/30">
                    Sem foto
                  </div>
                )}
                <label className="cursor-pointer rounded-full border border-amora-900/15 px-4 py-2 text-sm font-semibold text-ink/70 hover:border-amora-600">
                  {processandoFoto ? "Processando..." : foto ? "Trocar" : "Escolher"}
                  <input type="file" accept="image/*" onChange={handleFotoChange} disabled={processandoFoto} className="hidden" />
                </label>
              </div>
            </div>

            <label className="block text-sm font-medium text-ink/70">
              Nome completo
              <input required value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm font-medium text-ink/70">
                Data de nascimento
                <input required type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} className={inputClass} />
              </label>
              <label className="block text-sm font-medium text-ink/70">
                CPF (opcional)
                <input value={cpf} onChange={(e) => setCpf(e.target.value)} className={inputClass} />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm font-medium text-ink/70">
                Data de matrícula
                <input required type="date" value={dataMatricula} onChange={(e) => setDataMatricula(e.target.value)} className={inputClass} />
              </label>
              <label className="block text-sm font-medium text-ink/70">
                Modalidade
                <select value={modalidade} onChange={(e) => setModalidade(e.target.value)} className={inputClass}>
                  {MODALIDADES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </label>
            </div>
            {isEdit && (
              <label className="block text-sm font-medium text-ink/70">
                Status
                <select value={status} onChange={(e) => setStatus(e.target.value as "ativo" | "inativo")} className={inputClass}>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </label>
            )}
          </div>
        )}

        {tab === "acesso" && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-ink/50">
              Login que o responsável usa pra acessar a Área da Família deste estudante.
            </p>

            {guardian ? (
              <div className="rounded-xl border border-amora-900/10 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-amora-700">Login já criado</p>
                <p className="mt-1 text-sm text-ink/70">{guardian.email}</p>
                <p className="mt-1 text-xs text-ink/40">
                  A senha é definida pelo próprio responsável — você não vê nem define a senha dele.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleReenviarLink}
                    disabled={acessoLoading !== null}
                    className="rounded-full border border-amora-900/15 px-4 py-2 text-xs font-semibold text-amora-700 disabled:opacity-60"
                  >
                    {acessoLoading === "reenviar" ? "Gerando..." : "Reenviar link de acesso"}
                  </button>
                  <button
                    type="button"
                    onClick={handleExcluirAcesso}
                    disabled={acessoLoading !== null}
                    className="rounded-full border border-rosa-200 px-4 py-2 text-xs font-semibold text-rosa-600 disabled:opacity-60"
                  >
                    {acessoLoading === "excluir" ? "Excluindo..." : "Excluir acesso e recriar"}
                  </button>
                </div>
                {acessoError && <p className="mt-2 text-xs font-medium text-rosa-600">{acessoError}</p>}
              </div>
            ) : (
              <>
                <p className="rounded-xl border border-dashed border-amora-900/15 bg-amora-50 p-3 text-xs text-amora-700">
                  Nenhum acesso criado ainda. Preencha o e-mail e o telefone abaixo e clique em{" "}
                  <strong>Salvar alterações</strong> pra criar.
                </p>

                <label className="block text-sm font-medium text-ink/70">
                  E-mail de acesso
                  <div className="mt-1 flex items-center overflow-hidden rounded-xl border border-amora-900/15 bg-white focus-within:border-amora-600">
                    <input
                      value={usuario}
                      onChange={(e) => {
                        setUsuario(e.target.value);
                        setUsuarioEditadoManualmente(true);
                      }}
                      className="min-w-0 flex-1 px-4 py-2.5 text-sm text-ink focus:outline-none"
                    />
                    <span className="shrink-0 pr-3 text-sm text-ink/40">@amoras.com</span>
                  </div>
                  <span className="mt-1 block text-xs text-ink/40">Sugerido a partir do nome do aluno — pode trocar.</span>
                </label>

                <label className="block text-sm font-medium text-ink/70">
                  Telefone (WhatsApp)
                  <input value={responsavelTelefone} onChange={(e) => setResponsavelTelefone(e.target.value)} className={inputClass} placeholder="(15) 90000-0000" />
                </label>

                <label className="block text-sm font-medium text-ink/70">
                  Nome do responsável (opcional)
                  <input value={responsavelNome} onChange={(e) => setResponsavelNome(e.target.value)} className={inputClass} />
                </label>
              </>
            )}
          </div>
        )}

        {tab === "mensalidade" && (
          <div className="flex flex-col gap-4">
            <label className="block text-sm font-medium text-ink/70">
              Dia de vencimento fixo (opcional)
              <input
                type="number"
                min="1"
                max="31"
                value={diaVencimento}
                onChange={(e) => setDiaVencimento(e.target.value)}
                placeholder="Ex: 18"
                className={inputClass}
              />
              <span className="mt-1 block text-xs text-ink/40">
                Todo mês a mensalidade vence nesse dia — usado só pra sugerir a data ao lançar uma nova parcela.
              </span>
            </label>

            <div className="border-t border-amora-900/10 pt-4">
              <p className="text-sm text-ink/50">
                {isEdit
                  ? "Preencha valor e vencimento pra lançar uma nova mensalidade — ela aparece direto em Financeiro → Mensalidades."
                  : "Lança a primeira mensalidade já na criação do estudante (opcional — dá pra fazer isso depois também)."}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-4">
                <label className="block text-sm font-medium text-ink/70">
                  Valor (R$)
                  <input type="number" step="0.01" min="0" value={valorMensalidade} onChange={(e) => setValorMensalidade(e.target.value)} className={inputClass} />
                </label>
                <label className="block text-sm font-medium text-ink/70">
                  Vencimento
                  <input type="date" value={vencimentoMensalidade} onChange={(e) => setVencimentoMensalidade(e.target.value)} className={inputClass} />
                </label>
              </div>
            </div>
          </div>
        )}

        {tab === "autorizados" && (
          <div>
            <p className="mb-3 text-sm text-ink/50">Pessoas autorizadas a buscar o estudante, além do responsável.</p>
            <div className="flex flex-col gap-3">
              {pessoasAutorizadas.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={p.nome}
                    onChange={(e) => updateAutorizado(i, "nome", e.target.value)}
                    placeholder="Nome"
                    className={inputClass}
                  />
                  <input
                    value={p.parentesco}
                    onChange={(e) => updateAutorizado(i, "parentesco", e.target.value)}
                    placeholder="Parentesco"
                    className={inputClass}
                  />
                  <button type="button" onClick={() => removeAutorizado(i)} className="shrink-0 rounded-lg p-2 text-ink/40 hover:bg-rosa-100 hover:text-rosa-600">
                    <HiOutlineTrash className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addAutorizado}
              className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-amora-700 hover:underline"
            >
              <HiOutlinePlus className="h-4 w-4" /> Adicionar pessoa autorizada
            </button>
          </div>
        )}

        {tab === "observacoes" && (
          <label className="block text-sm font-medium text-ink/70">
            Observações e informações administrativas
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={6}
              className={inputClass}
            />
          </label>
        )}

        {error && <p className="mt-4 text-sm font-medium text-rosa-600">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary mt-6 rounded-full px-6 py-3 font-display font-bold text-white disabled:opacity-60">
          {loading ? "Salvando..." : isEdit ? "Salvar alterações" : "Cadastrar estudante"}
        </button>
      </div>
    </form>
  );
}

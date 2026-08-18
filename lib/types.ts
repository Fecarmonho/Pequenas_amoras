export type StatusEstudante = "ativo" | "inativo";
export type CategoriaCobranca = "mensalidade" | "extra";
export type TipoCobranca = "mensalidade" | "diaria" | "atividade_especial" | "passeio" | "material" | "outros";
export type StatusCobranca = "pendente" | "pago";
/** Status "vencido" nunca é gravado — é sempre calculado a partir de
 * `status === "pendente" && vencimento < hoje` (ver lib/charge-status.ts). */
export type StatusCobrancaEfetivo = StatusCobranca | "vencido";

export interface Admin {
  uid: string;
  nome: string;
  email: string;
}

export interface PessoaAutorizada {
  nome: string;
  parentesco: string;
}

export interface Student {
  id: string;
  nome: string;
  foto?: string;
  dataNascimento: string;
  cpf?: string;
  dataMatricula: string;
  modalidade: string;
  observacoes?: string;
  /** Dia do mês (1-31) em que a mensalidade normalmente vence — usado só
   * pra sugerir a data ao lançar uma nova parcela, não é obrigatório. */
  diaVencimento?: number;
  /** IDs de `Guardian` que podem ver este estudante — a checagem de posse
   * (nunca confiar em ID vindo da URL) sempre olha esse array. */
  guardianIds: string[];
  /** Responsáveis legais do estudante (nome + parentesco) — pode ter mais
   * de um (ex: mãe e pai). Separado do acesso à Área da Família, que é um
   * login único por estudante. */
  responsaveis?: PessoaAutorizada[];
  pessoasAutorizadas: PessoaAutorizada[];
  status: StatusEstudante;
  createdAt: string;
  updatedAt: string;
}

export interface Guardian {
  id: string;
  /** uid do Firebase Auth, preenchido quando a conta de acesso é criada. */
  uid?: string;
  nome: string;
  cpf: string;
  telefone: string;
  whatsapp?: string;
  email: string;
  parentesco: string;
  studentIds: string[];
  createdAt: string;
}

export interface Boleto {
  pdfUrl?: string;
}

export interface Charge {
  id: string;
  studentId: string;
  categoria: CategoriaCobranca;
  tipo: TipoCobranca;
  /** Só para mensalidades, formato "YYYY-MM". */
  competencia?: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: StatusCobranca;
  pagoEm?: string;
  formaPagamento?: string;
  boleto?: Boleto;
  observacao?: string;
  createdAt: string;
}

export interface Banner {
  id: string;
  titulo: string;
  subtitulo?: string;
  descricao?: string;
  data?: string;
  imagem: string;
  imagemDesktop?: string;
  botaoTexto?: string;
  botaoLink?: string;
  ordem: number;
  ativo: boolean;
}

export type DestinatarioTipo = "todos" | "estudante" | "modalidade";

export interface Aviso {
  id: string;
  titulo: string;
  texto: string;
  imagem?: string;
  data: string;
  destinatario: {
    tipo: DestinatarioTipo;
    studentId?: string;
    modalidade?: string;
  };
  ativo: boolean;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  imagemUrl: string;
  legenda?: string;
  ordem: number;
  ativo: boolean;
}

export interface Configuracoes {
  nomeEscola: string;
  slogan: string;
  whatsapp: string;
  instagram: string;
  endereco: string;
  horarioAtendimento: string;
  textoInstitucional: string;
  /** Chave PIX única usada em todos os recibos — não é mais por cobrança. */
  chavePix?: string;
  // Seção "Fundadora" da home — só aparece no site se nome e história
  // estiverem preenchidos (ver components/FounderSection.tsx).
  fundadoraNome?: string;
  fundadoraFoto?: string;
  fundadoraHistoria?: string;
}

export interface AuditLog {
  id: string;
  actorEmail: string;
  acao: string;
  entidade: string;
  entidadeId: string;
  timestamp: string;
  detalhes?: string;
}

export const MODALIDADES = ["Contraturno Escolar", "Recreação Infantil"] as const;
export const TIPOS_COBRANCA_EXTRA: { value: TipoCobranca; label: string }[] = [
  { value: "diaria", label: "Diária" },
  { value: "atividade_especial", label: "Atividade especial" },
  { value: "passeio", label: "Passeio" },
  { value: "material", label: "Material" },
  { value: "outros", label: "Outros" },
];

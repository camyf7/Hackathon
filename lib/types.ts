// Modelo de dados do Trilha+ (persistido em localStorage)

export type Raridade = "comum" | "raro" | "epico" | "lendario"

export type Dificuldade = "facil" | "media" | "dificil"
export type DificuldadeMissao = Dificuldade

export type StatusMissao =
  | "bloqueada"
  | "nao_iniciada"
  | "em_andamento"
  | "concluida"
  | "perfeita"

export type TipoAtividade =
  | "lista"
  | "quiz"
  | "questionario"
  | "pdf"
  | "video"
  | "link"
  | "google_forms"
  | "arquivo"
  | "projeto"
  | "desafio"
  | "entrega"
  | "apresentacao"
  | "missao_especial"

export type CategoriaRecompensa =
  | "ponto_extra"
  | "cinema"
  | "dia_sem_uniforme"
  | "certificado"
  | "material"  

export interface Escola {
  id: string
  nome: string
}

export interface Turma {
  id: string
  escola_id: string
  professor_id?: string
  nome: string
  serie: string
  criada_em?: string
}

export interface Professor {
  id: string
  nome: string
  email: string
  senha: string
  criado_em: string
}

export interface Aluno {
  id: string
  nome: string
  turma_id: string
  avatar: string
  xp_total: number
  nivel: number
  streak_dias: number
  squad_id: string | null
  tempo_tela_minutos_hoje: number
  tempo_tela_minutos_semana: number
  tem_dispositivo_proprio: boolean
  banners_desbloqueados: string[]
  banner_equipado: string | null
  cores_nome_desbloqueadas: string[]
  cor_nome_equipada: string | null
  badges: string[]
  ultima_presenca: string | null
  recompensas_resgatadas: number[]
  icones_desbloqueados: string[]
  icone_selecionado: string
  missoes_diarias_data?: string
  missoes_diarias_concluidas?: string[]
  missoes_semanais_concluidas?: string[]
  boss_concluidos?: string[]
}

export type TipoSquad = "dupla" | "trio" | "squad"

export interface Squad {
  id: string
  turma_id: string
  nome: string
  tipo: TipoSquad
  alunos_ids: string[]
  xp_coletivo: number
  emoji: string
}

export type TipoExercicio = "multipla" | "completar" | "associar"

export interface Exercicio {
  id: string
  trilha_id: string
  nivel: number
  tipo: TipoExercicio
  pergunta: string
  opcoes: string[]
  resposta_correta: number
  xp_recompensa: number
}

export interface Trilha {
  id: string
  nome: string
  emoji: string
  cor: string
  niveis: number
  exercicios: Exercicio[]
}

export interface ProgressoTrilha {
  aluno_id: string
  trilha_id: string
  nivel_atual: number
  exercicios_completos: string[]
}

export interface Presenca {
  aluno_id: string
  data: string
  presente: boolean
  justificada: boolean
}

export interface Banner {
  id: string
  nome: string
  raridade: Raridade
  custo_xp: number
  gradiente: string
}

export interface CorNome {
  id: string
  nome: string
  raridade: Raridade
  custo_xp: number
  classe: string
}

export type StatusResgate = "pendente" | "aprovada" | "negada"

export interface RecompensaReal {
  id: string
  nome: string
  emoji: string
  criterio_xp: number
}

export interface Resgate {
  id: string
  recompensa_id: string
  solicitante_id: string
  solicitante_tipo: "aluno" | "squad"
  turma_id: string
  status: StatusResgate
  data: string
}

export interface Recompensa {
  id: string
  turma_id: string
  nome: string
  descricao: string
  categoria: CategoriaRecompensa
  imagem: string | null
  custo_xp: number
  quantidade: number
  status: "ativa" | "inativa"
  criada_em: string
}

export interface Missao {
  id: string
  turma_id: string
  squad_id: string | null
  titulo: string
  descricao: string
  xp_recompensa: number
  concluida: boolean
}

export interface AnexoAtividade {
  id: string
  nome: string
  tipo: string
}

export interface Atividade {
  id: string
  turma_id: string
  trilha_id: string
  missao_id: string
  titulo: string
  descricao: string
  tipo: TipoAtividade
  prazo: string | null
  xp: number
  dificuldade: Dificuldade
  anexos: AnexoAtividade[]
  obrigatoria: boolean
  professor_nome: string
  criada_em: string
  status: "aberta" | "encerrada"
  alunos_concluidos: string[]
  tipo_resposta: "multipla_escolha" | "escrita"
   pergunta?: string
   opcoes?: string[]          // só quando multipla_escolha
    resposta_correta?: string  // texto da opção certa  <-- AINDA É NUMBER AQUI
}

export interface DB {
  escolas: Escola[]
  turmas: Turma[]
  professores: Professor[]
  alunos: Aluno[]
  squads: Squad[]
  trilhas: Trilha[]
  progresso: ProgressoTrilha[]
  presencas: Presenca[]
  banners: Banner[]
  cores_nome: CorNome[]
  recompensas: Recompensa[]
  recompensas_reais: RecompensaReal[]
  resgates: Resgate[]
  missoes: Missao[]
  atividades: Atividade[]
  data_atual: string
}
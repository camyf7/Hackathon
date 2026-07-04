// Modelo de dados do Trilha+ (persistido em localStorage)

export type Raridade = "comum" | "raro" | "epico" | "lendario"

export interface Escola {
  id: string
  nome: string
}

export interface Turma {
  id: string
  escola_id: string
  nome: string // ex: "6º A"
  serie: string // ex: "6º ano"
}

export interface Aluno {
  id: string
  nome: string
  turma_id: string
  avatar: string // emoji/ilustração simples
  xp_total: number
  nivel: number
  streak_dias: number
  squad_id: string | null
  tempo_tela_minutos_hoje: number
  tempo_tela_minutos_semana: number
  tem_dispositivo_proprio: boolean // uso interno de simulação, nunca exibido
  banners_desbloqueados: string[] // ids de banners de perfil
  banner_equipado: string | null
  badges: string[] // ids de badges
  ultima_presenca: string | null // data ISO (yyyy-mm-dd)
  // Trilha de Recompensas: ícones de perfil desbloqueados por nível (mesmo xp_total do aluno)
  recompensas_resgatadas: number[] // ids das recompensas já resgatadas
  icones_desbloqueados: string[] // ids de ícones já no inventário (inclui "default")
  icone_selecionado: string // id do ícone em uso como foto de perfil
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
  resposta_correta: number // índice
  xp_recompensa: number
}

export interface Trilha {
  id: string
  nome: string
  emoji: string
  cor: string // token de cor (ex: "green")
  niveis: number // quantidade de níveis
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
  data: string // yyyy-mm-dd
  presente: boolean
  justificada: boolean
}

// Recompensa dentro do jogo: banner de perfil com raridade
export interface Banner {
  id: string
  nome: string
  raridade: Raridade
  custo_xp: number // XP total necessário para desbloquear
  gradiente: string // classe css de background
}

export type StatusResgate = "pendente" | "aprovada" | "negada"

export interface RecompensaReal {
  id: string
  nome: string
  emoji: string
  criterio_xp: number // XP necessário para poder solicitar
}

export interface Resgate {
  id: string
  recompensa_id: string
  solicitante_id: string // aluno ou squad
  solicitante_tipo: "aluno" | "squad"
  turma_id: string
  status: StatusResgate
  data: string
}

export interface Missao {
  id: string
  turma_id: string
  squad_id: string | null // null = turma inteira
  titulo: string
  descricao: string
  xp_recompensa: number
  concluida: boolean
}

export interface DB {
  escolas: Escola[]
  turmas: Turma[]
  alunos: Aluno[]
  squads: Squad[]
  trilhas: Trilha[]
  progresso: ProgressoTrilha[]
  presencas: Presenca[]
  banners: Banner[]
  recompensas_reais: RecompensaReal[]
  resgates: Resgate[]
  missoes: Missao[]
  data_atual: string // yyyy-mm-dd (simulada)
}

export interface Atividade {
  id: string
  turma_id: string
  trilha_id: string
  titulo: string
  descricao: string 
  nivel_alvo: number
  prazo: string | null // yyyy-mm-dd, opcional
  xp_bonus: number
  criada_em: string
  status: "aberta" | "encerrada"
  alunos_concluidos: string[]
}

export interface DB {
  escolas: Escola[]
  turmas: Turma[]
  alunos: Aluno[]
  squads: Squad[]
  trilhas: Trilha[]
  progresso: ProgressoTrilha[]
  presencas: Presenca[]
  banners: Banner[]
  recompensas_reais: RecompensaReal[]
  resgates: Resgate[]
  missoes: Missao[]
  atividades: Atividade[]
  data_atual: string
}
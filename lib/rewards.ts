// Catálogo de recompensas da Trilha de Recompensas.
// Cada recompensa é um ícone de perfil desbloqueado ao atingir um nível.

export type IconeId =
  | "default"
  | "shield"
  | "star"
  | "book"
  | "medal"
  | "rocket"
  | "crown"
  | "lightbulb"
  | "gem"
  | "trophy"
  | "planet"
  | "bolt"
  | "mountain"

export interface Recompensa {
  id: number
  nivelNecessario: number
  nome: string
  icone: IconeId
}

/** Ícone padrão que todo aluno já possui, mesmo sem resgatar nada. */
export const ICONE_PADRAO: IconeId = "default"

export const RECOMPENSAS: Recompensa[] = [
  { id: 1, nivelNecessario: 2, nome: "Boboo Azul", icone: "shield" },
  { id: 2, nivelNecessario: 3, nome: "Raposa Dourada", icone: "star" },
  { id: 3, nivelNecessario: 4, nome: "purple owl", icone: "book" },
  { id: 4, nivelNecessario: 5, nome: "little white", icone: "medal" },
  { id: 5, nivelNecessario: 6, nome: "Polvete", icone: "rocket" },
  { id: 6, nivelNecessario: 7, nome: "Wolf", icone: "crown" },
  { id: 7, nivelNecessario: 8, nome: "Mr. P", icone: "lightbulb" },
  { id: 8, nivelNecessario: 9, nome: "spotted", icone: "gem" },
  { id: 9, nivelNecessario: 10, nome: "Robot", icone: "trophy" },
  { id: 10, nivelNecessario: 11, nome: "Faisca", icone: "planet" },
  { id: 11, nivelNecessario: 12, nome: "Saturnito", icone: "bolt" },
  { id: 12, nivelNecessario: 13, nome: "Pascal ", icone: "mountain" },
]

export function recompensaPorId(id: number): Recompensa | undefined {
  return RECOMPENSAS.find((r) => r.id === id)
}

export type EstadoRecompensa = "bloqueada" | "disponivel" | "resgatada"

export function estadoDaRecompensa(
  recompensa: Recompensa,
  nivelAtual: number,
  claimedRewards: number[] = [],
): EstadoRecompensa {
  if (claimedRewards?.includes(recompensa.id)) return "resgatada"
  if (nivelAtual >= recompensa.nivelNecessario) return "disponivel"
  return "bloqueada"
}

/**
 * Paleta temática por ícone. Cada recompensa "puxa" uma cor que remete ao
 * próprio objeto (escudo = azul, estrela/troféu = dourado, diamante = ciano,
 * foguete = laranja-vermelho, etc.), mantendo o restante da interface nos
 * tokens do projeto (bg-card, border-border, text-muted-foreground, ...).
 *
 * bg / text / ring: usados nos estados "disponível" e "resgatada" do card.
 * solid: cor cheia, usada em barras, badges ou pequenos detalhes.
 */
export interface TemaRecompensa {
  bg: string
  text: string
  ring: string
  solid: string
}

export const CORES_RECOMPENSA: Record<IconeId, TemaRecompensa> = {
  default: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    ring: "ring-border",
    solid: "bg-muted-foreground",
  },
  shield: {
    bg: "bg-[#3B82F6]/12",
    text: "text-[#2563EB]",
    ring: "ring-[#3B82F6]/30",
    solid: "bg-[#3B82F6]",
  },
  star: {
    bg: "bg-[#F59E0B]/12",
    text: "text-[#D97706]",
    ring: "ring-[#F59E0B]/30",
    solid: "bg-[#F59E0B]",
  },
  book: {
    bg: "bg-[#92400E]/12",
    text: "text-[#92400E]",
    ring: "ring-[#92400E]/30",
    solid: "bg-[#92400E]",
  },
  medal: {
    bg: "bg-[#B45309]/12",
    text: "text-[#B45309]",
    ring: "ring-[#B45309]/30",
    solid: "bg-[#B45309]",
  },
  rocket: {
    bg: "bg-[#EF4444]/12",
    text: "text-[#DC2626]",
    ring: "ring-[#EF4444]/30",
    solid: "bg-[#EF4444]",
  },
  crown: {
    bg: "bg-[#9333EA]/12",
    text: "text-[#7E22CE]",
    ring: "ring-[#9333EA]/30",
    solid: "bg-[#9333EA]",
  },
  lightbulb: {
    bg: "bg-[#FACC15]/15",
    text: "text-[#CA8A04]",
    ring: "ring-[#FACC15]/30",
    solid: "bg-[#FACC15]",
  },
  gem: {
    bg: "bg-[#06B6D4]/12",
    text: "text-[#0891B2]",
    ring: "ring-[#06B6D4]/30",
    solid: "bg-[#06B6D4]",
  },
  trophy: {
    bg: "bg-[#EAB308]/12",
    text: "text-[#A16207]",
    ring: "ring-[#EAB308]/30",
    solid: "bg-[#EAB308]",
  },
  planet: {
    bg: "bg-[#6366F1]/12",
    text: "text-[#4F46E5]",
    ring: "ring-[#6366F1]/30",
    solid: "bg-[#6366F1]",
  },
  bolt: {
    bg: "bg-[#FBBF24]/15",
    text: "text-[#D97706]",
    ring: "ring-[#FBBF24]/30",
    solid: "bg-[#FBBF24]",
  },
  mountain: {
    bg: "bg-[#16A34A]/12",
    text: "text-[#15803D]",
    ring: "ring-[#16A34A]/30",
    solid: "bg-[#16A34A]",
  },
}

export function temaDoIcone(icone: IconeId): TemaRecompensa {
  return CORES_RECOMPENSA[icone] ?? CORES_RECOMPENSA.default
}
// lib/rewards.ts
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
  { id: 1, nivelNecessario: 2, nome: "Escudo Azul", icone: "shield" },
  { id: 2, nivelNecessario: 3, nome: "Estrela Dourada", icone: "star" },
  { id: 3, nivelNecessario: 4, nome: "Livro do Saber", icone: "book" },
  { id: 4, nivelNecessario: 5, nome: "Medalha de Mérito", icone: "medal" },
  { id: 5, nivelNecessario: 6, nome: "Foguete", icone: "rocket" },
  { id: 6, nivelNecessario: 7, nome: "Coroa", icone: "crown" },
  { id: 7, nivelNecessario: 8, nome: "Lâmpada de Ideias", icone: "lightbulb" },
  { id: 8, nivelNecessario: 9, nome: "Diamante", icone: "gem" },
  { id: 9, nivelNecessario: 10, nome: "Troféu", icone: "trophy" },
  { id: 10, nivelNecessario: 11, nome: "Planeta", icone: "planet" },
  { id: 11, nivelNecessario: 12, nome: "Raio", icone: "bolt" },
  { id: 12, nivelNecessario: 13, nome: "Montanha", icone: "mountain" },
]

export function recompensaPorId(id: number): Recompensa | undefined {
  return RECOMPENSAS.find((r) => r.id === id)
}

export type EstadoRecompensa = "bloqueada" | "disponivel" | "resgatada"

export function estadoDaRecompensa(
  recompensa: Recompensa,
  nivelAtual: number,
  claimedRewards: number[],
): EstadoRecompensa {
  if (claimedRewards.includes(recompensa.id)) return "resgatada"
  if (nivelAtual >= recompensa.nivelNecessario) return "disponivel"
  return "bloqueada"
}

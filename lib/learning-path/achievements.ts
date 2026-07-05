export interface ConquistaDef {
  id: string
  nome: string
  descricao: string
  emoji: string
  categoria: "progresso" | "streak" | "disciplina" | "social" | "especial"
  cor: string
  xpBonus: number
}

export const CONQUISTAS: ConquistaDef[] = [
  { id: "primeira_missao", nome: "Primeira Missão", descricao: "Concluiu sua primeira missão.", emoji: "🎯", categoria: "progresso", cor: "blue", xpBonus: 20 },
  { id: "primeiro_100", nome: "Perfeição", descricao: "Acertou 100% em uma missão.", emoji: "💯", categoria: "progresso", cor: "gold", xpBonus: 50 },
  { id: "streak_3", nome: "Em Chamas", descricao: "3 dias seguidos de estudo.", emoji: "🔥", categoria: "streak", cor: "orange", xpBonus: 30 },
  { id: "streak_7", nome: "Semana de Ouro", descricao: "7 dias consecutivos.", emoji: "⚡", categoria: "streak", cor: "yellow", xpBonus: 80 },
  { id: "streak_30", nome: "Imparável", descricao: "30 dias de sequência.", emoji: "🌟", categoria: "streak", cor: "purple", xpBonus: 200 },
  { id: "matematico", nome: "Matemático", descricao: "Completou um módulo de Matemática.", emoji: "🔢", categoria: "disciplina", cor: "blue", xpBonus: 100 },
  { id: "historiador", nome: "Historiador", descricao: "Completou um módulo de História.", emoji: "🏛️", categoria: "disciplina", cor: "purple", xpBonus: 100 },
  { id: "leitor", nome: "Leitor", descricao: "Completou um módulo de Português.", emoji: "📚", categoria: "disciplina", cor: "green", xpBonus: 100 },
  { id: "explorador", nome: "Explorador", descricao: "Visitou 3 mundos diferentes.", emoji: "🧭", categoria: "disciplina", cor: "teal", xpBonus: 60 },
  { id: "persistente", nome: "Persistente", descricao: "Retomou após errar 3 vezes.", emoji: "💪", categoria: "progresso", cor: "red", xpBonus: 40 },
  { id: "lenda", nome: "Lenda", descricao: "Alcançou o nível 10.", emoji: "👑", categoria: "especial", cor: "gold", xpBonus: 500 },
  { id: "mestre", nome: "Mestre", descricao: "Completou 3 Boss Challenges.", emoji: "🐉", categoria: "especial", cor: "purple", xpBonus: 300 },
  { id: "velocista", nome: "Velocista", descricao: "Entregou antes do prazo.", emoji: "🏎️", categoria: "progresso", cor: "cyan", xpBonus: 40 },
  { id: "colaborador", nome: "Colaborador", descricao: "Ajudou um colega do squad.", emoji: "🤝", categoria: "social", cor: "pink", xpBonus: 20 },
  { id: "foco", nome: "Foco", descricao: "Concluiu 3 etapas em um dia.", emoji: "🎯", categoria: "progresso", cor: "blue", xpBonus: 50 },
  { id: "destaque", nome: "Destaque", descricao: "Acertou 90%+ em uma missão.", emoji: "⭐", categoria: "progresso", cor: "purple", xpBonus: 75 },
]

export const CONQUISTAS_MAP = Object.fromEntries(CONQUISTAS.map((c) => [c.id, c])) as Record<string, ConquistaDef>

export function getConquistasDesbloqueadas(badgeIds: string[]): ConquistaDef[] {
  return CONQUISTAS.filter((c) => badgeIds.includes(c.id))
}

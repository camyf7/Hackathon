import type { Raridade } from "./types"

export const XP_POR_NIVEL = 200
export const META_TELA_DIARIA = 5 // minutos saudáveis por dia

export function nivelDoXp(xp: number): number {
  return Math.floor(xp / XP_POR_NIVEL) + 1
}

export function xpNoNivel(xp: number): number {
  return xp % XP_POR_NIVEL
}

export function xpParaProximoNivel(): number {
  return XP_POR_NIVEL
}

export function progressoNivel(xp: number): number {
  return Math.round((xpNoNivel(xp) / XP_POR_NIVEL) * 100)
}

export function hojeISO(base?: string): string {
  const d = base ? new Date(base + "T12:00:00") : new Date()
  return d.toISOString().slice(0, 10)
}

export function adicionarDias(dataISO: string, dias: number): string {
  const d = new Date(dataISO + "T12:00:00")
  d.setDate(d.getDate() + dias)
  return d.toISOString().slice(0, 10)
}

export function formatarDataCurta(dataISO: string): string {
  const d = new Date(dataISO + "T12:00:00")
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
}

export const RARIDADE_INFO: Record<
  Raridade,
  { nome: string; classe: string; texto: string; borda: string }
> = {
  comum: {
    nome: "Comum",
    classe: "bg-slate-200 text-slate-700",
    texto: "text-slate-600",
    borda: "border-slate-300",
  },
  raro: {
    nome: "Raro",
    classe: "bg-brand-turquoise/20 text-cyan-700",
    texto: "text-cyan-700",
    borda: "border-brand-turquoise",
  },
  epico: {
    nome: "Épico",
    classe: "bg-brand-purple/20 text-brand-purple",
    texto: "text-brand-purple",
    borda: "border-brand-purple",
  },
  lendario: {
    nome: "Lendário",
    classe: "bg-brand-gold/25 text-amber-700",
    texto: "text-amber-700",
    borda: "border-brand-gold",
  },
}

export const RARIDADE_ORDEM: Raridade[] = ["comum", "raro", "epico", "lendario"]

// Badges disponíveis (desbloqueiam automaticamente)
export const BADGES: Record<string, { nome: string; emoji: string; desc: string }> = {
  primeiro_passo: { nome: "Primeiro Passo", emoji: "👟", desc: "Completou o 1º exercício" },
  streak_3: { nome: "Pegando Fogo", emoji: "🔥", desc: "3 dias de streak" },
  streak_7: { nome: "Semana Cheia", emoji: "⚡", desc: "7 dias de streak" },
  nivel_5: { nome: "Escalador", emoji: "🚀", desc: "Alcançou o nível 5" },
  mil_xp: { nome: "Milionário de XP", emoji: "💎", desc: "1000 XP acumulados" },
  colaborador: { nome: "Colega Nota 10", emoji: "🤝", desc: "Ajudou o squad" },
}

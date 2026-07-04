// lib/levels.ts
// Regras de progressão de nível da Trilha de Recompensas.
// Fórmula própria e progressiva: cada nível seguinte exige mais XP que o anterior.

/** XP base exigido para sair do nível 1 rumo ao nível 2. */
const BASE_XP = 500
/** Incremento de XP que cada nível adiciona ao custo do próximo. */
const GROWTH_STEP = 150
/** Maior nível considerado pela trilha (alinhado à quantidade de recompensas). */
export const NIVEL_MAXIMO = 13

/** XP necessário para avançar do nível `nivel` para o `nivel + 1`. */
export function xpParaAvancar(nivel: number): number {
  if (nivel < 1) return 0
  return BASE_XP + GROWTH_STEP * (nivel - 1)
}

/** XP total acumulado necessário para alcançar exatamente o nível informado. */
export function xpTotalParaNivel(nivel: number): number {
  if (nivel <= 1) return 0
  const n = nivel - 1
  // soma progressiva: BASE_XP*n + GROWTH_STEP*n*(n-1)/2
  return BASE_XP * n + (GROWTH_STEP * n * (n - 1)) / 2
}

/** Descobre o nível atual a partir do XP acumulado. */
export function nivelPorXp(xp: number): number {
  let nivel = 1
  while (nivel < NIVEL_MAXIMO && xp >= xpTotalParaNivel(nivel + 1)) {
    nivel += 1
  }
  return nivel
}

export interface ProgressoNivel {
  nivel: number
  xpAtual: number
  xpBaseDoNivel: number
  xpParaProximoNivel: number
  xpNoNivelAtual: number
  percentual: number
  nivelMaximoAtingido: boolean
}

/** Calcula todos os dados de progresso necessários para renderizar a barra de XP. */
export function calcularProgresso(xpTotal: number): ProgressoNivel {
  const nivel = nivelPorXp(xpTotal)
  const xpBaseDoNivel = xpTotalParaNivel(nivel)
  const nivelMaximoAtingido = nivel >= NIVEL_MAXIMO
  const proximoAlvo = nivelMaximoAtingido
    ? xpBaseDoNivel
    : xpTotalParaNivel(nivel + 1)
  const xpNecessarioNoNivel = proximoAlvo - xpBaseDoNivel
  const xpNoNivelAtual = xpTotal - xpBaseDoNivel
  const percentual = nivelMaximoAtingido
    ? 100
    : Math.min(100, Math.round((xpNoNivelAtual / xpNecessarioNoNivel) * 100))

  return {
    nivel,
    xpAtual: xpTotal,
    xpBaseDoNivel,
    xpParaProximoNivel: proximoAlvo,
    xpNoNivelAtual,
    percentual,
    nivelMaximoAtingido,
  }
}

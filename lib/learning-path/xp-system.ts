export const XP_REWARDS = {
  loginDiario: 10,
  checkin: 20,
  concluirAtividade: 50,
  acertarTudo: 100,
  entregarAntes: 40,
  ajudarColega: 20,
  sequenciaSemanal: 150,
  completarModulo: 300,
  bossChallenge: 300,
} as const

export const LEVEL_THRESHOLDS = [
  0, 500, 1200, 2500, 4000, 6000, 8500, 11500, 15000, 19000, 24000,
]

export function nivelDoXpProgressivo(xp: number): number {
  let nivel = 1
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      nivel = i + 1
      break
    }
  }
  return nivel
}

export function xpParaProximoNivelProgressivo(xp: number): { atual: number; necessario: number; progresso: number } {
  const nivel = nivelDoXpProgressivo(xp)
  const base = LEVEL_THRESHOLDS[nivel - 1] ?? 0
  const proximo = LEVEL_THRESHOLDS[nivel] ?? base + 5000
  const atual = xp - base
  const necessario = proximo - base
  const progresso = necessario > 0 ? Math.round((atual / necessario) * 100) : 100
  return { atual, necessario, progresso }
}

export function xpFaltandoParaNivel(xp: number): number {
  const nivel = nivelDoXpProgressivo(xp)
  const proximo = LEVEL_THRESHOLDS[nivel]
  if (proximo === undefined) return 0
  return Math.max(0, proximo - xp)
}

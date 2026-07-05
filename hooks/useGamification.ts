import { useMemo } from "react"
import type { Aluno } from "@/lib/types"
import { CONQUISTAS, CONQUISTAS_MAP } from "@/lib/learning-path/achievements"
import { nivelDoXpProgressivo, xpParaProximoNivelProgressivo } from "@/lib/learning-path/xp-system"

export function useGamification(aluno: Aluno) {
  return useMemo(() => {
    const nivel = nivelDoXpProgressivo(aluno.xp_total)
    const xpInfo = xpParaProximoNivelProgressivo(aluno.xp_total)
    const conquistasDesbloqueadas = CONQUISTAS.filter((c) => aluno.badges.includes(c.id))
    const conquistasBloqueadas = CONQUISTAS.filter((c) => !aluno.badges.includes(c.id))

    return {
      nivel,
      xpInfo,
      conquistasDesbloqueadas,
      conquistasBloqueadas,
      streak: aluno.streak_dias,
      xpTotal: aluno.xp_total,
    }
  }, [aluno])
}

export function getConquista(id: string) {
  return CONQUISTAS_MAP[id]
}

export interface MissaoDiariaDef {
  id: string
  titulo: string
  descricao: string
  xp: number
  icone: string
}

export interface MissaoSemanalDef {
  id: string
  titulo: string
  descricao: string
  xp: number
  icone: string
}

const MISSOES_DIARIAS_POOL: Omit<MissaoDiariaDef, "id">[] = [
  { titulo: "Faça uma atividade", descricao: "Complete qualquer atividade da trilha.", xp: 50, icone: "📋" },
  { titulo: "Complete uma revisão", descricao: "Revise uma missão já concluída.", xp: 20, icone: "🔄" },
  { titulo: "Leia um material", descricao: "Abra e leia um PDF ou link.", xp: 10, icone: "📖" },
  { titulo: "Check-in na escola", descricao: "Registre sua presença hoje.", xp: 20, icone: "🏫" },
  { titulo: "Acerte um quiz", descricao: "Responda corretamente um exercício.", xp: 30, icone: "✅" },
]

const MISSOES_SEMANAIS_POOL: Omit<MissaoSemanalDef, "id">[] = [
  { titulo: "Complete 5 atividades", descricao: "Conclua 5 atividades esta semana.", xp: 500, icone: "🎯" },
  { titulo: "Ganhe 500 XP", descricao: "Acumule 500 XP na semana.", xp: 150, icone: "⚡" },
  { titulo: "Resolva um desafio", descricao: "Complete uma missão de dificuldade alta.", xp: 200, icone: "🏆" },
  { titulo: "Conclua um módulo", descricao: "Finalize todas as missões de uma disciplina.", xp: 300, icone: "🌟" },
]

function hashDia(data: string): number {
  let h = 0
  for (let i = 0; i < data.length; i++) h = (h * 31 + data.charCodeAt(i)) >>> 0
  return h
}

export function useDailyMissions(aluno: Aluno, dataAtual: string) {
  return useMemo(() => {
    const seed = hashDia(dataAtual)
    const diarias: MissaoDiariaDef[] = [0, 1, 2].map((i) => ({
      id: `daily-${dataAtual}-${i}`,
      ...MISSOES_DIARIAS_POOL[(seed + i) % MISSOES_DIARIAS_POOL.length],
    }))

    const semanais: MissaoSemanalDef[] = [0, 1].map((i) => ({
      id: `weekly-${dataAtual.slice(0, 7)}-${i}`,
      ...MISSOES_SEMANAIS_POOL[(seed + i) % MISSOES_SEMANAIS_POOL.length],
    }))

    const concluidasDiarias = aluno.missoes_diarias_concluidas ?? []
    const concluidasSemanais = aluno.missoes_semanais_concluidas ?? []
    const dataSalva = aluno.missoes_diarias_data ?? ""

    const diariasAtivas = dataSalva === dataAtual ? diarias : diarias
    const diariasConcluidas = dataSalva === dataAtual ? concluidasDiarias : []

    return {
      diarias: diariasAtivas.map((m) => ({
        ...m,
        concluida: diariasConcluidas.includes(m.id),
      })),
      semanais: semanais.map((m) => ({
        ...m,
        concluida: concluidasSemanais.includes(m.id),
      })),
    }
  }, [aluno, dataAtual])
}

import { useMemo } from "react"
import type { Aluno, Atividade, Exercicio, ProgressoTrilha, StatusMissao } from "@/lib/types"
import { getMissoesTrilha, type MissaoTrilhaDef } from "@/lib/learning-path/missions"
import { SUBJECT_WORLDS } from "@/lib/learning-path/subjects"

export interface MissaoStatusInfo extends MissaoTrilhaDef {
  status: StatusMissao
  progresso: number
  atividades: Atividade[]
  exercicio: Exercicio | null
  desbloqueada: boolean
}

function calcularStatusMissao(
  missao: MissaoTrilhaDef,
  prog: ProgressoTrilha | undefined,
  atividades: Atividade[],
  alunoId: string,
  missaoAnteriorConcluida: boolean,
): { status: StatusMissao; progresso: number; desbloqueada: boolean } {
  if (!missaoAnteriorConcluida && missao.ordem > 1) {
    return { status: "bloqueada", progresso: 0, desbloqueada: false }
  }

  const exercicioOk =
    missao.exercicioNivel === null ||
    (prog && (prog.nivel_atual > missao.exercicioNivel || prog.exercicios_completos.some((id) => id.includes(`-n${missao.exercicioNivel}-`))))

  const atividadesObrigatorias = atividades.filter((a) => a.obrigatoria && a.status === "aberta")
  const atividadesOk =
    atividadesObrigatorias.length === 0 ||
    atividadesObrigatorias.every((a) => a.alunos_concluidos.includes(alunoId))

  const totalItens = (missao.exercicioNivel !== null ? 1 : 0) + atividadesObrigatorias.length
  let completos = 0
  if (exercicioOk && missao.exercicioNivel !== null) completos++
  completos += atividadesObrigatorias.filter((a) => a.alunos_concluidos.includes(alunoId)).length

  const progresso = totalItens > 0 ? Math.round((completos / totalItens) * 100) : exercicioOk ? 100 : 0

  if (missao.isBoss && !exercicioOk && atividadesObrigatorias.length === 0) {
    const missoesAnteriores = missao.ordem - 1
    if (prog && prog.nivel_atual <= missoesAnteriores) {
      return { status: "bloqueada", progresso: 0, desbloqueada: false }
    }
  }

  if (progresso >= 100) {
    return { status: "concluida", progresso: 100, desbloqueada: true }
  }

  if (progresso > 0 || (prog && missao.exercicioNivel !== null && prog.nivel_atual === missao.exercicioNivel)) {
    return { status: "em_andamento", progresso, desbloqueada: true }
  }

  return { status: missao.ordem === 1 ? "nao_iniciada" : "nao_iniciada", progresso, desbloqueada: true }
}

export function useLearningPath(
  aluno: Aluno,
  trilhaId: string,
  atividades: Atividade[],
  progresso: ProgressoTrilha[],
  exercicios: Exercicio[],
) {
  return useMemo(() => {
    const prog = progresso.find((p) => p.aluno_id === aluno.id && p.trilha_id === trilhaId)
    const missoesDef = getMissoesTrilha(trilhaId)
    const atividadesTrilha = atividades.filter(
      (a) => a.trilha_id === trilhaId && a.turma_id === aluno.turma_id && a.status === "aberta",
    )

    const missoes: MissaoStatusInfo[] = []
    let anteriorConcluida = true

    for (const missao of missoesDef) {
      const atividadesMissao = atividadesTrilha.filter((a) => a.missao_id === missao.id)
      const exercicio =
        missao.exercicioNivel !== null
          ? exercicios.find((e) => e.trilha_id === trilhaId && e.nivel === missao.exercicioNivel) ?? null
          : null

      const { status, progresso: progPct, desbloqueada } = calcularStatusMissao(
        missao,
        prog,
        atividadesMissao,
        aluno.id,
        anteriorConcluida,
      )

      missoes.push({
        ...missao,
        status: desbloqueada ? status : "bloqueada",
        progresso: progPct,
        atividades: atividadesMissao,
        exercicio,
        desbloqueada,
      })

      anteriorConcluida = status === "concluida"
    }

    const concluidas = missoes.filter((m) => m.status === "concluida").length
    const progressoGeral = missoes.length > 0 ? Math.round((concluidas / missoes.length) * 100) : 0
    const missaoAtual = missoes.find((m) => m.status === "em_andamento") ?? missoes.find((m) => m.desbloqueada && m.status !== "concluida" && m.status !== "bloqueada")

    return { missoes, progressoGeral, missaoAtual, concluidas, total: missoes.length }
  }, [aluno, trilhaId, atividades, progresso, exercicios])
}

export function useSubjectProgress(
  aluno: Aluno,
  atividades: Atividade[],
  progresso: ProgressoTrilha[],
  exercicios: Exercicio[],
) {
  return useMemo(() => {
    return SUBJECT_WORLDS.map((world) => {
      const prog = progresso.find((p) => p.aluno_id === aluno.id && p.trilha_id === world.trilhaId)
      const missoes = getMissoesTrilha(world.trilhaId)
      const atividadesTrilha = atividades.filter(
        (a) => a.trilha_id === world.trilhaId && a.turma_id === aluno.turma_id,
      )

      let concluidas = 0
      let anteriorConcluida = true
      for (const missao of missoes) {
        const atividadesMissao = atividadesTrilha.filter((a) => a.missao_id === missao.id)
        const { status, desbloqueada } = calcularStatusMissao(missao, prog, atividadesMissao, aluno.id, anteriorConcluida)
        if (status === "concluida") concluidas++
        anteriorConcluida = desbloqueada && status === "concluida"
      }

      const pct = missoes.length > 0 ? Math.round((concluidas / missoes.length) * 100) : 0
      return { ...world, progresso: pct, concluidas, total: missoes.length }
    })
  }, [aluno, atividades, progresso, exercicios])
}

export function useOverallProgress(aluno: Aluno, subjectProgress: ReturnType<typeof useSubjectProgress> extends infer R ? R : never) {
  return useMemo(() => {
    if (subjectProgress.length === 0) return 0
    const sum = subjectProgress.reduce((s, w) => s + w.progresso, 0)
    return Math.round(sum / subjectProgress.length)
  }, [subjectProgress])
}

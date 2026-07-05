"use client"

import type { Exercicio, Trilha } from "@/lib/types"
import { LearningNode, type EstadoNode } from "./LearningNode"
import { LearningConnector } from "./LearningConnector"

interface LearningPathProps {
  trilha: Trilha
  progresso: { nivel_atual: number; completos: string[] }
  corBg: string
  corTexto: string
  onAbrirExercicio: (ex: Exercicio) => void
}

/** Estimativa presentacional de tempo médio por nível (não há campo de tempo no modelo de dados). */
function tempoEstimadoMin(ex: Exercicio): number {
  return ex.tipo === "multipla" ? 4 : ex.tipo === "completar" ? 6 : 8
}

/**
 * Trilha vertical de níveis. Mantém 1:1 a mesma regra de negócio do componente original:
 * um node por exercício, com o mesmo cálculo de completo/atual/bloqueado.
 * "Quantidade de atividades" exibida no card é o total de exercícios que dividem o mesmo
 * nível (`ex.nivel`) dentro da trilha — dado apenas informativo, não altera a navegação.
 */
export function LearningPath({ trilha, progresso, corBg, corTexto, onAbrirExercicio }: LearningPathProps) {
  const atividadesPorNivel = trilha.exercicios.reduce<Record<number, number>>((acc, ex) => {
    acc[ex.nivel] = (acc[ex.nivel] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="mx-auto max-w-2xl">
      {trilha.exercicios.map((ex, idx) => {
        const nivel = ex.nivel
        const completo = nivel < progresso.nivel_atual || progresso.completos.includes(ex.id)
        const atual = nivel === progresso.nivel_atual && !completo
        const bloqueado = nivel > progresso.nivel_atual
        const estado: EstadoNode = completo ? "completo" : atual ? "atual" : "bloqueado"

        const proximo = trilha.exercicios[idx + 1]
        const estadoConector: EstadoNode = proximo
          ? proximo.nivel < progresso.nivel_atual || progresso.completos.includes(proximo.id)
            ? "completo"
            : proximo.nivel === progresso.nivel_atual
              ? "atual"
              : "bloqueado"
          : "bloqueado"

        return (
          <div key={ex.id}>
            <LearningNode
              numero={idx + 1}
              titulo={`Nível ${nivel} · Etapa ${idx + 1}`}
              descricao={ex.pergunta}
              atividades={atividadesPorNivel[nivel] ?? 1}
              xp={ex.xp_recompensa}
              tempoMedioMin={tempoEstimadoMin(ex)}
              estado={estado}
              corBg={corBg}
              corTexto={corTexto}
              onClick={() => !bloqueado && onAbrirExercicio(ex)}
            />
            {idx < trilha.exercicios.length - 1 && (
              <div className="ml-7">
                <LearningConnector estado={estadoConector} corSolida={corBg} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
"use client"

import type { MissaoStatusInfo } from "@/hooks/useLearningPath"
import { SUBJECT_COLOR_STYLES, type SubjectColor } from "@/lib/learning-path/subjects"
import { LearningNode, PathConnector } from "./LearningNode"

interface LearningMapProps {
  missoes: MissaoStatusInfo[]
  cor: SubjectColor
  missaoAtualId?: string
  onSelectMissao: (missao: MissaoStatusInfo) => void
}

export function LearningMap({ missoes, cor, missaoAtualId, onSelectMissao }: LearningMapProps) {
  const styles = SUBJECT_COLOR_STYLES[cor]
  const nodeWidth = 100
  const nodeGap = 24
  const maxCol = Math.max(...missoes.map((m) => m.col))
  const maxRow = Math.max(...missoes.map((m) => m.row))

  return (
    <div
      className="relative overflow-x-auto rounded-2xl border border-white/5 bg-[#0B0E14]/80 p-6 backdrop-blur-sm"
      role="img"
      aria-label="Mapa de missões da trilha"
    >
      <div
        className="relative mx-auto min-w-[480px]"
        style={{
          width: (maxCol + 1) * (nodeWidth + nodeGap),
          height: (maxRow + 1) * 120 + 60,
        }}
      >
        {missoes.map((missao, i) => {
          if (i === 0) return null
          const anterior = missoes[i - 1]
          const active = anterior.status === "concluida" || missao.status !== "bloqueada"
          return (
            <PathConnector
              key={`conn-${missao.id}`}
              from={{ row: anterior.row, col: anterior.col }}
              to={{ row: missao.row, col: missao.col }}
              active={active}
              cor={cor}
              nodeWidth={nodeWidth}
              nodeGap={nodeGap}
            />
          )
        })}

        {missoes.map((missao, index) => (
          <div
            key={missao.id}
            className="absolute"
            style={{
              left: missao.col * (nodeWidth + nodeGap),
              top: missao.row * 120,
              width: nodeWidth,
            }}
          >
            <LearningNode
              missao={missao}
              index={index}
              cor={cor}
              isCurrent={missao.id === missaoAtualId}
              onClick={() => onSelectMissao(missao)}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/40">
        <span className="flex items-center gap-1.5">
          <span className={`size-2.5 rounded-full ${styles.bg}`} /> Concluída
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full ring-2 ring-blue-400" /> Atual
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-white/10" /> Bloqueada
        </span>
      </div>
    </div>
  )
}

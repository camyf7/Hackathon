"use client"

import { cn } from "@/lib/utils"
import { Check, Lock, Skull, Star } from "lucide-react"
import type { StatusMissao } from "@/lib/types"
import type { MissaoStatusInfo } from "@/hooks/useLearningPath"
import { SUBJECT_COLOR_STYLES, type SubjectColor } from "@/lib/learning-path/subjects"

interface LearningNodeProps {
  missao: MissaoStatusInfo
  index: number
  cor: SubjectColor
  isCurrent: boolean
  onClick: () => void
}

export function LearningNode({ missao, index, cor, isCurrent, onClick }: LearningNodeProps) {
  const styles = SUBJECT_COLOR_STYLES[cor]
  const bloqueada = missao.status === "bloqueada"
  const concluida = missao.status === "concluida"
  const boss = missao.isBoss

  return (
    <div className="flex flex-col items-center gap-2">
      {concluida && (
        <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500 text-white">
          <Check className="size-3" strokeWidth={3} />
        </span>
      )}
      {!concluida && isCurrent && (
        <span className="animate-bounce text-xs font-bold text-white/80">▼</span>
      )}
      {!concluida && !isCurrent && !bloqueada && <span className="size-5" />}

      <button
        onClick={onClick}
        disabled={bloqueada}
        aria-label={`${missao.titulo}${bloqueada ? " (bloqueada)" : ""}`}
        className={cn(
          "relative grid size-14 place-items-center rounded-full text-sm font-extrabold transition-all duration-300 sm:size-16",
          bloqueada && "cursor-not-allowed bg-white/5 text-white/30 ring-2 ring-white/10",
          concluida && !boss && cn("bg-gradient-to-br text-white shadow-lg", styles.node),
          !bloqueada && !concluida && !boss && cn("bg-gradient-to-br text-white", styles.node),
          boss && !bloqueada && "bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/40",
          boss && bloqueada && "bg-white/5",
          isCurrent && !bloqueada && "ring-4 ring-offset-2 ring-offset-[#0B0E14] scale-110",
          isCurrent && !bloqueada && styles.ring,
        )}
      >
        {bloqueada ? (
          <Lock className="size-5" />
        ) : boss ? (
          <Skull className="size-6" />
        ) : concluida ? (
          <Check className="size-6" strokeWidth={3} />
        ) : (
          <span>{String(index + 1).padStart(2, "0")}</span>
        )}
        {isCurrent && !bloqueada && (
          <span className="absolute -inset-1 -z-10 animate-pulse rounded-full bg-blue-500/20 blur-md" />
        )}
      </button>

      <div className="max-w-[100px] text-center">
        <p className={cn("text-xs font-bold leading-tight", bloqueada ? "text-white/30" : "text-white/80")}>
          {missao.titulo}
        </p>
        {missao.status === "em_andamento" && (
          <span className="mt-0.5 inline-flex items-center gap-0.5 text-[10px] text-amber-400">
            <Star className="size-2.5 fill-amber-400" /> {missao.progresso}%
          </span>
        )}
      </div>
    </div>
  )
}

interface PathConnectorProps {
  from: { row: number; col: number }
  to: { row: number; col: number }
  active: boolean
  cor: SubjectColor
  nodeWidth?: number
  nodeGap?: number
}

export function PathConnector({ from, to, active, cor, nodeWidth = 100, nodeGap = 16 }: PathConnectorProps) {
  const styles = SUBJECT_COLOR_STYLES[cor]
  const x1 = from.col * (nodeWidth + nodeGap) + nodeWidth / 2
  const y1 = from.row * 120 + 40
  const x2 = to.col * (nodeWidth + nodeGap) + nodeWidth / 2
  const y2 = to.row * 120 + 40

  const midY = from.row !== to.row ? (y1 + y2) / 2 : y1

  const path =
    from.row === to.row
      ? `M ${x1} ${y1} L ${x2} ${y2}`
      : `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      aria-hidden
    >
      <path
        d={path}
        fill="none"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          "transition-colors duration-500",
          active ? styles.line : "stroke-white/10",
        )}
        strokeDasharray={active ? undefined : "6 6"}
      />
    </svg>
  )
}

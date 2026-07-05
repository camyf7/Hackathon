"use client"

import { cn } from "@/lib/utils"
import { Clock, Star, User, Zap } from "lucide-react"
import type { MissaoStatusInfo } from "@/hooks/useLearningPath"
import { SUBJECT_COLOR_STYLES, type SubjectColor } from "@/lib/learning-path/subjects"
import { Button } from "@/components/ui/button"

const DIFICULDADE_LABEL: Record<string, string> = {
  facil: "Fácil",
  media: "Média",
  dificil: "Difícil",
}

interface MissionCardProps {
  missao: MissaoStatusInfo
  cor: SubjectColor
  onContinuar?: () => void
}

export function MissionCard({ missao, cor, onContinuar }: MissionCardProps) {
  const styles = SUBJECT_COLOR_STYLES[cor]

  return (
    <article className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-white/40">
            {missao.isBoss ? "Boss Challenge" : `Missão ${String(missao.ordem).padStart(2, "0")}`}
          </p>
          <h3 className="mt-1 font-display text-xl font-extrabold text-white">{missao.titulo}</h3>
          <p className="mt-1 text-sm text-white/50">{missao.descricao}</p>
        </div>
        {missao.isBoss && (
          <span className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 px-3 py-1 text-xs font-bold text-white">
            BOSS
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/60">
        <span className="flex items-center gap-1">
          <User className="size-3.5" /> {missao.professor}
        </span>
        <span className="flex items-center gap-1">
          <Zap className="size-3.5 text-amber-400" /> {missao.xp} XP
        </span>
        <span className="flex items-center gap-1">
          <Clock className="size-3.5" /> {missao.tempoEstimado} min
        </span>
        <span className="rounded-full bg-white/5 px-2 py-0.5">{DIFICULDADE_LABEL[missao.dificuldade]}</span>
      </div>

      <div className="mt-4">
        <p className="text-xs font-bold text-white/40">Objetivo</p>
        <p className="text-sm text-white/70">{missao.objetivo}</p>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn("h-full rounded-full transition-all duration-500", styles.bg)}
          style={{ width: `${missao.progresso}%` }}
        />
      </div>

      {missao.status !== "bloqueada" && missao.status !== "concluida" && onContinuar && (
        <Button
          onClick={onContinuar}
          className={cn("mt-4 w-full rounded-xl font-bold", styles.bg, "hover:opacity-90")}
        >
          <Star className="size-4" /> Continuar missão
        </Button>
      )}
    </article>
  )
}

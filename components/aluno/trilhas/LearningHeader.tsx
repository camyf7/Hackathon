"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LearningStats } from "./LearningStats"

interface LearningHeaderProps {
  emoji: string
  nome: string
  descricao: string
  corBg: string // classe tailwind, ex: "bg-brand-green"
  progressoNivelPct: number
  nivel: number
  xpTotal: number
  onVerEstatisticas: () => void
  onAbrirMenuMobile: () => void
}

/** Cabeçalho da área principal: identidade da trilha + estatísticas do aluno. */
export function LearningHeader({
  emoji,
  nome,
  descricao,
  corBg,
  progressoNivelPct,
  nivel,
  xpTotal,
  onVerEstatisticas,
  onAbrirMenuMobile,
}: LearningHeaderProps) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onAbrirMenuMobile}
          className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/5 text-slate-300 md:hidden"
          aria-label="Abrir trilhas"
        >
          <Menu className="size-5" />
        </button>

        <span className={`grid size-14 shrink-0 place-items-center rounded-2xl text-3xl text-white shadow-lg ${corBg}`}>
          {emoji}
        </span>

        <div className="min-w-0">
          <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">{nome}</h1>
          <p className="mt-0.5 text-sm font-medium text-slate-400">{descricao}</p>
          <Button
            size="sm"
            variant="ghost"
            onClick={onVerEstatisticas}
            className="mt-2 h-8 gap-1.5 rounded-full bg-white/5 px-3 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white"
          >
            Ver estatísticas
          </Button>
        </div>
      </div>

      <LearningStats progressoNivelPct={progressoNivelPct} nivel={nivel} xpTotal={xpTotal} />
    </div>
  )
}
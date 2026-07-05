"use client"

import { motion } from "framer-motion"

interface LearningStatsProps {
  progressoNivelPct: number
  nivel: number
  xpTotal: number
}

/** Bloco compacto no canto superior direito: progresso, nível e XP do aluno. */
export function LearningStats({ progressoNivelPct, nivel, xpTotal }: LearningStatsProps) {
  const raio = 22
  const circunferencia = 2 * Math.PI * raio
  const offset = circunferencia - (progressoNivelPct / 100) * circunferencia

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-[#111827] px-4 py-3 shadow-sm">
      <div className="relative grid size-14 shrink-0 place-items-center">
        <svg viewBox="0 0 56 56" className="size-14 -rotate-90">
          <circle cx="28" cy="28" r={raio} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
          <motion.circle
            cx="28"
            cy="28"
            r={raio}
            fill="none"
            stroke="#5EEAD4"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circunferencia}
            initial={{ strokeDashoffset: circunferencia }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <span className="absolute font-display text-xs font-extrabold text-white">{progressoNivelPct}%</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Nível</span>
          <span className="font-display text-sm font-extrabold text-white">{nivel}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">XP</span>
          <span className="font-display text-sm font-extrabold text-amber-400">{xpTotal.toLocaleString("pt-BR")}</span>
        </div>
      </div>
    </div>
  )
}
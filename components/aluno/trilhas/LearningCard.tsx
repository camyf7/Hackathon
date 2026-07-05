"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface LearningCardProps {
  emoji: string
  nome: string
  percentual: number
  corBarra: string // classe tailwind, ex: "bg-brand-green"
  corTextoAtivo: string // classe tailwind, ex: "text-brand-green"
  selecionado: boolean
  onClick: () => void
}

/** Card de disciplina na sidebar, com progresso e estado de seleção. */
export function LearningCard({
  emoji,
  nome,
  percentual,
  corBarra,
  corTextoAtivo,
  selecionado,
  onClick,
}: LearningCardProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl p-4 text-left transition-colors",
        selecionado
          ? "bg-[#151B26] ring-1 ring-white/10"
          : "bg-transparent hover:bg-[#111827]/60",
      )}
    >
      {selecionado && (
        <motion.span
          layoutId="sidebar-active-indicator"
          className={cn("absolute inset-y-2 left-0 w-1 rounded-full", corBarra)}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}

      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/5 text-xl">
          {emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate font-display text-[15px] font-extrabold",
              selecionado ? corTextoAtivo : "text-slate-200",
            )}
          >
            {nome}
          </p>
          <p className="text-xs font-semibold text-slate-500">{percentual}% concluído</p>
        </div>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <motion.div
          className={cn("h-full rounded-full", corBarra)}
          initial={{ width: 0 }}
          animate={{ width: `${percentual}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </motion.button>
  )
}
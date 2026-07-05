"use client"

import { BADGES } from "@/lib/game"
import { cn } from "@/lib/utils"

interface AchievementCardProps {
  badgesConquistados: string[]
}

/** Card com as conquistas (badges) do aluno, reaproveitando o mesmo dicionário BADGES do perfil. */
export function AchievementCard({ badgesConquistados }: AchievementCardProps) {
  const entradas = Object.entries(BADGES)

  return (
    <div className="rounded-2xl border border-white/5 bg-[#111827] p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display font-extrabold text-white">Conquistas</h3>
        <span className="text-xs font-bold text-slate-500">
          {badgesConquistados.length}/{entradas.length}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {entradas.map(([id, badge]) => {
          const conquistado = badgesConquistados.includes(id)
          return (
            <div
              key={id}
              title={badge.desc}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl p-2.5 text-center",
                conquistado ? "bg-amber-400/10 ring-1 ring-amber-400/20" : "bg-white/[0.03] opacity-40 grayscale",
              )}
            >
              <span className="text-xl">{badge.emoji}</span>
              <span className="text-[10px] font-bold leading-tight text-slate-300">{badge.nome}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
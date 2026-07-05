"use client"

import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NextActivityCardProps {
  trilhaNome: string
  nivel: number
  xp: number
  corBg: string
  onContinuar: () => void
}

/** Card com a próxima atividade pendente do aluno e atalho para continuar. */
export function NextActivityCard({ trilhaNome, nivel, xp, corBg, onContinuar }: NextActivityCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-white/5 bg-[#111827] p-5">
      <div>
        <h3 className="font-display font-extrabold text-white">Próxima atividade</h3>
        <div className="mt-3 flex items-center gap-3">
          <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl text-lg text-white", corBg)}>
            {nivel}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-white">{trilhaNome}</p>
            <p className="text-xs font-semibold text-slate-500">Nível {nivel} · +{xp} XP</p>
          </div>
        </div>
      </div>

      <Button
        onClick={onContinuar}
        className="mt-4 w-full gap-1.5 rounded-xl font-display font-extrabold"
      >
        Continuar
        <ArrowRight className="size-4" />
      </Button>
    </div>
  )
}
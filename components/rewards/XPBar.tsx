"use client"

import { motion } from "framer-motion"
import { calcularProgresso } from "@/lib/levels"
import { LevelBadge } from "./LevelBadge"
import { cn } from "@/lib/utils"

interface XPBarProps {
  xp: number
  subiuDeNivel?: boolean
  className?: string
  mostrarLegenda?: boolean
}

export function XPBar({ xp, subiuDeNivel = false, className, mostrarLegenda = true }: XPBarProps) {
  const info = calcularProgresso(xp)

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LevelBadge nivel={info.nivel} pulsar={subiuDeNivel} />
      <div className="min-w-0 flex-1">
        {mostrarLegenda && (
          <div className="mb-1.5 flex items-center justify-between">
            <span className="font-display text-sm font-extrabold text-foreground">
              Nível {info.nivel}
            </span>
            <span className="text-xs font-bold text-muted-foreground">
              {info.nivelMaximoAtingido
                ? `${info.xpAtual} XP`
                : `${info.xpNoNivelAtual} / ${info.xpParaProximoNivel - info.xpBaseDoNivel} XP`}
            </span>
          </div>
        )}
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={false}
            animate={{ width: `${info.percentual}%` }}
            transition={{ type: "spring", stiffness: 90, damping: 18 }}
          />
        </div>
      </div>
    </div>
  )
}

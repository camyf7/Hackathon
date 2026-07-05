"use client"

import { motion } from "framer-motion"
import { Check, Clock, Lock, Sparkles, Star, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

export type EstadoNode = "completo" | "atual" | "bloqueado"

interface LearningNodeProps {
  numero: number
  titulo: string
  descricao: string
  atividades: number
  xp: number
  tempoMedioMin: number
  estado: EstadoNode
  corBg: string // ex: "bg-brand-green"
  corTexto: string // ex: "text-brand-green"
  onClick: () => void
}

/** Um nível da trilha: círculo de status à esquerda + card informativo à direita. */
export function LearningNode({
  numero,
  titulo,
  descricao,
  atividades,
  xp,
  tempoMedioMin,
  estado,
  corBg,
  corTexto,
  onClick,
}: LearningNodeProps) {
  const completo = estado === "completo"
  const atual = estado === "atual"
  const bloqueado = estado === "bloqueado"

  return (
    <div className="flex items-start gap-5">
      {/* Círculo de status */}
      <div className="relative shrink-0">
        {completo && (
          <span className="absolute -top-3 left-1/2 grid size-5 -translate-x-1/2 place-items-center rounded-full bg-emerald-500 text-white shadow-md">
            <Check className="size-3" strokeWidth={3.5} />
          </span>
        )}

        {atual && (
          <motion.span
            className={cn("absolute inset-0 rounded-full blur-lg opacity-70", corBg)}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        <motion.button
          onClick={onClick}
          disabled={bloqueado}
          whileHover={!bloqueado ? { scale: 1.06 } : undefined}
          whileTap={!bloqueado ? { scale: 0.96 } : undefined}
          aria-label={`${titulo}${bloqueado ? " (bloqueado)" : ""}`}
          className={cn(
            "relative grid place-items-center rounded-full font-display text-lg font-extrabold text-white transition-shadow",
            atual ? "size-[68px] ring-4 ring-white/10" : "size-14",
            completo && cn(corBg, "shadow-[0_4px_0_0_rgba(0,0,0,0.25)]"),
            atual && cn(corBg, "shadow-[0_6px_0_0_rgba(0,0,0,0.3)]"),
            bloqueado && "cursor-not-allowed bg-[#1B2130] text-slate-600 shadow-[0_4px_0_0_rgba(0,0,0,0.15)]",
          )}
        >
          {completo ? (
            <Star className="size-6 fill-white" />
          ) : bloqueado ? (
            <Lock className="size-5" />
          ) : (
            numero
          )}
        </motion.button>

        {atual && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute left-full top-1/2 ml-2 flex -translate-y-1/2 items-center gap-1 whitespace-nowrap"
          >
            <span className={cn("h-px w-4", corBg)} />
            <span className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">você está aqui</span>
          </motion.div>
        )}
      </div>

      {/* Card informativo */}
      <motion.div
        whileHover={!bloqueado ? { y: -2 } : undefined}
        onClick={!bloqueado ? onClick : undefined}
        className={cn(
          "mb-6 flex-1 rounded-2xl border p-4 transition-colors",
          bloqueado
            ? "border-white/5 bg-[#0D111A] opacity-60"
            : "border-white/5 bg-[#111827] hover:border-white/10 cursor-pointer",
          atual && cn("border-transparent ring-1", corTexto.replace("text-", "ring-")),
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <h4 className={cn("font-display font-extrabold", bloqueado ? "text-slate-500" : "text-white")}>
            {titulo}
          </h4>
          {atual && (
            <span className={cn("flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide", corTexto)}>
              <Sparkles className="size-3" /> Disponível
            </span>
          )}
          {completo && (
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-emerald-400">
              Concluído
            </span>
          )}
          {bloqueado && (
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
              Bloqueado
            </span>
          )}
        </div>

        <p className={cn("mt-1 text-sm font-medium", bloqueado ? "text-slate-600" : "text-slate-400")}>
          {descricao}
        </p>

        {!bloqueado && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-bold text-slate-500">
            <span>{atividades} {atividades === 1 ? "atividade" : "atividades"}</span>
            <span className="flex items-center gap-1 text-amber-400">
              <Zap className="size-3.5 fill-amber-400" /> +{xp} XP
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" /> {tempoMedioMin} min
            </span>
          </div>
        )}
      </motion.div>
    </div>
  )
}
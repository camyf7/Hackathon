"use client"

import { cn } from "@/lib/utils"

export type EstadoConector = "completo" | "atual" | "bloqueado"

/** Linha vertical entre dois níveis da trilha. Sólida quando há progresso, pontilhada quando bloqueada. */
export function LearningConnector({ estado, corSolida }: { estado: EstadoConector; corSolida: string }) {
  if (estado === "bloqueado") {
    return (
      <div className="flex w-9 flex-1 justify-center py-1">
        <div className="w-0.5 flex-1 border-l-2 border-dashed border-white/10" />
      </div>
    )
  }

  return (
    <div className="relative flex w-9 flex-1 justify-center py-1">
      {estado === "atual" && (
        <div className={cn("absolute inset-x-2 top-0 bottom-0 rounded-full blur-md opacity-60", corSolida)} />
      )}
      <div className={cn("relative w-1 flex-1 rounded-full", corSolida)} />
    </div>
  )
}
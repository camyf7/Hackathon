"use client"

import { useState } from "react"
import type { Exercicio, Trilha } from "@/lib/types"
import { useStore } from "@/lib/store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Check, X } from "lucide-react"

export function ExercicioDialog({
  trilha,
  exercicio,
  alunoId,
  open,
  onOpenChange,
  onAcerto,
}: {
  trilha: Trilha
  exercicio: Exercicio | null
  alunoId: string
  open: boolean
  onOpenChange: (v: boolean) => void
  onAcerto: (xp: number) => void
}) {
  const { responderExercicio } = useStore()
  const [selecionada, setSelecionada] = useState<number | null>(null)
  const [confirmado, setConfirmado] = useState(false)

  function reset() {
    setSelecionada(null)
    setConfirmado(false)
  }

  function confirmar() {
    if (selecionada === null || !exercicio) return
    setConfirmado(true)
    const acertou = selecionada === exercicio.resposta_correta
    if (acertou) {
      const r = responderExercicio(alunoId, exercicio.id)
      if (r) onAcerto(r.xp)
    }
  }

  if (!exercicio) return null
  const acertou = confirmado && selecionada === exercicio.resposta_correta

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset()
        onOpenChange(v)
      }}
    >
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <span className="text-2xl">{trilha.emoji}</span> {trilha.nome} · Nível {exercicio.nivel}
          </DialogTitle>
        </DialogHeader>

        <p className="text-balance text-lg font-extrabold">{exercicio.pergunta}</p>

        <div className="mt-2 grid gap-2">
          {exercicio.opcoes.map((op, i) => {
            const isCorreta = i === exercicio.resposta_correta
            const isSelecionada = i === selecionada
            return (
              <button
                key={i}
                disabled={confirmado}
                onClick={() => setSelecionada(i)}
                className={cn(
                  "flex items-center justify-between rounded-2xl border-2 px-4 py-3 text-left font-bold transition",
                  !confirmado && isSelecionada && "border-primary bg-primary/10",
                  !confirmado && !isSelecionada && "border-border bg-card hover:border-primary/50",
                  confirmado && isCorreta && "border-brand-green bg-brand-green/15 text-primary",
                  confirmado && isSelecionada && !isCorreta && "border-destructive bg-destructive/10 text-destructive",
                  confirmado && !isCorreta && !isSelecionada && "border-border bg-card opacity-60",
                )}
              >
                {op}
                {confirmado && isCorreta && <Check className="size-5" />}
                {confirmado && isSelecionada && !isCorreta && <X className="size-5" />}
              </button>
            )
          })}
        </div>

        {confirmado && (
          <div
            className={cn(
              "animate-pop-in rounded-2xl p-4 text-center font-display font-extrabold",
              acertou ? "bg-brand-green/15 text-primary" : "bg-destructive/10 text-destructive",
            )}
          >
            {acertou ? (
              <span className="flex items-center justify-center gap-2 text-lg">
                🎉 Mandou bem! +{exercicio.xp_recompensa} XP
              </span>
            ) : (
              <span>
                Quase! A resposta era “{exercicio.opcoes[exercicio.resposta_correta]}”. Tente de novo!
              </span>
            )}
          </div>
        )}

        <div className="mt-2 flex gap-2">
          {!confirmado ? (
            <Button
              disabled={selecionada === null}
              onClick={confirmar}
              className="w-full rounded-2xl py-6 text-base font-extrabold shadow-[0_4px_0_0_rgba(0,0,0,0.15)] active:translate-y-0.5 active:shadow-none"
            >
              Confirmar
            </Button>
          ) : acertou ? (
            <Button
              onClick={() => {
                reset()
                onOpenChange(false)
              }}
              className="w-full rounded-2xl py-6 text-base font-extrabold"
            >
              Continuar
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={reset}
              className="w-full rounded-2xl py-6 text-base font-extrabold"
            >
              Tentar de novo
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

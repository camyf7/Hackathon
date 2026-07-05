"use client"

import { useCallback, useMemo } from "react"
import { useStore } from "@/lib/store"
import type { Aluno } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { StreakFlame } from "@/components/brand"
import { CheckCircle2, Smartphone, ScanLine } from "lucide-react"
import { toast } from "sonner"

const TOAST_ICON = <CheckCircle2 className="size-4" />

export function CheckinCard({ aluno, onXp }: { aluno: Aluno; onXp: () => void }) {
  const { db, fazerCheckin } = useStore()
  const hoje = db.data_atual

  const jaFez = useMemo(
    () => db.presencas.some((p) => p.aluno_id === aluno.id && p.data === hoje && p.presente),
    [db.presencas, aluno.id, hoje],
  )

  const checkin = useCallback(() => {
    if (jaFez) {
      toast("Você já fez check-in hoje!", { icon: TOAST_ICON })
      return
    }

    const xp = fazerCheckin(aluno.id)
    if (typeof xp === "number" && xp > 0) {
      onXp()
      toast.success(`Presença registrada! +${xp} XP e streak aceso`, { icon: TOAST_ICON })
    }
  }, [jaFez, fazerCheckin, aluno.id, onXp])

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-orange/15 to-brand-gold/15 p-4 ring-1 ring-brand-orange/20">
      {/* Detalhe decorativo sutil, sem emoji: um círculo desfocado no
          fundo pra dar profundidade ao card sem poluir o conteúdo. */}
      <div className="pointer-events-none absolute -right-6 -top-10 size-32 rounded-full bg-brand-orange/10 blur-2xl" />

      <div className="relative flex items-center gap-4">
        <span className="hidden shrink-0 items-center justify-center rounded-2xl bg-brand-orange/15 p-3 text-brand-orange ring-1 ring-brand-orange/20 sm:flex">
          <Smartphone className="size-7" strokeWidth={2} aria-hidden="true" />
        </span>

        <div className="flex-1">
          <h3 className="font-display text-lg font-extrabold">Cheguei no app!</h3>
          <p className="text-xs font-bold text-muted-foreground">
            {jaFez
              ? "Garanta sua ofensiva do dia"
              : "Toque a carteirinha na entrada para registrar presença."}
          </p>
        </div>

        <StreakFlame dias={aluno.streak_dias} />

        <Button
          onClick={checkin}
          disabled={jaFez}
          aria-label={jaFez ? "Check-in já realizado hoje" : "Simular chegada e registrar presença"}
          className="rounded-2xl font-extrabold shadow-[0_4px_0_0_rgba(0,0,0,0.15)] active:translate-y-0.5 active:shadow-none disabled:opacity-60"
        >
          {jaFez ? <CheckCircle2 className="size-4" aria-hidden="true" /> : <ScanLine className="size-4" aria-hidden="true" />}
          {jaFez ? "Feito" : "Simular chegada"}
        </Button>
      </div>
    </div>
  )
}
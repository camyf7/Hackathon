"use client"

import { useStore } from "@/lib/store"
import type { Aluno } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { StreakFlame } from "@/components/brand"
import { CheckCircle2, School, ScanLine } from "lucide-react"
import { toast } from "sonner"

export function CheckinCard({ aluno, onXp }: { aluno: Aluno; onXp: () => void }) {
  const { db, fazerCheckin } = useStore()
  const hoje = db.data_atual
  const jaFez = db.presencas.some((p) => p.aluno_id === aluno.id && p.data === hoje && p.presente)

  function checkin() {
    const xp = fazerCheckin(aluno.id)
    if (xp && xp > 0) {
      onXp()
      toast.success(`Presença registrada! +${xp} XP e streak aceso`, {
        icon: <CheckCircle2 className="size-4" />,
      })
    } else {
      toast("Você já fez check-in hoje!", {
        icon: <CheckCircle2 className="size-4" />,
      })
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-orange/15 to-brand-gold/15 p-4 ring-1 ring-brand-orange/20">
      {/* Detalhe decorativo sutil, sem emoji: um círculo desfocado no
          fundo pra dar profundidade ao card sem poluir o conteúdo. */}
      <div className="pointer-events-none absolute -right-6 -top-10 size-32 rounded-full bg-brand-orange/10 blur-2xl" />

      <div className="relative flex items-center gap-4">
        <span className="hidden shrink-0 items-center justify-center rounded-2xl bg-brand-orange/15 p-3 text-brand-orange ring-1 ring-brand-orange/20 sm:flex">
          <School className="size-7" strokeWidth={2} />
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
          className="rounded-2xl font-extrabold shadow-[0_4px_0_0_rgba(0,0,0,0.15)] active:translate-y-0.5 active:shadow-none disabled:opacity-60"
        >
          {jaFez ? <CheckCircle2 className="size-4" /> : <ScanLine className="size-4" />}
          {jaFez ? "Feito" : "Simular chegada"}
        </Button>
      </div>
    </div>
  )
}
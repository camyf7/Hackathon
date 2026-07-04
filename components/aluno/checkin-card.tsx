"use client"

import { useStore } from "@/lib/store"
import type { Aluno } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { StreakFlame } from "@/components/brand"
import { ScanLine } from "lucide-react"
import { toast } from "sonner"

export function CheckinCard({ aluno, onXp }: { aluno: Aluno; onXp: () => void }) {
  const { db, fazerCheckin } = useStore()
  const hoje = db.data_atual
  const jaFez = db.presencas.some((p) => p.aluno_id === aluno.id && p.data === hoje && p.presente)

  function checkin() {
    const xp = fazerCheckin(aluno.id)
    if (xp && xp > 0) {
      onXp()
      toast.success(`Presença registrada! +${xp} XP e streak aceso 🔥`, { icon: "✅" })
    } else {
      toast("Você já fez check-in hoje!", { icon: "👍" })
    }
  }

  return (
    <div className="flex items-center gap-4 rounded-3xl bg-gradient-to-r from-brand-orange/15 to-brand-gold/15 p-4 ring-1 ring-brand-orange/20">
      <span className="hidden text-4xl sm:block">🏫</span>
      <div className="flex-1">
        <h3 className="font-display text-lg font-extrabold">Cheguei na escola!</h3>
        <p className="text-xs font-bold text-muted-foreground">
          {jaFez ? "Presença de hoje garantida. Mantenha o streak!" : "Toque a carteirinha na entrada para registrar presença."}
        </p>
      </div>
      <StreakFlame dias={aluno.streak_dias} />
      <Button
        onClick={checkin}
        disabled={jaFez}
        className="rounded-2xl font-extrabold shadow-[0_4px_0_0_rgba(0,0,0,0.15)] active:translate-y-0.5 active:shadow-none disabled:opacity-60"
      >
        <ScanLine className="size-4" /> {jaFez ? "Feito" : "Simular chegada"}
      </Button>
    </div>
  )
}

"use client"

import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { CalendarPlus, Dice5, RotateCcw, Sparkles, Users } from "lucide-react"
import { formatarDataCurta } from "@/lib/game"

export function DemoBar() {
  const { db, avancarDia, simularPresenca, simularXP, resetarDados } = useStore()

  return (
    <div className="border-t-2 border-dashed border-brand-orange/40 bg-brand-gold/10">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-2">
        <span className="flex items-center gap-1 text-xs font-extrabold uppercase tracking-wide text-brand-orange">
          <Sparkles className="size-4" /> Modo Demo
        </span>
        <span className="mr-2 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-muted-foreground">
          Dia: {formatarDataCurta(db.data_atual)}
        </span>
        <Button
          size="sm"
          variant="secondary"
          className="h-8 rounded-full font-bold"
          onClick={() => {
            avancarDia()
            toast("Avançou 1 dia!", { icon: "📅" })
          }}
        >
          <CalendarPlus className="size-4" /> Avançar dia
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="h-8 rounded-full font-bold"
          onClick={() => {
            simularPresenca()
            toast("Presença aleatória registrada", { icon: "🎲" })
          }}
        >
          <Users className="size-4" /> Presença aleatória
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="h-8 rounded-full font-bold"
          onClick={() => {
            simularXP()
            toast("XP distribuído para a turma!", { icon: "⚡" })
          }}
        >
          <Dice5 className="size-4" /> Simular XP
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 rounded-full font-bold text-destructive hover:bg-destructive/10"
          onClick={() => {
            if (confirm("Resetar todos os dados de exemplo?")) {
              resetarDados()
              toast("Dados resetados", { icon: "🔄" })
            }
          }}
        >
          <RotateCcw className="size-4" /> Resetar
        </Button>
      </div>
    </div>
  )
}

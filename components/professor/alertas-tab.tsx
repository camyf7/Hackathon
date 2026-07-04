"use client"

import { useStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { META_TELA_DIARIA } from "@/lib/game"
import { AlertTriangle, Clock, TrendingDown, PauseCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type Alerta = {
  alunoId: string
  nome: string
  avatar: string
  tipo: "frequencia" | "trilha" | "tela"
  detalhe: string
}

export function AlertasTab({ turmaId }: { turmaId: string }) {
  const { db } = useStore()
  const alunos = db.alunos.filter((a) => a.turma_id === turmaId)
  const hoje = db.data_atual

  const ultimos7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoje + "T12:00:00")
    d.setDate(d.getDate() - i)
    return d.toISOString().slice(0, 10)
  })

  const alertas: Alerta[] = []
  alunos.forEach((a) => {
    // frequência: faltou 3+ dos últimos 7
    const presencas = db.presencas.filter((p) => p.aluno_id === a.id && ultimos7.includes(p.data))
    const faltas = presencas.filter((p) => !p.presente).length
    if (faltas >= 3 || a.streak_dias === 0) {
      alertas.push({
        alunoId: a.id,
        nome: a.nome,
        avatar: a.avatar,
        tipo: "frequencia",
        detalhe: a.streak_dias === 0 ? "Streak apagado, sem presença recente" : `${faltas} faltas nos últimos 7 dias`,
      })
    }
    // trilha parada: pouco XP acumulado
    if (a.xp_total < 150) {
      alertas.push({
        alunoId: a.id,
        nome: a.nome,
        avatar: a.avatar,
        tipo: "trilha",
        detalhe: "Trilha parada / baixo progresso",
      })
    }
    // tempo de tela excessivo
    const diaMedia = Math.round(a.tempo_tela_minutos_semana / 7)
    if (diaMedia > META_TELA_DIARIA * 1.5) {
      alertas.push({
        alunoId: a.id,
        nome: a.nome,
        avatar: a.avatar,
        tipo: "tela",
        detalhe: `Tempo de tela alto: ${diaMedia} min/dia`,
      })
    }
  })

  const config = {
    frequencia: { icon: TrendingDown, cor: "bg-brand-orange/15 text-brand-orange", label: "Queda de frequência" },
    trilha: { icon: PauseCircle, cor: "bg-brand-purple/15 text-brand-purple", label: "Trilha parada" },
    tela: { icon: Clock, cor: "bg-brand-pink/15 text-brand-pink", label: "Tempo de tela alto" },
  }

  return (
    <div className="space-y-4">
      <Card className="flex items-center gap-3 border-2 border-dashed border-brand-orange/40 bg-brand-orange/5 p-4">
        <AlertTriangle className="size-6 text-brand-orange" />
        <p className="text-sm font-semibold">
          Alertas visíveis só para você. Servem para uma conversa de cuidado — nunca são expostos aos alunos.
        </p>
      </Card>

      {alertas.length === 0 ? (
        <Card className="grid place-items-center gap-2 p-10 text-center">
          <span className="text-4xl">🌟</span>
          <p className="font-display text-lg font-extrabold">Tudo tranquilo por aqui!</p>
          <p className="text-sm font-semibold text-muted-foreground">Nenhum aluno em situação de alerta.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {alertas.map((al, i) => {
            const c = config[al.tipo]
            const Icon = c.icon
            return (
              <Card key={`${al.alunoId}-${al.tipo}-${i}`} className="flex items-center gap-3 p-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-muted text-xl">
                  {al.avatar}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display font-extrabold">{al.nome}</p>
                  <p className="text-xs font-semibold text-muted-foreground">{al.detalhe}</p>
                </div>
                <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold", c.cor)}>
                  <Icon className="size-3.5" /> {c.label}
                </span>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

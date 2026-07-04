"use client"

import { useStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { META_TELA_DIARIA } from "@/lib/game"
import { Activity, Clock, TrendingUp, Users } from "lucide-react"
import { cn } from "@/lib/utils"

export function DashboardTab({ turmaId }: { turmaId: string }) {
  const { db } = useStore()
  const alunos = db.alunos.filter((a) => a.turma_id === turmaId)
  const squads = db.squads.filter((s) => s.turma_id === turmaId)

  const xpMedio = alunos.length
    ? Math.round(alunos.reduce((s, a) => s + a.xp_total, 0) / alunos.length)
    : 0

  // frequência da semana
  const hoje = db.data_atual
  const ultimos7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoje + "T12:00:00")
    d.setDate(d.getDate() - i)
    return d.toISOString().slice(0, 10)
  })
  const presencasSemana = db.presencas.filter(
    (p) => alunos.some((a) => a.id === p.aluno_id) && ultimos7.includes(p.data),
  )
  const freq = presencasSemana.length
    ? Math.round((presencasSemana.filter((p) => p.presente).length / presencasSemana.length) * 100)
    : 0

  const telaMediaSemana = alunos.length
    ? Math.round(alunos.reduce((s, a) => s + a.tempo_tela_minutos_semana, 0) / alunos.length)
    : 0
  const telaMediaDia = Math.round(telaMediaSemana / 7)

  const maxXp = Math.max(1, ...alunos.map((a) => a.xp_total))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<TrendingUp className="size-5" />} cor="bg-brand-green" label="XP médio" valor={`${xpMedio}`} />
        <StatCard icon={<Activity className="size-5" />} cor="bg-brand-turquoise" label="Frequência (7d)" valor={`${freq}%`} />
        <StatCard icon={<Users className="size-5" />} cor="bg-brand-purple" label="Squads ativos" valor={`${squads.length}`} />
        <StatCard
          icon={<Clock className="size-5" />}
          cor={telaMediaDia > META_TELA_DIARIA * 1.5 ? "bg-brand-pink" : "bg-brand-orange"}
          label="Tela média/dia"
          valor={`${telaMediaDia}min`}
        />
      </div>

      {/* Engajamento por aluno */}
      <Card className="p-4">
        <h3 className="mb-3 font-display text-lg font-extrabold">Engajamento por aluno (XP)</h3>
        <div className="space-y-2.5">
          {[...alunos]
            .sort((a, b) => b.xp_total - a.xp_total)
            .map((a) => (
              <div key={a.id} className="flex items-center gap-3">
                <span className="w-32 shrink-0 truncate text-sm font-bold">
                  {a.avatar} {a.nome.split(" ")[0]}
                </span>
                <div className="h-5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="flex h-full items-center justify-end rounded-full bg-brand-green pr-2 text-[10px] font-extrabold text-primary-foreground transition-all duration-700"
                    style={{ width: `${Math.max(8, (a.xp_total / maxXp) * 100)}%` }}
                  >
                    {a.xp_total}
                  </div>
                </div>
              </div>
            ))}
          {alunos.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">Nenhum aluno cadastrado nesta turma.</p>
          )}
        </div>
      </Card>

      {/* Tempo de tela por aluno */}
      <Card className="p-4">
        <h3 className="mb-1 font-display text-lg font-extrabold">Tempo de tela — últimos 7 dias</h3>
        <p className="mb-3 text-xs font-semibold text-muted-foreground">
          Identifique baixo engajamento e uso excessivo. Nunca exibido entre os alunos.
        </p>
        <div className="space-y-2.5">
          {[...alunos]
            .sort((a, b) => b.tempo_tela_minutos_semana - a.tempo_tela_minutos_semana)
            .map((a) => {
              const diaMedia = Math.round(a.tempo_tela_minutos_semana / 7)
              const excessivo = diaMedia > META_TELA_DIARIA * 1.5
              const baixo = diaMedia < META_TELA_DIARIA * 0.4
              return (
                <div key={a.id} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 truncate text-sm font-bold">
                    {a.avatar} {a.nome.split(" ")[0]}
                  </span>
                  <div className="h-5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700",
                        excessivo ? "bg-brand-pink" : baixo ? "bg-brand-orange" : "bg-brand-turquoise",
                      )}
                      style={{ width: `${Math.min(100, (a.tempo_tela_minutos_semana / 350) * 100)}%` }}
                    />
                  </div>
                  <span
                    className={cn(
                      "w-20 shrink-0 text-right text-xs font-extrabold",
                      excessivo ? "text-brand-pink" : baixo ? "text-brand-orange" : "text-muted-foreground",
                    )}
                  >
                    {diaMedia}min/dia
                  </span>
                </div>
              )
            })}
        </div>
      </Card>
    </div>
  )
}

function StatCard({
  icon,
  cor,
  label,
  valor,
}: {
  icon: React.ReactNode
  cor: string
  label: string
  valor: string
}) {
  return (
    <Card className="flex items-center gap-3 p-3">
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-2xl text-white", cor)}>{icon}</span>
      <div className="min-w-0">
        <p className="font-display text-xl font-extrabold leading-none">{valor}</p>
        <p className="truncate text-xs font-bold text-muted-foreground">{label}</p>
      </div>
    </Card>
  )
}

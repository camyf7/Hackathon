"use client"

import type { Aluno } from "@/lib/types"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Heart, Target, Users } from "lucide-react"
import { StreakFlame } from "@/components/brand"

const TIPO_LABEL: Record<string, string> = { dupla: "Dupla", trio: "Trio", squad: "Squad de 4+" }

export function SquadView({ aluno }: { aluno: Aluno }) {
  const { db } = useStore()
  const squad = db.squads.find((s) => s.id === aluno.squad_id)

  if (!squad) {
    return (
      <div className="grid place-items-center gap-3 rounded-3xl bg-card p-10 text-center shadow-sm ring-1 ring-border">
        <span className="text-5xl">🧩</span>
        <h3 className="font-display text-xl font-extrabold">Você ainda não tem um squad</h3>
        <p className="text-sm font-semibold text-muted-foreground">
          A professora vai te colocar em um grupo em breve para vocês aprenderem juntos!
        </p>
      </div>
    )
  }

  const membros = squad.alunos_ids
    .map((id) => db.alunos.find((a) => a.id === id))
    .filter((a): a is Aluno => Boolean(a))

  const hoje = db.data_atual
  const colegaAusente = membros.find(
    (m) => m.id !== aluno.id && !db.presencas.some((p) => p.aluno_id === m.id && p.data === hoje && p.presente),
  )

  const missao = db.missoes.find((m) => m.squad_id === squad.id)
  const metaXp = 1500
  const pctColetivo = Math.min(100, Math.round((squad.xp_coletivo / metaXp) * 100))

  return (
    <div className="space-y-4 pb-4">
      <div className="rounded-3xl bg-gradient-to-br from-brand-purple/15 to-brand-turquoise/10 p-5 ring-1 ring-brand-purple/20">
        <div className="flex items-center gap-3">
          <span className="grid size-14 place-items-center rounded-2xl bg-white text-3xl shadow-sm">
            {squad.emoji}
          </span>
          <div>
            <h2 className="font-display text-2xl font-extrabold">Squad {squad.nome}</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-xs font-bold text-brand-purple">
              <Users className="size-3" /> {TIPO_LABEL[squad.tipo]}
            </span>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-sm font-extrabold">
            <span>XP coletivo</span>
            <span className="text-brand-purple">{squad.xp_coletivo} / {metaXp}</span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full bg-white/60">
            <div className="h-full rounded-full bg-brand-purple transition-all duration-700" style={{ width: `${pctColetivo}%` }} />
          </div>
        </div>
      </div>

      {/* Missão do squad */}
      {missao && (
        <div className="flex items-start gap-3 rounded-3xl bg-card p-4 shadow-sm ring-1 ring-border">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-green/15 text-primary">
            <Target className="size-5" />
          </span>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display font-extrabold">{missao.titulo}</h3>
              <span className="rounded-full bg-brand-gold/20 px-2 py-0.5 text-xs font-extrabold text-amber-700">
                +{missao.xp_recompensa} XP
              </span>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">{missao.descricao}</p>
          </div>
        </div>
      )}

      {/* Missão de cuidado (sutil, sem expor motivo) */}
      {colegaAusente && (
        <div className="flex items-center gap-3 rounded-3xl bg-brand-pink/10 p-4 ring-1 ring-brand-pink/20">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-pink/20 text-brand-pink">
            <Heart className="size-5 fill-brand-pink" />
          </span>
          <div>
            <h3 className="font-display font-extrabold">Missão de cuidado</h3>
            <p className="text-sm font-semibold text-muted-foreground">
              Que tal mandar um oi pro(a) {colegaAusente.nome.split(" ")[0]}? Um squad unido vai mais longe! 💜
            </p>
          </div>
        </div>
      )}

      {/* Membros */}
      <div className="rounded-3xl bg-card p-4 shadow-sm ring-1 ring-border">
        <h3 className="mb-3 font-display text-lg font-extrabold">Meu squad</h3>
        <div className="space-y-2">
          {membros.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex items-center gap-3 rounded-2xl p-2",
                m.id === aluno.id ? "bg-primary/10 ring-1 ring-primary/30" : "bg-muted/50",
              )}
            >
              <span className="grid size-11 place-items-center rounded-xl bg-white text-2xl shadow-sm">{m.avatar}</span>
              <div className="flex-1">
                <p className="font-display font-extrabold">
                  {m.nome} {m.id === aluno.id && <span className="text-xs text-primary">(você)</span>}
                </p>
                <p className="text-xs font-bold text-muted-foreground">Nível {m.nivel} · {m.xp_total} XP</p>
              </div>
              <StreakFlame dias={m.streak_dias} className="px-2 py-1 text-xs" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

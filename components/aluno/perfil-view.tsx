"use client"

import type { Aluno } from "@/lib/types"
import { useStore } from "@/lib/store"
import { BannerPerfil, XpBar } from "@/components/brand"
import { BADGES, META_TELA_DIARIA } from "@/lib/game"
import { cn } from "@/lib/utils"
import { Clock, Flame, Trophy } from "lucide-react"

export function PerfilView({ aluno }: { aluno: Aluno }) {
  const { db } = useStore()
  const banner = db.banners.find((b) => b.id === aluno.banner_equipado)
  const turma = db.turmas.find((t) => t.id === aluno.turma_id)

  const minHoje = aluno.tempo_tela_minutos_hoje
  const atingiuMeta = minHoje >= META_TELA_DIARIA
  const excedeu = minHoje >= META_TELA_DIARIA * 2

  return (
    <div className="space-y-4 pb-4">
      <BannerPerfil banner={banner} avatar={aluno.avatar} nome={aluno.nome}>
        <div className="mt-3 flex items-center gap-2">
          <span className="rounded-full bg-white/85 px-3 py-1 font-display text-sm font-extrabold text-foreground">
            Nível {aluno.nivel}
          </span>
          <span className="rounded-full bg-white/85 px-3 py-1 text-sm font-bold text-foreground">
            {turma?.nome}
          </span>
        </div>
      </BannerPerfil>

      <div className="rounded-3xl bg-card p-4 shadow-sm ring-1 ring-border">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-display font-extrabold">Progresso do nível</span>
          <span className="font-display font-extrabold text-primary">{aluno.xp_total} XP</span>
        </div>
        <XpBar xp={aluno.xp_total} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col items-center gap-1 rounded-3xl bg-brand-orange/10 p-4 text-center ring-1 ring-brand-orange/20">
          <Flame className="size-7 fill-brand-orange text-brand-orange" />
          <span className="font-display text-2xl font-extrabold text-brand-orange">{aluno.streak_dias}</span>
          <span className="text-xs font-bold text-muted-foreground">dias de streak</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-3xl bg-brand-gold/10 p-4 text-center ring-1 ring-brand-gold/20">
          <Trophy className="size-7 text-amber-500" />
          <span className="font-display text-2xl font-extrabold text-amber-600">{aluno.badges.length}</span>
          <span className="text-xs font-bold text-muted-foreground">medalhas</span>
        </div>
      </div>

      {/* Bem-estar digital / tempo de tela */}
      <div
        className={cn(
          "rounded-3xl p-4 ring-1",
          excedeu ? "bg-brand-purple/10 ring-brand-purple/20" : "bg-brand-turquoise/10 ring-brand-turquoise/20",
        )}
      >
        <div className="flex items-center gap-2">
          <Clock className={cn("size-5", excedeu ? "text-brand-purple" : "text-cyan-700")} />
          <span className="font-display font-extrabold">Tempo de estudo hoje</span>
        </div>
        <p className="mt-1 font-display text-2xl font-extrabold">
          {minHoje} min <span className="text-sm font-bold text-muted-foreground">de {META_TELA_DIARIA} min</span>
        </p>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-all", excedeu ? "bg-brand-purple" : "bg-brand-turquoise")}
            style={{ width: `${Math.min(100, (minHoje / META_TELA_DIARIA) * 100)}%` }}
          />
        </div>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">
          {excedeu
            ? "Já rendeu bastante hoje, que tal uma pausa pra descansar? 😴"
            : atingiuMeta
              ? "Meta do dia batida! Você mandou muito bem hoje 🎉"
              : "Cada minutinho conta. Bora completar um exercício?"}
        </p>
      </div>

      {/* Medalhas */}
      <div className="rounded-3xl bg-card p-4 shadow-sm ring-1 ring-border">
        <h3 className="mb-3 font-display text-lg font-extrabold">Minhas medalhas</h3>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {Object.entries(BADGES).map(([id, badge]) => {
            const conquistada = aluno.badges.includes(id)
            return (
              <div
                key={id}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl p-3 text-center transition",
                  conquistada ? "bg-brand-gold/15 ring-1 ring-brand-gold/30" : "bg-muted opacity-50 grayscale",
                )}
                title={badge.desc}
              >
                <span className={cn("text-3xl", conquistada && "animate-pop-in")}>{badge.emoji}</span>
                <span className="text-xs font-bold leading-tight">{badge.nome}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Trophy } from "lucide-react"

type Aba = "turma" | "escola"

const LIGAS = [
  { nome: "Ouro", emoji: "🥇", cor: "bg-brand-gold/20 text-amber-700 border-brand-gold", min: 1200 },
  { nome: "Prata", emoji: "🥈", cor: "bg-slate-200 text-slate-700 border-slate-300", min: 500 },
  { nome: "Bronze", emoji: "🥉", cor: "bg-orange-100 text-orange-800 border-orange-300", min: 0 },
]

function ligaDoXp(xp: number) {
  return LIGAS.find((l) => xp >= l.min) ?? LIGAS[LIGAS.length - 1]
}

export function RankingView() {
  const { db, escolaId, turmaId, alunoId } = useStore()
  const [aba, setAba] = useState<Aba>("turma")

  const meuSquadId = db.alunos.find((a) => a.id === alunoId)?.squad_id ?? null

  // Ranking por squads (nunca aluno individual exposto)
  const squadsTurma = db.squads
    .filter((s) => s.turma_id === turmaId)
    .map((s) => ({ id: s.id, nome: s.nome, emoji: s.emoji, xp: s.xp_coletivo }))

  // Ranking por turmas dentro da escola
  const turmasEscola = db.turmas
    .filter((t) => t.escola_id === escolaId)
    .map((t) => {
      const xp = db.alunos
        .filter((a) => a.turma_id === t.id)
        .reduce((s, a) => s + a.xp_total, 0)
      return { id: t.id, nome: t.nome, emoji: "🏫", xp }
    })

  const lista = (aba === "turma" ? squadsTurma : turmasEscola).sort((a, b) => b.xp - a.xp)

  // agrupar por liga
  const minhaLiga = aba === "turma" && meuSquadId
    ? ligaDoXp(squadsTurma.find((s) => s.id === meuSquadId)?.xp ?? 0)
    : ligaDoXp(lista[0]?.xp ?? 0)

  return (
    <div className="space-y-4">
      <div className="flex gap-2 rounded-full bg-muted p-1">
        {(["turma", "escola"] as Aba[]).map((a) => (
          <button
            key={a}
            onClick={() => setAba(a)}
            className={cn(
              "flex-1 rounded-full py-2 text-sm font-display font-extrabold transition-colors",
              aba === a ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            {a === "turma" ? "Minha turma" : "Minha escola"}
          </button>
        ))}
      </div>

      <Card
        className={cn(
          "flex items-center justify-between gap-3 border-2 p-4",
          minhaLiga.cor,
        )}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">{minhaLiga.emoji}</span>
          <div>
            <p className="font-display text-lg font-extrabold">Liga {minhaLiga.nome}</p>
            <p className="text-xs font-semibold opacity-80">
              {aba === "turma" ? "Squads competindo em nível parecido" : "Turmas da sua escola"}
            </p>
          </div>
        </div>
        <Trophy className="size-8 opacity-70" />
      </Card>

      <div className="space-y-2">
        {lista.map((item, i) => {
          const destaque = aba === "turma" && item.id === meuSquadId
          return (
            <Card
              key={item.id}
              className={cn(
                "flex items-center gap-3 p-3 transition-transform",
                destaque && "ring-2 ring-primary scale-[1.02] bg-primary/5",
              )}
            >
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-full font-display text-sm font-extrabold",
                  i === 0
                    ? "bg-brand-gold text-white"
                    : i === 1
                      ? "bg-slate-300 text-slate-700"
                      : i === 2
                        ? "bg-orange-300 text-orange-900"
                        : "bg-muted text-muted-foreground",
                )}
              >
                {i + 1}
              </span>
              <span className="text-2xl">{item.emoji}</span>
              <span className="flex-1 font-display font-extrabold">
                {item.nome}
                {destaque && <span className="ml-2 text-xs text-primary">(seu squad)</span>}
              </span>
              <span className="font-display font-extrabold text-brand-green">{item.xp} XP</span>
            </Card>
          )
        })}
        {lista.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Ainda não há squads/turmas para rankear aqui.
          </p>
        )}
      </div>
    </div>
  )
}

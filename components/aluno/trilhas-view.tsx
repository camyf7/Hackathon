"use client"

import { useMemo, useState } from "react"
import { useStore } from "@/lib/store"
import type { Aluno, Exercicio, Trilha } from "@/lib/types"
import { Confetti } from "@/components/confetti"
import { ExercicioDialog } from "./exercicio-dialog"
import { CheckinCard } from "./checkin-card"
import { cn } from "@/lib/utils"
import { Check, Lock, Star } from "lucide-react"
import { toast } from "sonner"

const CORES: Record<string, { bg: string; ring: string; texto: string }> = {
  green: { bg: "bg-brand-green", ring: "ring-brand-green/30", texto: "text-primary" },
  purple: { bg: "bg-brand-purple", ring: "ring-brand-purple/30", texto: "text-brand-purple" },
  turquoise: { bg: "bg-brand-turquoise", ring: "ring-brand-turquoise/30", texto: "text-cyan-700" },
  orange: { bg: "bg-brand-orange", ring: "ring-brand-orange/30", texto: "text-brand-orange" },
  pink: { bg: "bg-brand-pink", ring: "ring-brand-pink/30", texto: "text-brand-pink" },
}

export function TrilhasView({ aluno }: { aluno: Aluno }) {
  const { db } = useStore()
  const [fire, setFire] = useState(0)
  const [trilhaAtiva, setTrilhaAtiva] = useState<Trilha | null>(null)
  const [exercicio, setExercicio] = useState<Exercicio | null>(null)
  const [open, setOpen] = useState(false)

  const progressoMap = useMemo(() => {
    const m = new Map<string, { nivel_atual: number; completos: string[] }>()
    db.progresso
      .filter((p) => p.aluno_id === aluno.id)
      .forEach((p) => m.set(p.trilha_id, { nivel_atual: p.nivel_atual, completos: p.exercicios_completos }))
    return m
  }, [db.progresso, aluno.id])

  function abrirExercicio(trilha: Trilha, ex: Exercicio) {
    setTrilhaAtiva(trilha)
    setExercicio(ex)
    setOpen(true)
  }

  function aoAcertar(xp: number) {
    setFire((f) => f + 1)
    toast.success(`+${xp} XP conquistado!`, { icon: "⚡" })
  }

  return (
    <div className="space-y-8 pb-4">
      <Confetti fire={fire} />
      <CheckinCard aluno={aluno} onXp={() => setFire((f) => f + 1)} />

      {db.trilhas.map((trilha) => {
        const prog = progressoMap.get(trilha.id) ?? { nivel_atual: 1, completos: [] }
        const cor = CORES[trilha.cor] ?? CORES.green
        return (
          <section key={trilha.id}>
            <div className="mb-3 flex items-center gap-3 rounded-3xl bg-card p-3 shadow-sm ring-1 ring-border">
              <span className={cn("grid size-12 place-items-center rounded-2xl text-2xl text-white", cor.bg)}>
                {trilha.emoji}
              </span>
              <div className="flex-1">
                <h3 className="font-display text-lg font-extrabold">{trilha.nome}</h3>
                <p className="text-xs font-bold text-muted-foreground">
                  Nível {Math.min(prog.nivel_atual, trilha.niveis)} de {trilha.niveis}
                </p>
              </div>
            </div>

            {/* Caminho de níveis */}
            <div className="flex flex-col items-center gap-1">
              {trilha.exercicios.map((ex, idx) => {
                const nivel = ex.nivel
                const completo = nivel < prog.nivel_atual || prog.completos.includes(ex.id)
                const atual = nivel === prog.nivel_atual && !completo
                const bloqueado = nivel > prog.nivel_atual
                // deslocamento em zigue-zague
                const offset = [0, 60, 90, 60, 0, -60, -90][idx % 7]
                return (
                  <div
                    key={ex.id}
                    className="flex flex-col items-center"
                    style={{ transform: `translateX(${offset}px)` }}
                  >
                    <button
                      disabled={bloqueado}
                      onClick={() => abrirExercicio(trilha, ex)}
                      aria-label={`${trilha.nome} nível ${nivel}${bloqueado ? " (bloqueado)" : ""}`}
                      className={cn(
                        "relative grid size-16 place-items-center rounded-full text-white shadow-[0_5px_0_0_rgba(0,0,0,0.18)] transition active:translate-y-1 active:shadow-none",
                        completo && cn(cor.bg),
                        atual && cn(cor.bg, "ring-4 ring-offset-2", cor.ring, "animate-bounce-soft"),
                        bloqueado && "cursor-not-allowed bg-muted text-muted-foreground shadow-[0_5px_0_0_rgba(0,0,0,0.06)]",
                      )}
                    >
                      {completo ? (
                        <Check className="size-7" strokeWidth={3} />
                      ) : bloqueado ? (
                        <Lock className="size-6" />
                      ) : (
                        <Star className="size-7 fill-white" />
                      )}
                      {atual && (
                        <span className="absolute -top-8 whitespace-nowrap rounded-full bg-foreground px-2 py-1 text-xs font-extrabold text-background">
                          COMECE
                        </span>
                      )}
                    </button>
                    {idx < trilha.exercicios.length - 1 && (
                      <span className="my-0.5 h-5 w-1.5 rounded-full bg-border" />
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}

      {trilhaAtiva && (
        <ExercicioDialog
          trilha={trilhaAtiva}
          exercicio={exercicio}
          alunoId={aluno.id}
          open={open}
          onOpenChange={setOpen}
          onAcerto={aoAcertar}
        />
      )}
    </div>
  )
}

"use client"

import { useMemo, useState } from "react"
import { useStore } from "@/lib/store"
import type { Aluno, Exercicio, Trilha } from "@/lib/types"
import { Confetti } from "@/components/confetti"
import { ExercicioDialog } from "./exercicio-dialog"
import { CheckinCard } from "./checkin-card"
import { cn } from "@/lib/utils"
import { Check, ClipboardList, Lock, Star } from "lucide-react"
import { toast } from "sonner"

const CORES: Record<string, { bg: string; ring: string; texto: string }> = {
  green: { bg: "bg-brand-green", ring: "ring-brand-green/30", texto: "text-primary" },
  purple: { bg: "bg-brand-purple", ring: "ring-brand-purple/30", texto: "text-brand-purple" },
  turquoise: { bg: "bg-brand-turquoise", ring: "ring-brand-turquoise/30", texto: "text-cyan-700" },
  orange: { bg: "bg-brand-orange", ring: "ring-brand-orange/30", texto: "text-brand-orange" },
  pink: { bg: "bg-brand-pink", ring: "ring-brand-pink/30", texto: "text-brand-pink" },
}

// Iniciais do nome da disciplina, usadas no lugar de emoji para um
// visual mais sóbrio/profissional (ex.: "Matemática" -> "MA").
function iniciais(nome: string) {
  return nome.trim().slice(0, 2).toUpperCase()
}

// A tarefa que o professor cadastrou pode vir com nomes de campo
// diferentes dependendo de como foi criada. Esta função tenta os
// nomes mais prováveis sem quebrar caso algum não exista, e sempre
// cai em um texto padrão (nunca deixa a tela sem conteúdo).
function tarefaDoExercicio(ex: Exercicio | undefined) {
  if (!ex) return null
  const e = ex as unknown as Record<string, unknown>
  const titulo = (e.titulo ?? e.nome ?? e.pergunta ?? `Nível ${ex.nivel}`) as string
  const descricao = (e.descricao ?? e.enunciado ?? e.instrucoes ?? null) as string | null
  return { titulo, descricao }
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
    // overflow-x-hidden aqui é uma rede de segurança: garante que o
    // zigue-zague do caminho nunca "estoure" a tela e crie scroll
    // horizontal, mesmo em telas bem estreitas.
    <div className="space-y-8 overflow-x-hidden pb-4">
      <Confetti fire={fire} />
      <CheckinCard aluno={aluno} onXp={() => setFire((f) => f + 1)} />

      {db.trilhas.map((trilha) => {
        const prog = progressoMap.get(trilha.id) ?? { nivel_atual: 1, completos: [] }
        const cor = CORES[trilha.cor] ?? CORES.green
        const exercicioAtual = trilha.exercicios.find((ex) => ex.nivel === prog.nivel_atual)
        const tarefa = tarefaDoExercicio(exercicioAtual)

        return (
          <section key={trilha.id}>
            <div className="mb-3 flex items-center gap-3 rounded-3xl bg-card p-3 shadow-sm ring-1 ring-border">
              <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl text-sm font-extrabold tracking-wide text-white", cor.bg)}>
                {iniciais(trilha.nome)}
              </span>
              <div className="flex-1">
                <h3 className="font-display text-lg font-extrabold">{trilha.nome}</h3>
                <p className="text-xs font-bold text-muted-foreground">
                  Nível {Math.min(prog.nivel_atual, trilha.niveis)} de {trilha.niveis}
                </p>
              </div>
            </div>

            {/* Caminho de níveis — mesma lógica de progresso/bloqueio de
                antes. O max-w + padding lateral garante espaço suficiente
                para o zigue-zague sem cortar nem forçar scroll horizontal. */}
            <div className="mx-auto flex w-full max-w-md flex-col items-center gap-1 px-14 sm:px-20">
              {trilha.exercicios.map((ex, idx) => {
                const nivel = ex.nivel
                const completo = nivel < prog.nivel_atual || prog.completos.includes(ex.id)
                const atual = nivel === prog.nivel_atual && !completo
                const bloqueado = nivel > prog.nivel_atual
                // deslocamento em zigue-zague (mesma regra de antes)
                const offset = [0, 60, 90, 60, 0, -60, -90][idx % 7]
                return (
                  <div
                    key={ex.id}
                    className="flex flex-col items-center"
                    style={{ transform: `translateX(clamp(-72px, ${offset}px, 72px))` }}
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

            {/* Tarefa cadastrada pelo professor para o nível atual —
                renderizada fora do zigue-zague (sem transform), num
                retângulo com largura travada, então nunca estoura a
                tela mesmo com um texto longo. */}
            {tarefa && (
              <div className="mx-auto mt-4 w-full max-w-sm rounded-2xl bg-muted/60 p-4 ring-1 ring-border">
                <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
                  <ClipboardList className="size-3.5" /> Tarefa do professor
                </p>
                <p className="mt-1 line-clamp-1 font-display text-sm font-extrabold">{tarefa.titulo}</p>
                {tarefa.descricao && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{tarefa.descricao}</p>
                )}
              </div>
            )}
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
"use client"

import { useEffect, useState } from "react"
import { useStore } from "@/lib/store"
import type { Atividade } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { CalendarClock, CheckCircle2, Circle, FileText, XCircle, Zap } from "lucide-react"
import { toast } from "sonner"

const DIFICULDADE_LABEL: Record<string, string> = {
  facil: "Fácil",
  media: "Média",
  dificil: "Difícil",
}

interface AtividadeDialogProps {
  atividade: Atividade | null
  alunoId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onConcluir: (xp: number) => void
}

export function AtividadeDialog({ atividade, alunoId, open, onOpenChange, onConcluir }: AtividadeDialogProps) {
  const { concluirAtividade } = useStore()
  const [enviando, setEnviando] = useState(false)
  const [respostaSelecionada, setRespostaSelecionada] = useState<number | null>(null)

  const ehQuiz = atividade?.tipo_resposta === "multipla_escolha"

  useEffect(() => {
    setRespostaSelecionada(null)
  }, [atividade?.id])

  if (!atividade) return null

  const jaConcluida = atividade.alunos_concluidos.includes(alunoId)
  const podeConfirmar = !jaConcluida && (!ehQuiz || respostaSelecionada !== null)

  function confirmar() {
    if (!atividade || jaConcluida || !podeConfirmar) return
    setEnviando(true)

    const textoResposta =
      ehQuiz && respostaSelecionada !== null
        ? atividade.opcoes?.[respostaSelecionada]
        : undefined

    const resultado = concluirAtividade(atividade.id, alunoId, textoResposta)
    const xpGanho = resultado?.xp ?? 0

    onConcluir(xpGanho)

    if (ehQuiz) {
      if (resultado?.acertou) {
        toast.success(`Resposta certa! +${xpGanho} XP`, { icon: <CheckCircle2 className="size-4" /> })
      } else {
        toast.error("Não foi dessa vez — sem XP nessa atividade.", { icon: <XCircle className="size-4" /> })
      }
    } else {
      toast.success(`Atividade concluída! +${xpGanho} XP`, { icon: <CheckCircle2 className="size-4" /> })
    }

    setEnviando(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{atividade.titulo}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {atividade.descricao && (
            <p className="text-sm text-muted-foreground">{atividade.descricao}</p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Zap className="size-3.5 text-amber-400" /> +{atividade.xp} XP
            </span>
            <span className="capitalize">{DIFICULDADE_LABEL[atividade.dificuldade] ?? atividade.dificuldade}</span>
            {atividade.prazo && (
              <span className="flex items-center gap-1">
                <CalendarClock className="size-3.5" /> prazo: {atividade.prazo}
              </span>
            )}
          </div>

          {ehQuiz && atividade.pergunta && (
            <div className="space-y-2 rounded-2xl border border-border bg-muted/30 p-3">
              <p className="text-sm font-bold text-foreground">{atividade.pergunta}</p>
              <div className="space-y-1.5">
                {(atividade.opcoes ?? []).map((op, i) => {
                  const selecionada = respostaSelecionada === i
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={jaConcluida}
                      onClick={() => setRespostaSelecionada(i)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition disabled:opacity-60",
                        selecionada
                          ? "border-primary bg-primary/10 font-semibold text-foreground"
                          : "border-border bg-card text-foreground hover:border-primary/40",
                      )}
                    >
                      {selecionada ? (
                        <CheckCircle2 className="size-4 shrink-0 text-primary" />
                      ) : (
                        <Circle className="size-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="min-w-0 flex-1">{op}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {atividade.anexos.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-muted-foreground">Material do professor</p>
              {atividade.anexos.map((ax) => (
                <div
                  key={ax.id}
                  className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm"
                >
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">{ax.nome}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={confirmar}
            disabled={!podeConfirmar || enviando}
            className="w-full rounded-2xl py-6 font-bold disabled:opacity-60"
          >
            <CheckCircle2 className="size-4" />{" "}
            {jaConcluida
              ? "Atividade concluída"
              : ehQuiz && respostaSelecionada === null
                ? "Escolha uma opção"
                : "Marcar como concluída"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
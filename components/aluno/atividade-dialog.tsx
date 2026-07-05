"use client"

import { useState } from "react"
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
import { CalendarClock, CheckCircle2, FileText, Zap } from "lucide-react"
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

  if (!atividade) return null

  const jaConcluida = atividade.alunos_concluidos.includes(alunoId)

  function confirmar() {
    if (!atividade || jaConcluida) return
    setEnviando(true)
    concluirAtividade(alunoId, atividade.id)
    onConcluir(atividade.xp)
    toast.success(`Atividade concluída! +${atividade.xp} XP`, {
      icon: <CheckCircle2 className="size-4" />,
    })
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
            disabled={jaConcluida || enviando}
            className="w-full rounded-2xl py-6 font-bold disabled:opacity-60"
          >
            <CheckCircle2 className="size-4" /> {jaConcluida ? "Atividade concluída" : "Marcar como concluída"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
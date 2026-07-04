"use client"

import { useStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatarDataCurta } from "@/lib/game"
import { Check, Minus, X } from "lucide-react"

type Estado = "presente" | "falta" | "justificada"

export function PresencaTab({ turmaId }: { turmaId: string }) {
  const { db, marcarPresenca } = useStore()
  const alunos = db.alunos
    .filter((a) => a.turma_id === turmaId)
    .sort((a, b) => a.nome.localeCompare(b.nome))
  const hoje = db.data_atual

  function estadoDe(alunoId: string): Estado | null {
    const p = db.presencas.find((x) => x.aluno_id === alunoId && x.data === hoje)
    if (!p) return null
    if (p.presente) return "presente"
    return p.justificada ? "justificada" : "falta"
  }

  return (
    <div className="space-y-4">
      <Card className="flex items-center justify-between p-4">
        <div>
          <h3 className="font-display text-lg font-extrabold">Chamada de hoje</h3>
          <p className="text-xs font-bold text-muted-foreground">
            {formatarDataCurta(hoje)} · alimenta o streak dos alunos automaticamente
          </p>
        </div>
        <span className="text-3xl">📋</span>
      </Card>

      <div className="space-y-2">
        {alunos.map((a) => {
          const estado = estadoDe(a.id)
          return (
            <Card key={a.id} className="flex items-center gap-3 p-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-muted text-xl">
                {a.avatar}
              </span>
              <span className="min-w-0 flex-1 truncate font-display font-extrabold">{a.nome}</span>
              <div className="flex gap-1.5">
                <BotaoEstado
                  ativo={estado === "presente"}
                  cor="bg-brand-green text-primary-foreground"
                  onClick={() => marcarPresenca(a.id, hoje, "presente")}
                  aria="Presente"
                >
                  <Check className="size-4" />
                </BotaoEstado>
                <BotaoEstado
                  ativo={estado === "justificada"}
                  cor="bg-brand-gold text-amber-900"
                  onClick={() => marcarPresenca(a.id, hoje, "justificada")}
                  aria="Falta justificada"
                >
                  <Minus className="size-4" />
                </BotaoEstado>
                <BotaoEstado
                  ativo={estado === "falta"}
                  cor="bg-destructive text-white"
                  onClick={() => marcarPresenca(a.id, hoje, "falta")}
                  aria="Falta"
                >
                  <X className="size-4" />
                </BotaoEstado>
              </div>
            </Card>
          )
        })}
        {alunos.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">Nenhum aluno nesta turma.</p>
        )}
      </div>

      <div className="flex flex-wrap gap-3 text-xs font-bold text-muted-foreground">
        <span className="flex items-center gap-1"><span className="size-3 rounded-full bg-brand-green" /> Presente</span>
        <span className="flex items-center gap-1"><span className="size-3 rounded-full bg-brand-gold" /> Justificada</span>
        <span className="flex items-center gap-1"><span className="size-3 rounded-full bg-destructive" /> Falta</span>
      </div>
    </div>
  )
}

function BotaoEstado({
  ativo,
  cor,
  onClick,
  aria,
  children,
}: {
  ativo: boolean
  cor: string
  onClick: () => void
  aria: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      aria-label={aria}
      aria-pressed={ativo}
      className={cn(
        "grid size-10 place-items-center rounded-2xl border-2 transition",
        ativo ? cn(cor, "border-transparent scale-105") : "border-border bg-card text-muted-foreground hover:border-primary/40",
      )}
    >
      {children}
    </button>
  )
}

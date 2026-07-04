"use client"

import { useStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatarDataCurta } from "@/lib/game"
import { Check, Gift, X } from "lucide-react"
import { toast } from "sonner"
import type { CategoriaRecompensa } from "@/lib/types"

const EMOJI_CATEGORIA: Record<CategoriaRecompensa, string> = {
  ponto_extra: "✏️",
  cinema: "🎬",
  dia_sem_uniforme: "👕",
  certificado: "📜",
  material: "🎒",
}

export function AprovacoesTab({ turmaId }: { turmaId: string }) {
  const { db, aprovarResgate } = useStore()
  const resgates = db.resgates.filter((r) => r.turma_id === turmaId)
  const pendentes = resgates.filter((r) => r.status === "pendente")
  const resolvidos = resgates.filter((r) => r.status !== "pendente")

  function nomeSolicitante(r: (typeof resgates)[number]) {
    if (r.solicitante_tipo === "aluno") {
      return db.alunos.find((a) => a.id === r.solicitante_id)?.nome ?? "Aluno"
    }
    return `Squad ${db.squads.find((s) => s.id === r.solicitante_id)?.nome ?? ""}`
  }

  function recompensaInfo(id: string) {
    const r = db.recompensas.find((x) => x.id === id)
    if (!r) return { label: "Recompensa removida", emoji: "🎁" }
    return { label: r.nome, emoji: EMOJI_CATEGORIA[r.categoria] ?? "🎁" }
  }

  return (
    <div className="space-y-4">
      <Card className="flex items-center gap-3 border-2 border-dashed border-brand-green/40 bg-brand-green/5 p-4">
        <Gift className="size-6 text-brand-green" />
        <p className="text-sm font-semibold">
          Recompensas do mundo real precisam do seu aval. O critério pedagógico final é sempre humano.
        </p>
      </Card>

      <div>
        <h3 className="mb-2 font-display text-lg font-extrabold">
          Fila de aprovação {pendentes.length > 0 && <Badge className="ml-1">{pendentes.length}</Badge>}
        </h3>
        {pendentes.length === 0 ? (
          <p className="rounded-2xl bg-muted p-6 text-center text-sm font-semibold text-muted-foreground">
            Nenhum resgate pendente. Quando um aluno solicitar, aparece aqui.
          </p>
        ) : (
          <div className="space-y-2">
            {pendentes.map((r) => {
              const info = recompensaInfo(r.recompensa_id)
              return (
                <Card key={r.id} className="flex flex-wrap items-center gap-3 p-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-muted text-xl">
                    {info.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-extrabold">{info.label}</p>
                    <p className="text-xs font-bold text-muted-foreground">
                      Solicitado por {nomeSolicitante(r)} · {formatarDataCurta(r.data)} · {r.custo_xp} XP
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        aprovarResgate(r.id, true)
                        toast.success("Resgate aprovado!")
                      }}
                      className="rounded-2xl bg-brand-green font-extrabold text-primary-foreground hover:bg-brand-green/90"
                    >
                      <Check className="size-4" /> Aprovar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        aprovarResgate(r.id, false)
                        toast("Resgate negado")
                      }}
                      className="rounded-2xl font-extrabold"
                    >
                      <X className="size-4" /> Negar
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {resolvidos.length > 0 && (
        <div>
          <h3 className="mb-2 font-display text-lg font-extrabold">Histórico</h3>
          <div className="space-y-2">
            {resolvidos.map((r) => {
              const info = recompensaInfo(r.recompensa_id)
              return (
                <Card key={r.id} className="flex items-center gap-3 p-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-muted text-lg">
                    {info.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display font-bold">{info.label}</p>
                    <p className="text-xs font-bold text-muted-foreground">{nomeSolicitante(r)}</p>
                  </div>
                  <Badge
                    className={cn(
                      r.status === "aprovada"
                        ? "bg-brand-green/20 text-green-700"
                        : "bg-destructive/15 text-destructive",
                    )}
                  >
                    {r.status === "aprovada" ? "Aprovada" : "Negada"}
                  </Badge>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
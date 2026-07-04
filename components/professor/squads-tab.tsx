"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Shuffle, Trash2, Users, Wand2 } from "lucide-react"
import { toast } from "sonner"

export function SquadsTab({ turmaId }: { turmaId: string }) {
  const { db, criarSquad, removerSquad, gerarSquadsAuto } = useStore()
  const alunos = db.alunos.filter((a) => a.turma_id === turmaId)
  const squads = db.squads.filter((s) => s.turma_id === turmaId)

  const [selecionados, setSelecionados] = useState<string[]>([])
  const [nomeSquad, setNomeSquad] = useState("")

  function toggle(id: string) {
    setSelecionados((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function criar() {
    if (selecionados.length < 2) {
      toast.error("Selecione ao menos 2 alunos")
      return
    }
    criarSquad(turmaId, nomeSquad.trim() || "Novo Squad", selecionados)
    toast.success("Squad criado!")
    setSelecionados([])
    setNomeSquad("")
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-lg font-extrabold">Montar novo squad</h3>
          <Button
            variant="secondary"
            onClick={() => {
              gerarSquadsAuto(turmaId)
              toast.success("Squads gerados misturando níveis de engajamento!")
            }}
            className="rounded-2xl font-bold"
          >
            <Wand2 className="size-4" /> Gerar automaticamente
          </Button>
        </div>
        <p className="mb-3 text-xs font-semibold text-muted-foreground">
          Selecione 2 (dupla), 3 (trio) ou 4+ alunos (squad). O modo automático mistura quem engaja muito com
          quem engaja pouco.
        </p>
        <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {alunos.map((a) => {
            const sel = selecionados.includes(a.id)
            return (
              <button
                key={a.id}
                onClick={() => toggle(a.id)}
                className={cn(
                  "flex items-center gap-2 rounded-2xl border-2 p-2 text-left transition",
                  sel ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40",
                )}
              >
                <span className="grid size-9 place-items-center rounded-xl bg-muted text-xl">{a.avatar}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">{a.nome.split(" ")[0]}</span>
                  <span className="block text-[10px] font-bold text-muted-foreground">{a.xp_total} XP</span>
                </span>
              </button>
            )
          })}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={nomeSquad}
            onChange={(e) => setNomeSquad(e.target.value)}
            placeholder="Nome do squad (opcional)"
            className="rounded-2xl"
          />
          <Button onClick={criar} className="rounded-2xl font-extrabold">
            <Users className="size-4" /> Criar squad ({selecionados.length})
          </Button>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {squads.map((s) => {
          const membros = s.alunos_ids.map((id) => db.alunos.find((a) => a.id === id)).filter(Boolean)
          return (
            <Card key={s.id} className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{s.emoji}</span>
                  <div>
                    <p className="font-display font-extrabold">{s.nome}</p>
                    <p className="text-xs font-bold text-muted-foreground capitalize">
                      {s.tipo} · {s.xp_coletivo} XP
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    removerSquad(s.id)
                    toast.success("Squad desfeito")
                  }}
                  aria-label={`Remover squad ${s.nome}`}
                  className="grid size-9 place-items-center rounded-xl bg-muted text-muted-foreground transition hover:bg-destructive/15 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {membros.map((m) => (
                  <span
                    key={m!.id}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs font-bold"
                  >
                    {m!.avatar} {m!.nome.split(" ")[0]}
                  </span>
                ))}
              </div>
            </Card>
          )
        })}
        {squads.length === 0 && (
          <Card className="col-span-full grid place-items-center gap-2 p-8 text-center">
            <Shuffle className="size-8 text-muted-foreground" />
            <p className="font-semibold text-muted-foreground">Nenhum squad ainda. Monte o primeiro!</p>
          </Card>
        )}
      </div>
    </div>
  )
}

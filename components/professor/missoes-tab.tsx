"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Target } from "lucide-react"
import { toast } from "sonner"

export function MissoesTab({ turmaId }: { turmaId: string }) {
  const { db, postarMissao } = useStore()
  const squads = db.squads.filter((s) => s.turma_id === turmaId)
  const missoes = db.missoes.filter((m) => m.turma_id === turmaId)

  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [xp, setXp] = useState("50")
  const [alvo, setAlvo] = useState("turma")

  function postar() {
    if (!titulo.trim()) {
      toast.error("Dê um título para a missão")
      return
    }
    postarMissao(
      turmaId,
      alvo === "turma" ? null : alvo,
      titulo.trim(),
      descricao.trim() || "Missão bônus da turma",
      Number(xp) || 50,
    )
    toast.success("Missão publicada!")
    setTitulo("")
    setDescricao("")
    setXp("50")
    setAlvo("turma")
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3 p-4">
        <h3 className="font-display text-lg font-extrabold">Postar missão extra</h3>
        <div className="space-y-1.5">
          <Label htmlFor="titulo-missao">Título</Label>
          <Input
            id="titulo-missao"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex: Desafio da tabuada"
            className="rounded-2xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="desc-missao">Descrição</Label>
          <Textarea
            id="desc-missao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="O que a turma/squad precisa fazer?"
            className="rounded-2xl"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="xp-missao">XP de recompensa</Label>
            <Input
              id="xp-missao"
              type="number"
              value={xp}
              onChange={(e) => setXp(e.target.value)}
              className="rounded-2xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Para quem?</Label>
            <Select value={alvo} onValueChange={setAlvo}>
              <SelectTrigger className="rounded-2xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="turma">Turma inteira</SelectItem>
                {squads.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    Squad {s.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={postar} className="w-full rounded-2xl py-6 font-extrabold">
          <Target className="size-4" /> Publicar missão
        </Button>
      </Card>

      <div className="space-y-2">
        <h3 className="font-display text-lg font-extrabold">Missões ativas</h3>
        {missoes.map((m) => {
          const squad = m.squad_id ? db.squads.find((s) => s.id === m.squad_id) : null
          return (
            <Card key={m.id} className="flex items-start gap-3 p-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-brand-green/15 text-primary">
                <Target className="size-5" />
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display font-extrabold">{m.titulo}</p>
                  <span className="rounded-full bg-brand-gold/20 px-2 py-0.5 text-xs font-extrabold text-amber-700">
                    +{m.xp_recompensa} XP
                  </span>
                </div>
                <p className="text-sm font-semibold text-muted-foreground">{m.descricao}</p>
                <p className="mt-1 text-xs font-bold text-brand-purple">
                  {squad ? `Squad ${squad.nome}` : "Turma inteira"}
                </p>
              </div>
            </Card>
          )
        })}
        {missoes.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma missão extra ainda.</p>
        )}
      </div>
    </div>
  )
}

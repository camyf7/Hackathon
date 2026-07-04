"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Pencil, Plus, Trash2, UserPlus } from "lucide-react"
import { toast } from "sonner"
import type { Aluno } from "@/lib/types"

const AVATARES = ["🦊", "🐼", "🦁", "🐨", "🐸", "🦉", "🐙", "🦄", "🐵", "🐯", "🐧", "🦖", "🐢", "🐝", "🦋", "🐰"]

export function AlunosTab({ turmaId }: { turmaId: string }) {
  const { db, adicionarAluno, atualizarAluno, removerAluno } = useStore()
  const alunos = db.alunos
    .filter((a) => a.turma_id === turmaId)
    .sort((a, b) => a.nome.localeCompare(b.nome))

  const [open, setOpen] = useState(false)
  const [editando, setEditando] = useState<Aluno | null>(null)
  const [nome, setNome] = useState("")
  const [avatar, setAvatar] = useState(AVATARES[0])

  function abrirNovo() {
    setEditando(null)
    setNome("")
    setAvatar(AVATARES[Math.floor(Math.random() * AVATARES.length)])
    setOpen(true)
  }

  function abrirEdicao(a: Aluno) {
    setEditando(a)
    setNome(a.nome)
    setAvatar(a.avatar)
    setOpen(true)
  }

  function salvar() {
    if (!nome.trim()) {
      toast.error("Digite o nome do aluno")
      return
    }
    if (editando) {
      atualizarAluno(editando.id, nome.trim(), avatar)
      toast.success("Aluno atualizado!")
    } else {
      adicionarAluno(nome.trim(), turmaId, avatar)
      toast.success("Aluno cadastrado com XP e streak zerados!")
    }
    setOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-muted-foreground">
          {alunos.length} aluno(s). Só a professora cadastra — sem autocadastro.
        </p>
        <Button onClick={abrirNovo} className="rounded-2xl font-extrabold">
          <UserPlus className="size-4" /> Cadastrar aluno
        </Button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {alunos.map((a) => {
          const squad = db.squads.find((s) => s.id === a.squad_id)
          return (
            <Card key={a.id} className="flex items-center gap-3 p-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-muted text-2xl">
                {a.avatar}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display font-extrabold">{a.nome}</p>
                <p className="text-xs font-bold text-muted-foreground">
                  Nv {a.nivel} · {a.xp_total} XP · {squad ? `Squad ${squad.nome}` : "sem grupo"}
                </p>
              </div>
              <button
                onClick={() => abrirEdicao(a)}
                aria-label={`Editar ${a.nome}`}
                className="grid size-9 place-items-center rounded-xl bg-muted text-muted-foreground transition hover:bg-brand-turquoise/15 hover:text-cyan-700"
              >
                <Pencil className="size-4" />
              </button>
              <button
                onClick={() => {
                  removerAluno(a.id)
                  toast.success("Aluno removido")
                }}
                aria-label={`Remover ${a.nome}`}
                className="grid size-9 place-items-center rounded-xl bg-muted text-muted-foreground transition hover:bg-destructive/15 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </Card>
          )
        })}
        {alunos.length === 0 && (
          <Card className="col-span-full grid place-items-center gap-2 p-8 text-center">
            <span className="text-4xl">📝</span>
            <p className="font-semibold text-muted-foreground">Nenhum aluno ainda. Cadastre o primeiro!</p>
          </Card>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editando ? "Editar aluno" : "Cadastrar novo aluno"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nome-aluno">Nome completo</Label>
              <Input
                id="nome-aluno"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Ana Beatriz Silva"
                className="rounded-2xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Avatar</Label>
              <div className="flex flex-wrap gap-2">
                {AVATARES.map((av) => (
                  <button
                    key={av}
                    onClick={() => setAvatar(av)}
                    className={cn(
                      "grid size-11 place-items-center rounded-2xl border-2 text-2xl transition",
                      avatar === av ? "border-primary bg-primary/10 scale-110" : "border-border bg-card",
                    )}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={salvar} className="w-full rounded-2xl py-6 font-extrabold">
              <Plus className="size-4" /> {editando ? "Salvar alterações" : "Cadastrar aluno"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

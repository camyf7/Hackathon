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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Gift, Pencil, Plus, Power, Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { CategoriaRecompensa, Recompensa } from "@/lib/types"

const CATEGORIAS: { value: CategoriaRecompensa; label: string; emoji: string }[] = [
  { value: "ponto_extra", label: "Ponto extra", emoji: "✏️" },
  { value: "cinema", label: "Cinema", emoji: "🎬" },
  { value: "dia_sem_uniforme", label: "Dia sem uniforme", emoji: "👕" },
  { value: "certificado", label: "Certificado", emoji: "📜" },
  { value: "material", label: "Material escolar", emoji: "🎒" },
]

function emojiCategoria(categoria: CategoriaRecompensa) {
  return CATEGORIAS.find((c) => c.value === categoria)?.emoji ?? "🎁"
}

function labelCategoria(categoria: CategoriaRecompensa) {
  return CATEGORIAS.find((c) => c.value === categoria)?.label ?? categoria
}

export function RecompensasTab({ turmaId }: { turmaId: string }) {
  const { db, criarRecompensa, atualizarRecompensa, alternarStatusRecompensa, removerRecompensa } = useStore()

  const recompensas = db.recompensas
    .filter((r) => r.turma_id === turmaId)
    .sort((a, b) => (a.criada_em < b.criada_em ? 1 : -1))

  const [open, setOpen] = useState(false)
  const [editando, setEditando] = useState<Recompensa | null>(null)
  const [nome, setNome] = useState("")
  const [descricao, setDescricao] = useState("")
  const [categoria, setCategoria] = useState<CategoriaRecompensa>("ponto_extra")
  const [custoXp, setCustoXp] = useState("500")
  const [quantidade, setQuantidade] = useState("10")

  function abrirNova() {
    setEditando(null)
    setNome("")
    setDescricao("")
    setCategoria("ponto_extra")
    setCustoXp("500")
    setQuantidade("10")
    setOpen(true)
  }

  function abrirEdicao(r: Recompensa) {
    setEditando(r)
    setNome(r.nome)
    setDescricao(r.descricao)
    setCategoria(r.categoria)
    setCustoXp(String(r.custo_xp))
    setQuantidade(String(r.quantidade))
    setOpen(true)
  }

  function salvar() {
    if (!nome.trim()) {
      toast.error("Dê um nome para a recompensa")
      return
    }
    const dados = {
      nome: nome.trim(),
      descricao: descricao.trim(),
      categoria,
      imagem: null,
      custo_xp: Number(custoXp) || 0,
      quantidade: Number(quantidade) || 0,
      status: (editando?.status ?? "ativa") as "ativa" | "inativa",
    }
    if (editando) {
      atualizarRecompensa(editando.id, dados)
      toast.success("Recompensa atualizada!")
    } else {
      criarRecompensa(turmaId, dados)
      toast.success("Recompensa criada!")
    }
    setOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-muted-foreground">
          {recompensas.length} recompensa(s) cadastrada(s) para esta turma.
        </p>
        <Button onClick={abrirNova} className="rounded-2xl font-extrabold">
          <Plus className="size-4" /> Nova recompensa
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {recompensas.map((r) => {
          const inativa = r.status === "inativa"
          return (
            <Card key={r.id} className={cn("p-4", inativa && "opacity-60")}>
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-gold/20 text-2xl">
                  {emojiCategoria(r.categoria)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display font-extrabold">{r.nome}</p>
                  <p className="text-xs font-bold text-muted-foreground">{labelCategoria(r.categoria)}</p>
                </div>
              </div>
              {r.descricao && (
                <p className="mt-2 text-sm font-semibold text-muted-foreground">{r.descricao}</p>
              )}
              <div className="mt-3 flex items-center justify-between">
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-extrabold text-primary">
                  {r.custo_xp} XP
                </span>
                <span className="text-xs font-bold text-muted-foreground">{r.quantidade} disponíveis</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-bold",
                    inativa ? "bg-muted text-muted-foreground" : "bg-brand-green/15 text-green-700",
                  )}
                >
                  {inativa ? "Inativa" : "Ativa"}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => abrirEdicao(r)}
                    aria-label={`Editar ${r.nome}`}
                    className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    onClick={() => alternarStatusRecompensa(r.id)}
                    aria-label={`Alternar status de ${r.nome}`}
                    className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted"
                  >
                    <Power className="size-4" />
                  </button>
                  <button
                    onClick={() => {
                      removerRecompensa(r.id)
                      toast.success("Recompensa removida")
                    }}
                    aria-label={`Remover ${r.nome}`}
                    className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </Card>
          )
        })}

        {recompensas.length === 0 && (
          <Card className="col-span-full grid place-items-center gap-2 p-10 text-center">
            <Gift className="size-8 text-muted-foreground" />
            <p className="font-semibold text-muted-foreground">
              Nenhuma recompensa cadastrada ainda para esta turma.
            </p>
          </Card>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editando ? "Editar recompensa" : "Nova recompensa"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nome-rec">Nome</Label>
              <Input
                id="nome-rec"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Ponto extra na avaliação"
                className="rounded-2xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desc-rec">Descrição</Label>
              <Textarea
                id="desc-rec"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Detalhes da recompensa"
                className="rounded-2xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Select value={categoria} onValueChange={(v) => setCategoria(v as CategoriaRecompensa)}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.emoji} {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="custo-rec">Custo em XP</Label>
                <Input
                  id="custo-rec"
                  type="number"
                  min={0}
                  step={50}
                  value={custoXp}
                  onChange={(e) => setCustoXp(e.target.value)}
                  className="rounded-2xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qtd-rec">Quantidade disponível</Label>
                <Input
                  id="qtd-rec"
                  type="number"
                  min={0}
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  className="rounded-2xl"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={salvar} className="w-full rounded-2xl py-6 font-extrabold">
              <Plus className="size-4" /> {editando ? "Salvar alterações" : "Criar recompensa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
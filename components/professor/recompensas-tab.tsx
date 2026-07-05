"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { formatarDataCurta } from "@/lib/game"
import { Check, Gift, LayoutGrid, Pencil, Plus, Power, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import type { Recompensa } from "@/lib/types"

// Classe compartilhada dos DialogContent: `overflow-hidden` evita que
// inputs/botões vazem para fora do canto arredondado do modal.
const DIALOG_CONTENT_CLASS = "overflow-hidden rounded-3xl box-border"

type Visao = "catalogo" | "aprovacoes"

/**
 * Ícone da recompensa. Um único ícone consistente (lucide `Gift`) em vez
 * de emoji por categoria — o mesmo visual é reaproveitado no catálogo,
 * na fila de aprovação e no perfil do aluno.
 */
function IconeRecompensa({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-2xl bg-brand-gold/20 text-brand-gold",
        className,
      )}
    >
      <Gift className="size-5" />
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Segmentado: Catálogo / Aprovações                                  */
/* ------------------------------------------------------------------ */

function SeletorVisao({
  visao,
  onMudar,
  pendentes,
}: {
  visao: Visao
  onMudar: (v: Visao) => void
  pendentes: number
}) {
  return (
    <div className="flex gap-2 rounded-full bg-muted p-1">
      <button
        onClick={() => onMudar("catalogo")}
        className={cn(
          "flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-sm font-display font-extrabold transition-colors",
          visao === "catalogo" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
        )}
      >
        <LayoutGrid className="size-4" /> Catálogo
      </button>
      <button
        onClick={() => onMudar("aprovacoes")}
        className={cn(
          "flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-sm font-display font-extrabold transition-colors",
          visao === "aprovacoes" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
        )}
      >
        <Check className="size-4" /> Aprovações
        {pendentes > 0 && <Badge className="ml-0.5 px-1.5">{pendentes}</Badge>}
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Catálogo de recompensas                                            */
/* ------------------------------------------------------------------ */

function RecompensaCard({
  recompensa,
  onEditar,
  onAlternarStatus,
  onRemover,
}: {
  recompensa: Recompensa
  onEditar: () => void
  onAlternarStatus: () => void
  onRemover: () => void
}) {
  const inativa = recompensa.status === "inativa"

  return (
    <Card className={cn("p-4", inativa && "opacity-60")}>
      <div className="flex items-start gap-3">
        <IconeRecompensa className="size-11" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display font-extrabold">{recompensa.nome}</p>
          {recompensa.categoria && (
            <p className="text-xs font-bold text-muted-foreground">{recompensa.categoria}</p>
          )}
        </div>
      </div>

      {recompensa.descricao && (
        <p className="mt-2 text-sm font-semibold text-muted-foreground">{recompensa.descricao}</p>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-extrabold text-primary">
          {recompensa.custo_xp} XP
        </span>
        <span className="text-xs font-bold text-muted-foreground">
          {recompensa.quantidade} disponíveis
        </span>
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
            onClick={onEditar}
            aria-label={`Editar ${recompensa.nome}`}
            className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted"
          >
            <Pencil className="size-4" />
          </button>
          <button
            onClick={onAlternarStatus}
            aria-label={`Alternar status de ${recompensa.nome}`}
            className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted"
          >
            <Power className="size-4" />
          </button>
          <button
            onClick={onRemover}
            aria-label={`Remover ${recompensa.nome}`}
            className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
    </Card>
  )
}

function CatalogoRecompensas({
  turmaId,
  recompensas,
}: {
  turmaId: string
  recompensas: Recompensa[]
}) {
  const { criarRecompensa, atualizarRecompensa, alternarStatusRecompensa, removerRecompensa } =
    useStore()

  const [open, setOpen] = useState(false)
  const [editando, setEditando] = useState<Recompensa | null>(null)
  const [nome, setNome] = useState("")
  const [descricao, setDescricao] = useState("")
  const [categoria, setCategoria] = useState("")
  const [custoXp, setCustoXp] = useState("500")
  const [quantidade, setQuantidade] = useState("10")

  function abrirNova() {
    setEditando(null)
    setNome("")
    setDescricao("")
    setCategoria("")
    setCustoXp("500")
    setQuantidade("10")
    setOpen(true)
  }

  function abrirEdicao(r: Recompensa) {
    setEditando(r)
    setNome(r.nome)
    setDescricao(r.descricao)
    setCategoria(r.categoria ?? "")
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
      categoria: categoria.trim(),
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

  function remover(r: Recompensa) {
    removerRecompensa(r.id)
    toast.success("Recompensa removida")
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
        {recompensas.map((r) => (
          <RecompensaCard
            key={r.id}
            recompensa={r}
            onEditar={() => abrirEdicao(r)}
            onAlternarStatus={() => alternarStatusRecompensa(r.id)}
            onRemover={() => remover(r)}
          />
        ))}

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
        <DialogContent className={DIALOG_CONTENT_CLASS}>
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editando ? "Editar recompensa" : "Nova recompensa"}
            </DialogTitle>
          </DialogHeader>
          <div className="min-w-0 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nome-rec">Nome</Label>
              <Input
                id="nome-rec"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Ponto extra na avaliação"
                className="w-full rounded-2xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desc-rec">Descrição</Label>
              <Textarea
                id="desc-rec"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Detalhes da recompensa"
                className="w-full rounded-2xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-rec">Categoria (opcional)</Label>
              <Input
                id="cat-rec"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                placeholder="Ex: Bônus, Passeio, Privilégio…"
                className="w-full rounded-2xl"
              />
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
                  className="w-full rounded-2xl"
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
                  className="w-full rounded-2xl"
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

/* ------------------------------------------------------------------ */
/*  Fila de aprovação de resgates                                       */
/* ------------------------------------------------------------------ */

function FilaAprovacoes({ turmaId }: { turmaId: string }) {
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

  function nomeRecompensa(id: string) {
    return db.recompensas.find((r) => r.id === id)?.nome ?? "Recompensa removida"
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
        <h3 className="mb-2 flex items-center gap-1.5 font-display text-lg font-extrabold">
          Fila de aprovação
          {pendentes.length > 0 && <Badge>{pendentes.length}</Badge>}
        </h3>
        {pendentes.length === 0 ? (
          <p className="rounded-2xl bg-muted p-6 text-center text-sm font-semibold text-muted-foreground">
            Nenhum resgate pendente. Quando um aluno solicitar, aparece aqui.
          </p>
        ) : (
          <div className="space-y-2">
            {pendentes.map((r) => (
              <Card key={r.id} className="flex flex-wrap items-center gap-3 p-3">
                <IconeRecompensa className="size-11" />
                <div className="min-w-0 flex-1">
                  <p className="font-display font-extrabold">{nomeRecompensa(r.recompensa_id)}</p>
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
            ))}
          </div>
        )}
      </div>

      {resolvidos.length > 0 && (
        <div>
          <h3 className="mb-2 font-display text-lg font-extrabold">Histórico</h3>
          <div className="space-y-2">
            {resolvidos.map((r) => (
              <Card key={r.id} className="flex items-center gap-3 p-3">
                <IconeRecompensa className="size-10" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display font-bold">{nomeRecompensa(r.recompensa_id)}</p>
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
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Componente principal                                               */
/* ------------------------------------------------------------------ */

export function RecompensasTab({ turmaId }: { turmaId: string }) {
  const { db } = useStore()
  const [visao, setVisao] = useState<Visao>("catalogo")

  const recompensas = db.recompensas
    .filter((r) => r.turma_id === turmaId)
    .sort((a, b) => (a.criada_em < b.criada_em ? 1 : -1))

  const pendentes = db.resgates.filter((r) => r.turma_id === turmaId && r.status === "pendente").length

  return (
    <div className="space-y-4">
      <SeletorVisao visao={visao} onMudar={setVisao} pendentes={pendentes} />

      {visao === "catalogo" ? (
        <CatalogoRecompensas turmaId={turmaId} recompensas={recompensas} />
      ) : (
        <FilaAprovacoes turmaId={turmaId} />
      )}
    </div>
  )
}
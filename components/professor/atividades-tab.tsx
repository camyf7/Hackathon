"use client"

import { useEffect, useRef, useState } from "react"
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
import { formatarDataCurta } from "@/lib/game"
import {
  CalendarClock,
  ClipboardList,
  Eye,
  FileText,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import type { Atividade, Dificuldade } from "@/lib/types"

const ANEXOS_STORAGE_KEY = "trilha-plus-anexos-v1"

const DIFICULDADES: { value: Dificuldade; label: string }[] = [
  { value: "facil", label: "Fácil" },
  { value: "media", label: "Média" },
  { value: "dificil", label: "Difícil" },
]

type AnexoArquivo = { nome: string; tipo: string; dataUrl: string }
type AnexosBucket = Record<string, AnexoArquivo[]>

function carregarAnexos(): AnexosBucket {
  try {
    const raw = localStorage.getItem(ANEXOS_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AnexosBucket) : {}
  } catch {
    return {}
  }
}

function salvarAnexosBucket(bucket: AnexosBucket) {
  try {
    localStorage.setItem(ANEXOS_STORAGE_KEY, JSON.stringify(bucket))
  } catch {
    toast.error("Não foi possível salvar os anexos (armazenamento cheio).")
  }
}

function lerArquivoComoDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function formatarTamanho(dataUrl: string) {
  const bytes = Math.round((dataUrl.length * 3) / 4)
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function AtividadesTab({ turmaId }: { turmaId: string }) {
  const { db, criarAtividade, atualizarAtividade, encerrarAtividade, removerAtividade } = useStore()

  const alunosTurma = db.alunos.filter((a) => a.turma_id === turmaId)
  const atividades = db.atividades
    .filter((a) => a.turma_id === turmaId)
    .sort((a, b) => (a.criada_em < b.criada_em ? 1 : -1))

  const [anexosBucket, setAnexosBucket] = useState<AnexosBucket>({})
  useEffect(() => {
    setAnexosBucket(carregarAnexos())
  }, [])

  const [open, setOpen] = useState(false)
  const [editando, setEditando] = useState<Atividade | null>(null)
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [prazo, setPrazo] = useState("")
  const [xp, setXp] = useState("50")
  const [dificuldade, setDificuldade] = useState<Dificuldade>("media")
  const [arquivos, setArquivos] = useState<AnexoArquivo[]>([])
  const [enviando, setEnviando] = useState(false)
  const [preview, setPreview] = useState<AnexoArquivo | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function abrirNova() {
    setEditando(null)
    setTitulo("")
    setDescricao("")
    setPrazo("")
    setXp("50")
    setDificuldade("media")
    setArquivos([])
    setOpen(true)
  }

  function abrirEdicao(a: Atividade) {
    setEditando(a)
    setTitulo(a.titulo)
    setDescricao(a.descricao)
    setPrazo(a.prazo ?? "")
    setXp(String(a.xp))
    setDificuldade(a.dificuldade)
    setArquivos(anexosBucket[a.id] ?? [])
    setOpen(true)
  }

  async function selecionarArquivos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ""
    if (files.length === 0) return

    const invalidos = files.filter((f) => f.type !== "application/pdf")
    if (invalidos.length > 0) {
      toast.error("Só é possível anexar arquivos em PDF")
    }

    const validos = files.filter((f) => f.type === "application/pdf")
    if (validos.length === 0) return

    setEnviando(true)
    try {
      const novos = await Promise.all(
        validos.map(async (f) => ({
          nome: f.name,
          tipo: "pdf",
          dataUrl: await lerArquivoComoDataUrl(f),
        })),
      )
      setArquivos((prev) => [...prev, ...novos])
    } catch {
      toast.error("Não foi possível ler um dos arquivos")
    } finally {
      setEnviando(false)
    }
  }

  function removerArquivo(nome: string) {
    setArquivos((prev) => prev.filter((a) => a.nome !== nome))
  }

  function persistirAnexos(atividadeId: string) {
    setAnexosBucket((prev) => {
      const next = { ...prev }
      if (arquivos.length > 0) next[atividadeId] = arquivos
      else delete next[atividadeId]
      salvarAnexosBucket(next)
      return next
    })
  }

  function salvar() {
    if (!titulo.trim()) {
      toast.error("Dê um título para a atividade")
      return
    }

    const dados = {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      prazo: prazo || null,
      xp: Number(xp) || 0,
      dificuldade,
      anexos: arquivos.map((a) => ({ nome: a.nome, tipo: a.tipo })),
    }

    if (editando) {
      atualizarAtividade(editando.id, dados)
      persistirAnexos(editando.id)
      toast.success("Atividade atualizada!")
    } else {
      criarAtividade(turmaId, dados)
      // a store gera o id no momento da criação; associamos os anexos à atividade recém-criada
      setTimeout(() => {
        const criada = [...db.atividades]
          .filter((a) => a.turma_id === turmaId)
          .sort((x, y) => (x.id < y.id ? 1 : -1))[0]
        if (criada) persistirAnexos(criada.id)
      }, 0)
      toast.success("Atividade lançada!")
    }
    setOpen(false)
  }

  function excluirAtividade(id: string) {
    removerAtividade(id)
    setAnexosBucket((prev) => {
      const next = { ...prev }
      delete next[id]
      salvarAnexosBucket(next)
      return next
    })
    toast.success("Atividade removida")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {atividades.length} atividade(s) lançada(s) para esta turma.
        </p>
        <Button onClick={abrirNova} className="rounded-2xl font-bold">
          <Plus className="size-4" /> Lançar atividade
        </Button>
      </div>

      <div className="space-y-3">
        {atividades.map((at) => {
          const total = alunosTurma.length
          const concluidos = at.alunos_concluidos.length
          const pct = total > 0 ? Math.round((concluidos / total) * 100) : 0
          const encerrada = at.status === "encerrada"
          const anexosAtividade = anexosBucket[at.id] ?? []

          return (
            <Card key={at.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display font-bold text-foreground">{at.titulo}</p>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        encerrada ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary",
                      )}
                    >
                      {encerrada ? "Encerrada" : "Aberta"}
                    </span>
                  </div>

                  {at.descricao && (
                    <p className="mt-1 text-sm text-muted-foreground">{at.descricao}</p>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>+{at.xp} XP</span>
                    <span className="capitalize">{at.dificuldade}</span>
                    {at.prazo && (
                      <span className="flex items-center gap-1">
                        <CalendarClock className="size-3.5" /> {formatarDataCurta(at.prazo)}
                      </span>
                    )}
                  </div>

                  {anexosAtividade.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {anexosAtividade.map((ax) => (
                        <div
                          key={ax.nome}
                          className="flex items-center gap-1 rounded-full border border-border bg-muted/50 pl-2 pr-1 py-1 text-xs font-medium text-foreground"
                        >
                          <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                          <span className="max-w-[120px] truncate">{ax.nome}</span>
                          <button
                            onClick={() => setPreview(ax)}
                            aria-label={`Visualizar ${ax.nome}`}
                            className="grid size-5 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                            title="Visualizar PDF"
                          >
                            <Eye className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => abrirEdicao(at)}
                    aria-label="Editar atividade"
                    className="grid size-8 place-items-center rounded-full text-muted-foreground transition hover:bg-muted"
                  >
                    <Pencil className="size-4" />
                  </button>
                  {!encerrada && (
                    <button
                      onClick={() => {
                        encerrarAtividade(at.id)
                        toast.success("Atividade encerrada")
                      }}
                      aria-label="Encerrar atividade"
                      className="grid size-8 place-items-center rounded-full text-muted-foreground transition hover:bg-muted"
                    >
                      <XCircle className="size-4" />
                    </button>
                  )}
                  <button
                    onClick={() => excluirAtividade(at.id)}
                    aria-label="Remover atividade"
                    className="grid size-8 place-items-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {concluidos}/{total}
                </span>
              </div>
            </Card>
          )
        })}

        {atividades.length === 0 && (
          <Card className="grid place-items-center gap-2 p-10 text-center">
            <ClipboardList className="size-8 text-muted-foreground" />
            <p className="font-medium text-muted-foreground">
              Nenhuma atividade lançada ainda para esta turma.
            </p>
          </Card>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editando ? "Editar atividade" : "Lançar nova atividade"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="titulo-atv">Título</Label>
              <Input
                id="titulo-atv"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Revisão de frações"
                className="rounded-2xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desc-atv">Descrição</Label>
              <Textarea
                id="desc-atv"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Instruções para os alunos"
                className="rounded-2xl"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="prazo-atv">Prazo (opcional)</Label>
                <Input
                  id="prazo-atv"
                  type="date"
                  value={prazo}
                  onChange={(e) => setPrazo(e.target.value)}
                  className="rounded-2xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="xp-atv">XP bônus</Label>
                <Input
                  id="xp-atv"
                  type="number"
                  min={0}
                  step={5}
                  value={xp}
                  onChange={(e) => setXp(e.target.value)}
                  className="rounded-2xl"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Dificuldade</Label>
              <Select value={dificuldade} onValueChange={(v) => setDificuldade(v as Dificuldade)}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFICULDADES.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Anexos em PDF</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                multiple
                onChange={selecionarArquivos}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={enviando}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/40 py-3 text-sm font-medium text-muted-foreground transition hover:border-primary/50 hover:text-foreground disabled:opacity-60"
              >
                <Upload className="size-4" />
                {enviando ? "Lendo arquivo..." : "Selecionar PDF"}
              </button>

              {arquivos.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {arquivos.map((ax) => (
                    <div
                      key={ax.nome}
                      className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2"
                    >
                      <FileText className="size-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate text-sm">{ax.nome}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatarTamanho(ax.dataUrl)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removerArquivo(ax.nome)}
                        aria-label={`Remover ${ax.nome}`}
                        className="grid size-6 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={salvar} className="w-full rounded-2xl py-6 font-bold">
              <Plus className="size-4" /> {editando ? "Salvar alterações" : "Lançar atividade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
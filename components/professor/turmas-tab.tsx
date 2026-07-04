"use client"

import { useMemo, useState } from "react"
import { useStore } from "@/lib/store"
import { escolas, type Escola } from "@/lib/data/escolas"
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
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  Building2,
  Check,
  ChevronDown,
  MapPin,
  Pencil,
  Plus,
  School,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import type { Turma } from "@/lib/types"

export function TurmasTab() {
  const {
    db,
    professorId,
    setTurmaId,
    criarTurma,
    atualizarTurma,
    removerTurma,
    moverAlunoParaTurma,
  } = useStore()

  const turmas = db.turmas
    .filter((t) => t.professor_id === professorId)
    .sort((a, b) => a.nome.localeCompare(b.nome))

  const [open, setOpen] = useState(false)
  const [editando, setEditando] = useState<Turma | null>(null)
  const [nome, setNome] = useState("")
  const [serie, setSerie] = useState("")
  const [escolaId, setEscolaId] = useState(escolas[0]?.id ?? "")

  // adicionar aluno existente
  const [addOpen, setAddOpen] = useState(false)
  const [turmaAlvo, setTurmaAlvo] = useState<Turma | null>(null)
  const [alunoSel, setAlunoSel] = useState("")

  // excluir turma
  const [excluirOpen, setExcluirOpen] = useState(false)
  const [turmaExcluir, setTurmaExcluir] = useState<Turma | null>(null)

  function nomeEscola(id: string) {
    return escolas.find((e) => e.id === id)?.nome ?? "Escola não encontrada"
  }

  function abrirNova() {
    setEditando(null)
    setNome("")
    setSerie("")
    setEscolaId(escolas[0]?.id ?? "")
    setOpen(true)
  }

  function abrirEdicao(t: Turma) {
    setEditando(t)
    setNome(t.nome)
    setSerie(t.serie)
    setEscolaId(t.escola_id)
    setOpen(true)
  }

  function salvar() {
    if (!nome.trim()) {
      toast.error("Informe o nome da turma")
      return
    }
    if (editando) {
      atualizarTurma(editando.id, nome.trim(), serie.trim() || nome.trim(), escolaId)
      toast.success("Turma atualizada")
    } else {
      criarTurma(nome.trim(), serie.trim() || nome.trim(), escolaId)
      toast.success("Turma criada")
    }
    setOpen(false)
  }

  function abrirAddAluno(t: Turma) {
    setTurmaAlvo(t)
    setAlunoSel("")
    setAddOpen(true)
  }

  function abrirExcluir(t: Turma) {
    setTurmaExcluir(t)
    setExcluirOpen(true)
  }

  function confirmarExcluir() {
    if (!turmaExcluir) return
    removerTurma(turmaExcluir.id)
    toast.success("Turma excluída")
    setExcluirOpen(false)
    setTurmaExcluir(null)
  }

  // alunos que não estão nesta turma (para adicionar existentes)
  const alunosDisponiveis = turmaAlvo
    ? db.alunos
        .filter((a) => a.turma_id !== turmaAlvo.id)
        .sort((a, b) => a.nome.localeCompare(b.nome))
    : []

  function confirmarAddAluno() {
    if (!turmaAlvo || !alunoSel) {
      toast.error("Selecione um aluno")
      return
    }
    moverAlunoParaTurma(alunoSel, turmaAlvo.id)
    toast.success("Aluno adicionado à turma")
    setAddOpen(false)
  }

  const alunosNaTurmaExcluir = turmaExcluir
    ? db.alunos.filter((a) => a.turma_id === turmaExcluir.id).length
    : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Minhas turmas</h2>
          <p className="text-sm text-muted-foreground">{turmas.length} turma(s) cadastrada(s)</p>
        </div>
        <Button onClick={abrirNova} className="rounded-2xl font-bold">
          <Plus className="size-4" /> Nova turma
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {turmas.map((t) => {
          const qtdAlunos = db.alunos.filter((a) => a.turma_id === t.id).length
          return (
            <Card key={t.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <button onClick={() => setTurmaId(t.id)} className="min-w-0 flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                      <School className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-display font-bold text-foreground">{t.nome}</p>
                      <p className="truncate text-xs text-muted-foreground">{nomeEscola(t.escola_id)}</p>
                    </div>
                  </div>
                </button>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => abrirEdicao(t)}
                    aria-label={`Editar ${t.nome}`}
                    className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    onClick={() => abrirExcluir(t)}
                    aria-label={`Excluir ${t.nome}`}
                    className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                  <Users className="size-4" /> {qtdAlunos} aluno(s)
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => abrirAddAluno(t)}
                  className="rounded-xl font-semibold"
                >
                  <UserPlus className="size-4" /> Adicionar aluno
                </Button>
              </div>
            </Card>
          )
        })}
        {turmas.length === 0 && (
          <Card className="col-span-full grid place-items-center gap-2 p-10 text-center">
            <School className="size-8 text-muted-foreground" />
            <p className="font-semibold text-muted-foreground">
              Nenhuma turma ainda. Crie a primeira para começar.
            </p>
          </Card>
        )}
      </div>

      {/* Dialog criar/editar turma */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editando ? "Editar turma" : "Nova turma"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nome-turma">Nome da turma</Label>
              <Input
                id="nome-turma"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: 6º A"
                className="rounded-2xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="serie-turma">Série</Label>
              <Input
                id="serie-turma"
                value={serie}
                onChange={(e) => setSerie(e.target.value)}
                placeholder="Ex: 6º ano"
                className="rounded-2xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Escola</Label>
              <EscolaCombobox
                escolas={escolas}
                selecionadaId={escolaId}
                onSelecionar={(e) => setEscolaId(e.id)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={salvar} className="w-full rounded-2xl py-6 font-bold">
              {editando ? "Salvar alterações" : "Criar turma"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog adicionar aluno existente */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Adicionar aluno a {turmaAlvo?.nome}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Selecione um aluno já cadastrado em outra turma para movê-lo para esta.
            </p>
            <Select value={alunoSel} onValueChange={(v) => v && setAlunoSel(v)}>
              <SelectTrigger className="rounded-2xl">
                <SelectValue placeholder="Escolher aluno" />
              </SelectTrigger>
              <SelectContent>
                {alunosDisponiveis.map((a) => {
                  const turmaAtual = db.turmas.find((t) => t.id === a.turma_id)
                  return (
                    <SelectItem key={a.id} value={a.id}>
                      {a.nome} — {turmaAtual?.nome ?? "sem turma"}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {alunosDisponiveis.length === 0 && (
              <p className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">
                Não há outros alunos disponíveis para adicionar.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={confirmarAddAluno}
              disabled={alunosDisponiveis.length === 0}
              className="w-full rounded-2xl py-6 font-bold"
            >
              <UserPlus className="size-4" /> Adicionar à turma
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog confirmar exclusão de turma */}
      <Dialog open={excluirOpen} onOpenChange={setExcluirOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-destructive/10">
              <AlertTriangle className="size-7 text-destructive" />
            </div>
            <DialogTitle className="text-center font-display text-xl">
              Excluir "{turmaExcluir?.nome}"?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-center">
            <p className="text-sm text-muted-foreground">
              Esta ação não pode ser desfeita. Isso vai remover permanentemente:
            </p>
            <ul className="mx-auto inline-block space-y-1 text-left text-sm font-semibold text-foreground">
              <li className="flex items-center gap-2">
                <span className="size-1.5 shrink-0 rounded-full bg-destructive" />
                {alunosNaTurmaExcluir} aluno(s) matriculado(s)
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 shrink-0 rounded-full bg-destructive" />
                Squads, atividades e recompensas da turma
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 shrink-0 rounded-full bg-destructive" />
                Histórico de resgates e progresso
              </li>
            </ul>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setExcluirOpen(false)}
              className="w-full rounded-2xl font-bold sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmarExcluir}
              className="w-full rounded-2xl bg-destructive font-bold text-destructive-foreground hover:bg-destructive/90 sm:w-auto"
            >
              <Trash2 className="size-4" /> Excluir turma
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* --------------------------------------------------------------------- */
/*  Combobox de escola — mesmo padrão visual do SchoolTurmaSelector       */
/* --------------------------------------------------------------------- */

function EscolaCombobox({
  escolas: lista,
  selecionadaId,
  onSelecionar,
}: {
  escolas: Escola[]
  selecionadaId: string
  onSelecionar: (escola: Escola) => void
}) {
  const [open, setOpen] = useState(false)
  const selecionada = useMemo(
    () => lista.find((e) => e.id === selecionadaId),
    [lista, selecionadaId],
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "group flex h-11 w-full items-center gap-2.5 rounded-2xl border border-border/70 bg-card px-3",
            "shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-200 ease-out",
            "hover:border-border hover:shadow-[0_2px_6px_rgba(16,24,40,0.06)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-1",
          )}
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-[10px] bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
            <Building2 className="size-4" strokeWidth={2} />
          </span>
          <span className="min-w-0 flex-1 truncate text-left text-sm font-semibold text-foreground">
            {selecionada ? selecionada.nome : "Selecionar escola"}
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-[--radix-popover-trigger-width] min-w-[320px] overflow-hidden rounded-[16px] border-border/70 p-0 shadow-lg"
      >
        <Command
          filter={(value, search) =>
            value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }
        >
          <div className="border-b border-border/70 px-1">
            <CommandInput placeholder="Buscar escola..." className="h-11 text-sm" />
          </div>

          <CommandList className="max-h-[320px]">
            <CommandEmpty className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma escola encontrada.
            </CommandEmpty>

            <CommandGroup
              heading="Rede Municipal · SEDUC Caraguatatuba"
              className="px-1.5 py-1.5 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground"
            >
              {lista.map((escola) => {
                const ativa = escola.id === selecionadaId
                return (
                  <CommandItem
                    key={escola.id}
                    value={`${escola.nome} ${escola.bairro}`}
                    onSelect={() => {
                      onSelecionar(escola)
                      setOpen(false)
                    }}
                    className={cn(
                      "flex items-center gap-2.5 rounded-[10px] px-2.5 py-2.5 text-sm transition-colors",
                      "data-[selected=true]:bg-accent",
                    )}
                  >
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-medium text-foreground">{escola.nome}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3" />
                        {escola.bairro}
                      </span>
                    </span>
                    <Check
                      className={cn(
                        "size-4 shrink-0 text-primary transition-opacity",
                        ativa ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
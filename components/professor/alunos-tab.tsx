"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
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
} from "@/components/ui/dialog"
import { RewardIcon } from "@/components/rewards/reward-icon"
import { cn } from "@/lib/utils"
import { IdCard, Pencil, Plus, Trash2, Trophy, UserPlus, Users } from "lucide-react"
import { toast } from "sonner"
import type { Aluno } from "@/lib/types"

const RA_STORAGE_KEY = "trilha-plus-ra-v1"

const ease = [0.16, 1, 0.3, 1] as const

// paleta de cores para o avatar de iniciais — usada só quando o aluno
// ainda não tem foto nem ícone de recompensa escolhido.
const CORES_AVATAR = [
  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  "bg-teal-500/10 text-teal-600 dark:text-teal-400",
]

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/)
  const primeiro = partes[0]?.[0] ?? ""
  const ultimo = partes.length > 1 ? partes[partes.length - 1][0] : ""
  return (primeiro + ultimo).toUpperCase()
}

function corPara(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return CORES_AVATAR[hash % CORES_AVATAR.length]
}

// Um "avatar" pode ser um emoji, um caminho de imagem (ex: "/avatar1.png")
// ou nem existir ainda — mesma checagem usada na tela inicial (HomePage).
function isImagePath(avatar: string): boolean {
  return avatar.startsWith("/") || avatar.startsWith("http")
}

// Resolve o visual do aluno com a mesma prioridade da HomePage:
// ícone de recompensa escolhido > foto de avatar > iniciais geradas do nome.
// Lê sempre do objeto Aluno mais atual (db.alunos), então qualquer troca de
// perfil aparece aqui automaticamente, sem precisar duplicar dado.
function AvatarAluno({ aluno, className }: { aluno: Aluno; className?: string }) {
  if (aluno.icone_selecionado && aluno.icone_selecionado !== "default") {
    return (
      <span className={cn("grid shrink-0 place-items-center overflow-hidden rounded-2xl bg-muted", className)}>
        <RewardIcon icone={aluno.icone_selecionado} className="size-full" />
      </span>
    )
  }
  if (isImagePath(aluno.avatar)) {
    return (
      <span className={cn("grid shrink-0 place-items-center overflow-hidden rounded-2xl bg-muted", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={aluno.avatar} alt="" className="size-full object-cover" />
      </span>
    )
  }
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-2xl text-base font-bold",
        corPara(aluno.id),
        className,
      )}
    >
      {iniciais(aluno.nome)}
    </span>
  )
}

function carregarRas(): Record<string, string> {
  try {
    const raw = localStorage.getItem(RA_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, string>) : {}
  } catch {
    return {}
  }
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.2, ease } },
}

export function AlunosTab({ turmaId }: { turmaId: string }) {
  const { db, adicionarAluno, atualizarAluno, removerAluno } = useStore()
  const alunos = db.alunos
    .filter((a) => a.turma_id === turmaId)
    .sort((a, b) => a.nome.localeCompare(b.nome))

  const [ras, setRas] = useState<Record<string, string>>({})

  useEffect(() => {
    setRas(carregarRas())
  }, [])

  function salvarRa(alunoId: string, ra: string) {
    setRas((prev) => {
      const next = { ...prev, [alunoId]: ra }
      try {
        localStorage.setItem(RA_STORAGE_KEY, JSON.stringify(next))
      } catch {
        // ignora falha de storage
      }
      return next
    })
  }

  const [open, setOpen] = useState(false)
  const [editando, setEditando] = useState<Aluno | null>(null)
  const [nome, setNome] = useState("")
  const [ra, setRa] = useState("")

  function abrirNovo() {
    setEditando(null)
    setNome("")
    setRa("")
    setOpen(true)
  }

  function abrirEdicao(a: Aluno) {
    setEditando(a)
    setNome(a.nome)
    setRa(ras[a.id] ?? "")
    setOpen(true)
  }

  function salvar() {
    if (!nome.trim()) {
      toast.error("Digite o nome do aluno")
      return
    }
    if (editando) {
      atualizarAluno(editando.id, nome.trim(), editando.avatar)
      salvarRa(editando.id, ra.trim())
      toast.success("Aluno atualizado!")
    } else {
      adicionarAluno(nome.trim(), turmaId, iniciais(nome.trim()))
      // a store gera o id no momento da criação; buscamos o último aluno da turma para associar o RA
      setTimeout(() => {
        const criado = [...db.alunos]
          .filter((a) => a.turma_id === turmaId)
          .sort((x, y) => (x.id < y.id ? 1 : -1))[0]
        if (criado) salvarRa(criado.id, ra.trim())
      }, 0)
      toast.success("Aluno cadastrado com XP e streak zerados!")
    }
    setOpen(false)
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={itemVariants} className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">
          {alunos.length} aluno(s) · cadastro exclusivo da professora
        </p>
        <Button onClick={abrirNovo} className="shrink-0 rounded-2xl font-bold">
          <UserPlus className="size-4" /> Cadastrar aluno
        </Button>
      </motion.div>

      <motion.div variants={containerVariants} className="grid gap-2.5 sm:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {alunos.map((a) => {
            const squad = db.squads.find((s) => s.id === a.squad_id)
            return (
              <motion.div key={a.id} variants={itemVariants} exit="exit" layout>
                <Card className="p-3 transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <AvatarAluno aluno={a} className="size-12" />
                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate font-display font-bold text-foreground">{a.nome}</p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs font-semibold text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Trophy className="size-3.5" /> Nv {a.nivel} · {a.xp_total} XP
                        </span>
                        {squad && (
                          <span className="flex items-center gap-1">
                            <Users className="size-3.5" /> {squad.nome}
                          </span>
                        )}
                        {ras[a.id] && (
                          <span className="flex items-center gap-1">
                            <IdCard className="size-3.5" /> RA {ras[a.id]}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={() => abrirEdicao(a)}
                        aria-label={`Editar ${a.nome}`}
                        className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground transition hover:bg-sky-500/10 hover:text-sky-600"
                      >
                        <Pencil className="size-4" />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={() => {
                          removerAluno(a.id)
                          toast.success("Aluno removido")
                        }}
                        aria-label={`Remover ${a.nome}`}
                        className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </motion.button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {alunos.length === 0 && (
          <motion.div variants={itemVariants} className="col-span-full">
            <Card className="grid place-items-center gap-2 p-8 text-center">
              <UserPlus className="size-8 text-muted-foreground" />
              <p className="font-medium text-muted-foreground">Nenhum aluno ainda. Cadastre o primeiro.</p>
            </Card>
          </motion.div>
        )}
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden rounded-3xl">
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
              <Label htmlFor="ra-aluno">RA (matrícula)</Label>
              <Input
                id="ra-aluno"
                value={ra}
                onChange={(e) => setRa(e.target.value)}
                placeholder="Ex: 2026001"
                className="rounded-2xl"
              />
              <p className="text-xs text-muted-foreground">
                Campo de teste por enquanto — será usado depois no login do aluno.
              </p>
            </div>
            <AnimatePresence>
              {nome.trim() && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3 rounded-2xl bg-muted/60 p-3">
                    {editando ? (
                      <AvatarAluno aluno={editando} className="size-11 text-sm" />
                    ) : (
                      <span
                        className={cn(
                          "grid size-11 shrink-0 place-items-center rounded-2xl text-sm font-bold",
                          CORES_AVATAR[0],
                        )}
                      >
                        {iniciais(nome)}
                      </span>
                    )}
                    <p className="text-xs font-medium text-muted-foreground">
                      {editando
                        ? "Se o aluno já escolheu foto ou ícone, o avatar dele é mantido."
                        : "Avatar gerado automaticamente a partir do nome."}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <DialogFooter>
            <Button onClick={salvar} className="w-full rounded-2xl py-6 font-bold">
              <Plus className="size-4" /> {editando ? "Salvar alterações" : "Cadastrar aluno"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
"use client"

import { useMemo } from "react"
import { useStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { META_TELA_DIARIA } from "@/lib/game"
import { RewardIcon } from "@/components/rewards/reward-icon"
import { AlertTriangle, Clock, PartyPopper, PauseCircle, TrendingDown, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Aluno } from "@/lib/types"

const JANELA_DIAS = 7
const LIMITE_FALTAS = 3
const LIMITE_XP = 150
const FATOR_TELA_EXCESSIVA = 1.5

// paleta de cores para o avatar de iniciais — mesma usada no AlunosTab,
// pra manter a identidade visual consistente entre as abas.
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
// ou nem existir ainda — mesma checagem usada no AlunosTab e na HomePage.
function isImagePath(avatar: string): boolean {
  return avatar.startsWith("/") || avatar.startsWith("http")
}

type TipoAlerta = "frequencia" | "trilha" | "tela"

type Alerta = {
  aluno: Aluno
  tipo: TipoAlerta
  detalhe: string
}

const CONFIG_ALERTA: Record<TipoAlerta, { icon: LucideIcon; cor: string; label: string }> = {
  frequencia: { icon: TrendingDown, cor: "bg-brand-orange/15 text-brand-orange", label: "Queda de frequência" },
  trilha: { icon: PauseCircle, cor: "bg-brand-purple/15 text-brand-purple", label: "Trilha parada" },
  tela: { icon: Clock, cor: "bg-brand-pink/15 text-brand-pink", label: "Tempo de tela alto" },
}

/** Últimas `dias` datas (YYYY-MM-DD) a partir de `referencia`, incluindo ela. */
function ultimasDatas(referencia: string, dias: number): string[] {
  return Array.from({ length: dias }, (_, i) => {
    const d = new Date(`${referencia}T12:00:00`)
    d.setDate(d.getDate() - i)
    return d.toISOString().slice(0, 10)
  })
}

function detectarAlertasDoAluno(aluno: Aluno, presencasRecentes: { data: string; presente: boolean }[]): Alerta[] {
  const alertas: Alerta[] = []

  const faltas = presencasRecentes.filter((p) => !p.presente).length
  if (faltas >= LIMITE_FALTAS || aluno.streak_dias === 0) {
    alertas.push({
      aluno,
      tipo: "frequencia",
      detalhe: aluno.streak_dias === 0 ? "Streak apagado, sem presença recente" : `${faltas} faltas nos últimos ${JANELA_DIAS} dias`,
    })
  }

  if (aluno.xp_total < LIMITE_XP) {
    alertas.push({ aluno, tipo: "trilha", detalhe: "Trilha parada / baixo progresso" })
  }

  const mediaDiaria = Math.round(aluno.tempo_tela_minutos_semana / 7)
  if (mediaDiaria > META_TELA_DIARIA * FATOR_TELA_EXCESSIVA) {
    alertas.push({ aluno, tipo: "tela", detalhe: `Tempo de tela alto: ${mediaDiaria} min/dia` })
  }

  return alertas
}

function AvisoPrivacidade() {
  return (
    <Card className="flex items-center gap-3 border-2 border-dashed border-brand-orange/40 bg-brand-orange/5 p-4">
      <AlertTriangle className="size-6 shrink-0 text-brand-orange" aria-hidden="true" />
      <p className="text-sm font-semibold">
        Alertas visíveis só para você. Servem para uma conversa de cuidado — nunca são expostos aos alunos.
      </p>
    </Card>
  )
}

function EstadoVazio() {
  return (
    <Card className="grid place-items-center gap-2 p-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
        <PartyPopper className="size-6" aria-hidden="true" />
      </span>
      <p className="font-display text-lg font-extrabold">Tudo tranquilo por aqui!</p>
      <p className="text-sm font-semibold text-muted-foreground">Nenhum aluno em situação de alerta.</p>
    </Card>
  )
}

// Resolve o visual do aluno com a mesma prioridade usada no AlunosTab e na
// HomePage: ícone de recompensa escolhido > foto de avatar > iniciais do nome.
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
    <span className={cn("grid shrink-0 place-items-center rounded-2xl text-base font-bold", corPara(aluno.id), className)}>
      {iniciais(aluno.nome)}
    </span>
  )
}

function AlertaCard({ alerta }: { alerta: Alerta }) {
  const { icon: Icon, cor, label } = CONFIG_ALERTA[alerta.tipo]
  return (
    <Card className="flex items-center gap-3 p-3">
      <AvatarAluno aluno={alerta.aluno} className="size-11" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-display font-extrabold">{alerta.aluno.nome}</p>
        <p className="text-xs font-semibold text-muted-foreground">{alerta.detalhe}</p>
      </div>
      <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold", cor)}>
        <Icon className="size-3.5" aria-hidden="true" />
        {label}
      </span>
    </Card>
  )
}

export function AlertasTab({ turmaId }: { turmaId: string }) {
  const { db } = useStore()

  const alertas = useMemo(() => {
    const alunosDaTurma = db.alunos.filter((a) => a.turma_id === turmaId)
    const janela = ultimasDatas(db.data_atual, JANELA_DIAS)

    return alunosDaTurma.flatMap((aluno) => {
      const presencasRecentes = db.presencas.filter((p) => p.aluno_id === aluno.id && janela.includes(p.data))
      return detectarAlertasDoAluno(aluno, presencasRecentes)
    })
  }, [db.alunos, db.presencas, db.data_atual, turmaId])

  return (
    <div className="space-y-4">
      <AvisoPrivacidade />

      {alertas.length === 0 ? (
        <EstadoVazio />
      ) : (
        <div className="space-y-2">
          {alertas.map((alerta, i) => (
            <AlertaCard key={`${alerta.aluno.id}-${alerta.tipo}-${i}`} alerta={alerta} />
          ))}
        </div>
      )}
    </div>
  )
}
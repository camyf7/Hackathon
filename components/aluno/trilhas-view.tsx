"use client"

import { useEffect, useMemo, useState } from "react"
import { useStore } from "@/lib/store"
import type { Aluno, Exercicio, Trilha } from "@/lib/types"
import { Confetti } from "@/components/confetti"
import { ExercicioDialog } from "./exercicio-dialog"
import { CheckinCard } from "./checkin-card"
import { cn } from "@/lib/utils"
import { JogoEscada } from "./jogo-escada"
import { META_TELA_DIARIA } from "@/lib/game"
import { JogoCompletar } from "./jogo-completar"
import { JogoMemoria } from "./jogo-memoria"
import { JogoVerdadeiroFalso } from "./jogo-verdadeiro-falso"
import {
  BookOpen,
  Calculator,
  Check,
  ChevronDown,
  ClipboardList,
  FlaskConical,
  Globe,
  Hourglass,
  Landmark,
  Lock,
  Palette,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"

const POR_LINHA = 3

// ---------------------------------------------------------------------------
// Utilitários de tempo
// ---------------------------------------------------------------------------

/** Milissegundos restantes até a próxima meia-noite (horário do dispositivo). */
function msAteProximaMeiaNoite(): number {
  const agora = new Date()
  const proxima = new Date(agora)
  proxima.setHours(24, 0, 0, 0)
  return proxima.getTime() - agora.getTime()
}

/** Formata ms restantes como "Xh Ymin" (ou "Ymin" se menos de 1h). */
function formatarContagem(ms: number): string {
  const totalMin = Math.max(0, Math.ceil(ms / 60000))
  const h = Math.floor(totalMin / 60)
  const min = totalMin % 60
  return h <= 0 ? `${min}min` : `${h}h ${min}min`
}

// ---------------------------------------------------------------------------
// Paleta por matéria
// ---------------------------------------------------------------------------

type CorTrilha = {
  bg: string
  bgSuave: string
  texto: string
  borda: string
  anel: string
}

const CORES: Record<string, CorTrilha> = {
  green: {
    bg: "bg-brand-green",
    bgSuave: "bg-brand-green/10",
    texto: "text-brand-green",
    borda: "border-brand-green",
    anel: "shadow-[0_0_0_6px_hsl(var(--brand-green)/0.18)]",
  },
  purple: {
    bg: "bg-brand-purple",
    bgSuave: "bg-brand-purple/10",
    texto: "text-brand-purple",
    borda: "border-brand-purple",
    anel: "shadow-[0_0_0_6px_hsl(var(--brand-purple)/0.18)]",
  },
  turquoise: {
    bg: "bg-brand-turquoise",
    bgSuave: "bg-brand-turquoise/10",
    texto: "text-brand-turquoise",
    borda: "border-brand-turquoise",
    anel: "shadow-[0_0_0_6px_hsl(var(--brand-turquoise)/0.18)]",
  },
  orange: {
    bg: "bg-brand-orange",
    bgSuave: "bg-brand-orange/10",
    texto: "text-brand-orange",
    borda: "border-brand-orange",
    anel: "shadow-[0_0_0_6px_hsl(var(--brand-orange)/0.18)]",
  },
  pink: {
    bg: "bg-brand-pink",
    bgSuave: "bg-brand-pink/10",
    texto: "text-brand-pink",
    borda: "border-brand-pink",
    anel: "shadow-[0_0_0_6px_hsl(var(--brand-pink)/0.18)]",
  },
}
const ORDEM_CORES = Object.keys(CORES)

function corDaTrilha(trilha: Trilha, indice: number): CorTrilha {
  if (trilha.cor && CORES[trilha.cor]) return CORES[trilha.cor]
  return CORES[ORDEM_CORES[indice % ORDEM_CORES.length]]
}

function iconePorNome(nome: string): LucideIcon {
  const n = nome.toLowerCase()
  if (n.includes("matem")) return Calculator
  if (n.includes("portug") || n.includes("lingua")) return BookOpen
  if (n.includes("geo")) return Globe
  if (n.includes("cien") || n.includes("ciênc") || n.includes("bio") || n.includes("quim") || n.includes("fisic"))
    return FlaskConical
  if (n.includes("hist")) return Landmark
  if (n.includes("art")) return Palette
  return BookOpen
}

// ---------------------------------------------------------------------------
// Utilitários de exercícios
// ---------------------------------------------------------------------------

type TarefaInfo = { titulo: string; descricao: string | null }

function tarefaDoExercicio(ex: Exercicio | undefined): TarefaInfo | null {
  if (!ex) return null
  const e = ex as unknown as Record<string, unknown>
  const titulo = (e.titulo ?? e.nome ?? e.pergunta ?? `Nível ${ex.nivel}`) as string
  const descricao = (e.descricao ?? e.enunciado ?? e.instrucoes ?? null) as string | null
  return { titulo, descricao }
}

function linhasEmCobra<T>(itens: T[], porLinha: number): T[][] {
  const linhas: T[][] = []
  for (let i = 0; i < itens.length; i += porLinha) {
    linhas.push(itens.slice(i, i + porLinha))
  }
  return linhas
}


// ---------------------------------------------------------------------------
// Cabeçalho da matéria + seletor
// ---------------------------------------------------------------------------

function TrilhaHeader({
  trilha,
  indice,
  trilhas,
  seletorAberto,
  onToggleSeletor,
  onFecharSeletor,
  onSelecionar,
}: {
  trilha: Trilha
  indice: number
  trilhas: Trilha[]
  seletorAberto: boolean
  onToggleSeletor: () => void
  onFecharSeletor: () => void
  onSelecionar: (id: string) => void
}) {
  const cor = corDaTrilha(trilha, indice)
  const IconeMateria = iconePorNome(trilha.nome)

  return (
    <div className="relative flex items-center justify-between gap-3 rounded-3xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className={cn("grid size-11 shrink-0 place-items-center rounded-2xl text-white", cor.bg)}>
          <IconeMateria className="size-5" />
        </span>
        <div>
          <h2 className={cn("font-display text-lg font-extrabold leading-tight", cor.texto)}>
            {trilha.nome}
          </h2>
          <p className="text-xs font-semibold text-muted-foreground">
            Desenvolva seu raciocínio lógico e resolva problemas com confiança.
          </p>
        </div>
      </div>

      <button
        onClick={onToggleSeletor}
        aria-haspopup="listbox"
        aria-expanded={seletorAberto}
        className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-3 py-2 text-xs font-bold text-foreground transition hover:bg-muted"
      >
        Alterar matéria
        <ChevronDown className={cn("size-3.5 transition-transform", seletorAberto && "rotate-180")} />
      </button>

      {seletorAberto && (
        <>
          <div className="fixed inset-0 z-30" onClick={onFecharSeletor} />
          <ul
            role="listbox"
            className="absolute right-4 top-[calc(100%+8px)] z-40 w-56 overflow-hidden rounded-2xl border border-border bg-card shadow-lg"
          >
            {trilhas.map((t, i) => {
              const Icone = iconePorNome(t.nome)
              const corItem = corDaTrilha(t, i)
              const ativa = t.id === trilha.id
              return (
                <li key={t.id}>
                  <button
                    role="option"
                    aria-selected={ativa}
                    onClick={() => onSelecionar(t.id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-bold transition hover:bg-muted",
                      ativa && corItem.bgSuave,
                      ativa && corItem.texto,
                    )}
                  >
                    <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl text-white", corItem.bg)}>
                      <Icone className="size-4" />
                    </span>
                    {t.nome}
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Nó de nível individual no caminho em cobra
// ---------------------------------------------------------------------------

function NivelNode({
  nivel,
  tarefa,
  completo,
  atual,
  bloqueado,
  cor,
  onAbrir,
  nomeTrilha,
}: {
  nivel: number
  tarefa: TarefaInfo | null
  completo: boolean
  atual: boolean
  bloqueado: boolean
  cor: CorTrilha
  onAbrir: () => void
  nomeTrilha: string
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-3 text-center">
      <div className="relative">
        {atual && (
          <ChevronDown
            className={cn(
              "absolute -top-7 left-1/2 size-5 -translate-x-1/2 animate-bounce-soft drop-shadow-sm",
              cor.texto,
            )}
          />
        )}
        {atual && <span className={cn("absolute inset-0 -z-10 rounded-full blur-md opacity-60", cor.bg)} />}

        <button
          disabled={bloqueado}
          onClick={onAbrir}
          aria-label={`${nomeTrilha} nível ${nivel}${bloqueado ? " (bloqueado)" : ""}`}
          className={cn(
            "relative grid size-16 shrink-0 place-items-center rounded-full border-[3px] font-display text-base font-extrabold transition-all duration-200 active:scale-95",
            completo &&
              "border-emerald-500 bg-emerald-500/10 text-emerald-500 shadow-[0_0_0_5px_rgba(16,185,129,0.12)]",
            atual && cn("bg-background shadow-lg", cor.borda, cor.texto, cor.anel),
            bloqueado && "cursor-not-allowed border-border/70 bg-muted text-muted-foreground/70",
            !bloqueado && "hover:scale-105",
          )}
        >
          {completo ? (
            <Check className="size-7" strokeWidth={3} />
          ) : bloqueado ? (
            <Lock className="size-6" />
          ) : (
            String(nivel).padStart(2, "0")
          )}
        </button>
      </div>

      <div
        className={cn(
          "min-w-0 max-w-[9.5rem] rounded-xl border px-2.5 py-1.5 transition-colors",
          bloqueado ? "border-transparent bg-transparent" : "border-border/60 bg-card shadow-sm",
        )}
      >
        <p
          className={cn(
            "line-clamp-2 text-xs font-extrabold leading-snug",
            bloqueado ? "text-muted-foreground/70" : "text-foreground",
            atual && cor.texto,
          )}
        >
          {tarefa?.titulo ?? `Nível ${nivel}`}
        </p>
        {tarefa?.descricao && !bloqueado && (
          <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{tarefa.descricao}</p>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Caminho de níveis em formato de cobra (3 por fileira)
// ---------------------------------------------------------------------------

function CaminhoDeNiveis({
  trilha,
  nivelAtual,
  completos,
  limiteAtingido,
  cor,
  onAbrirExercicio,
}: {
  trilha: Trilha
  nivelAtual: number
  completos: string[]
  limiteAtingido: boolean
  cor: CorTrilha
  onAbrirExercicio: (ex: Exercicio) => void
}) {
  const linhas = useMemo(() => linhasEmCobra(trilha.exercicios, POR_LINHA), [trilha.exercicios])

  return (
    <div className="space-y-16 pt-6">
      {linhas.map((linha, linhaIdx) => {
        const invertida = linhaIdx % 2 === 1
        const temProximaLinha = linhaIdx < linhas.length - 1
        const ladoDaCurva = invertida ? "left" : "right"

        return (
          <div key={linhaIdx} className="relative">
            <div className={cn("flex items-start", invertida ? "flex-row-reverse" : "flex-row")}>
              {linha.map((ex, idx) => {
                const nivel = ex.nivel
                const completo = nivel < nivelAtual || completos.includes(ex.id)
                // Com o limite diário atingido, nenhum nível novo pode ser
                // aberto — só os já completados continuam visíveis como
                // concluídos, tudo o mais fica bloqueado.
                const bloqueadoPorNivel = nivel > nivelAtual
                const bloqueado = bloqueadoPorNivel || (limiteAtingido && !completo)
                const atual = !limiteAtingido && nivel === nivelAtual && !completo
                const naoUltimoDaLinha = idx < linha.length - 1
                const linhaAcesa = nivel < nivelAtual

                return (
                  <div key={ex.id} className="flex flex-1 items-start">
                    <NivelNode
                      nivel={nivel}
                      tarefa={tarefaDoExercicio(ex)}
                      completo={completo}
                      atual={atual}
                      bloqueado={bloqueado}
                      cor={cor}
                      onAbrir={() => onAbrirExercicio(ex)}
                      nomeTrilha={trilha.nome}
                    />

                    {naoUltimoDaLinha && (
                      <span
                        className={cn(
                          "mt-8 h-[3px] flex-1 shrink-0 self-start rounded-full",
                          linhaAcesa
                            ? "bg-emerald-500"
                            : "border-t-[3px] border-dashed border-border/70 bg-transparent",
                        )}
                      />
                    )}
                  </div>
                )
              })}
            </div>

            {temProximaLinha && (
              <div
                className={cn(
                  "absolute top-8 h-[4.75rem] w-8 border-border/70",
                  ladoDaCurva === "left"
                    ? "left-0 rounded-bl-[32px] border-b-[3px] border-l-[3px]"
                    : "right-0 rounded-br-[32px] border-b-[3px] border-r-[3px]",
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tarefa enviada pelo professor
// ---------------------------------------------------------------------------

function TarefaProfessor({ tarefa }: { tarefa: TarefaInfo }) {
  return (
    <div className="mx-auto mt-2 w-full max-w-sm rounded-2xl bg-muted/60 p-4 ring-1 ring-border">
      <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
        <ClipboardList className="size-3.5" aria-hidden="true" />
        Tarefa do professor
      </p>
      <p className="mt-1 line-clamp-1 font-display text-sm font-extrabold">{tarefa.titulo}</p>
      {tarefa.descricao && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{tarefa.descricao}</p>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Jogo interativo por matéria
// ---------------------------------------------------------------------------

function JogoDaTrilha({ nomeTrilha, alunoId, bloqueado }: { nomeTrilha: string; alunoId: string; bloqueado: boolean }) {
  const n = nomeTrilha.toLowerCase()
  if (n.includes("matem")) return <JogoEscada alunoId={alunoId} bloqueado={bloqueado} />
  if (n.includes("portug")) return <JogoCompletar alunoId={alunoId} bloqueado={bloqueado} />
  if (n.includes("cien") || n.includes("ciênc")) return <JogoMemoria alunoId={alunoId} bloqueado={bloqueado} />
  if (n.includes("hist")) return <JogoVerdadeiroFalso alunoId={alunoId} bloqueado={bloqueado} />
  return null
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function TrilhasView({ aluno }: { aluno: Aluno }) {
  const { db } = useStore()
  const [fire, setFire] = useState(0)
  const [trilhaAtiva, setTrilhaAtiva] = useState<Trilha | null>(null)
  const [exercicio, setExercicio] = useState<Exercicio | null>(null)
  const [open, setOpen] = useState(false)
  const [seletorAberto, setSeletorAberto] = useState(false)
  const [trilhaSelecionadaId, setTrilhaSelecionadaId] = useState<string | null>(null)

  // ---------- Limite diário de tempo de tela ----------
  const limiteAtingido = aluno.tempo_tela_minutos_hoje >= META_TELA_DIARIA

  const [restante, setRestante] = useState(() => msAteProximaMeiaNoite())
  useEffect(() => {
    const id = setInterval(() => setRestante(msAteProximaMeiaNoite()), 30_000)
    return () => clearInterval(id)
  }, [])

  // Notifica (toast) uma única vez por dia quando o limite é atingido
  useEffect(() => {
    if (!limiteAtingido || typeof window === "undefined") return
    const chave = `limite-diario-notificado-${aluno.id}-${db.data_atual}`
    if (localStorage.getItem(chave)) return
    localStorage.setItem(chave, "1")
    toast.success("Todas suas tarefas foram concluídas!", {
      description: `Próximas tarefas em ${formatarContagem(msAteProximaMeiaNoite())}.`,
      icon: <Hourglass className="size-4" />,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limiteAtingido, aluno.id, db.data_atual])

  const trilhaIndex = useMemo(() => {
    if (trilhaSelecionadaId) {
      const i = db.trilhas.findIndex((t) => t.id === trilhaSelecionadaId)
      if (i !== -1) return i
    }
    const iMatematica = db.trilhas.findIndex((t) => t.nome.toLowerCase().includes("matem"))
    return iMatematica !== -1 ? iMatematica : 0
  }, [db.trilhas, trilhaSelecionadaId])

  const trilha = db.trilhas[trilhaIndex]
  const cor = trilha ? corDaTrilha(trilha, trilhaIndex) : CORES.green

  const prog = useMemo(() => {
    const p = db.progresso.find((p) => p.aluno_id === aluno.id && p.trilha_id === trilha?.id)
    return {
      nivel_atual: p?.nivel_atual ?? 1,
      completos: p?.exercicios_completos ?? [],
    }
  }, [db.progresso, aluno.id, trilha?.id])

  const exercicioAtual = trilha?.exercicios.find((ex) => ex.nivel === prog.nivel_atual)
  const tarefa = tarefaDoExercicio(exercicioAtual)

  function abrirExercicio(t: Trilha, ex: Exercicio) {
    if (limiteAtingido) {
      toast("Todas suas tarefas foram concluídas!", {
        description: `Próximas tarefas em ${formatarContagem(msAteProximaMeiaNoite())}.`,
        icon: <Hourglass className="size-4" />,
      })
      return
    }
    setTrilhaAtiva(t)
    setExercicio(ex)
    setOpen(true)
  }

  function aoAcertar(xp: number) {
    setFire((f) => f + 1)
    toast.success(`+${xp} XP conquistado!`, { icon: <Zap className="size-4" /> })
  }

  function selecionarTrilha(id: string) {
    setTrilhaSelecionadaId(id)
    setSeletorAberto(false)
  }

  if (!trilha) return null

  return (
    <div className="space-y-6 overflow-x-hidden pb-4">
      <Confetti fire={fire} />
      <CheckinCard aluno={aluno} onXp={() => setFire((f) => f + 1)} />

      

      <TrilhaHeader
        trilha={trilha}
        indice={trilhaIndex}
        trilhas={db.trilhas}
        seletorAberto={seletorAberto}
        onToggleSeletor={() => setSeletorAberto((v) => !v)}
        onFecharSeletor={() => setSeletorAberto(false)}
        onSelecionar={selecionarTrilha}
      />

      <CaminhoDeNiveis
        trilha={trilha}
        nivelAtual={prog.nivel_atual}
        completos={prog.completos}
        limiteAtingido={limiteAtingido}
        cor={cor}
        onAbrirExercicio={(ex) => abrirExercicio(trilha, ex)}
      />

      {tarefa && <TarefaProfessor tarefa={tarefa} />}

      <JogoDaTrilha nomeTrilha={trilha.nome} alunoId={aluno.id} bloqueado={limiteAtingido} />

      {trilhaAtiva && (
        <ExercicioDialog
          trilha={trilhaAtiva}
          exercicio={exercicio}
          alunoId={aluno.id}
          open={open}
          onOpenChange={setOpen}
          onAcerto={aoAcertar}
        />
      )}
    </div>
  )
}
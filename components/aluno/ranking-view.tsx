"use client"

import { useMemo, useState } from "react"
import { useStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Award, ChevronUp, Medal, Trophy, Users, type LucideIcon } from "lucide-react"
import { RewardIcon } from "@/components/rewards/reward-icon"
import { temaDoIcone } from "@/lib/rewards"
import type { IconeId } from "@/lib/rewards"
import type { Aluno } from "@/lib/types"

type Aba = "turma" | "escola"

const NOMES_TIPO_SQUAD: Record<string, string> = { dupla: "Dupla", trio: "Trio", squad: "Squad" }

// ---------------------------------------------------------------------------
// Ligas — cores seguem a paleta da marca (brand-gold e brand-orange), com
// prata em neutro por não haver equivalente de marca pra metal prateado.
// ---------------------------------------------------------------------------

interface LigaInfo {
  nome: string
  icon: LucideIcon
  corTexto: string
  corBg: string
  corBorda: string
  corSolida: string
  min: number
}

const LIGAS: LigaInfo[] = [
  {
    nome: "Ouro",
    icon: Trophy,
    corTexto: "text-brand-gold",
    corBg: "bg-brand-gold/10",
    corBorda: "border-brand-gold/40",
    corSolida: "bg-brand-gold",
    min: 1200,
  },
  {
    nome: "Prata",
    icon: Medal,
    corTexto: "text-slate-400",
    corBg: "bg-slate-400/10",
    corBorda: "border-slate-400/40",
    corSolida: "bg-slate-400",
    min: 500,
  },
  {
    nome: "Bronze",
    icon: Award,
    corTexto: "text-brand-orange",
    corBg: "bg-brand-orange/10",
    corBorda: "border-brand-orange/40",
    corSolida: "bg-brand-orange",
    min: 0,
  },
]

function ligaDoXp(xp: number): LigaInfo {
  return LIGAS.find((l) => xp >= l.min) ?? LIGAS[LIGAS.length - 1]
}

// Cor do medalhão de posição no pódio (1º/2º/3º) — mesma lógica das ligas,
// mas aplicada por rank do item, não pelo XP absoluto.
const COR_PODIO = ["bg-brand-gold text-white", "bg-slate-400 text-white", "bg-brand-orange text-white"] as const
const ICONE_PODIO = [Trophy, Medal, Award] as const

// ---------------------------------------------------------------------------
// Dados do ranking
// ---------------------------------------------------------------------------

interface ItemRanking {
  id: string
  nome: string
  xp: number
  membros: number
  subtitulo: string
  alunosDoItem: Aluno[]
}

function montarRankingSquads(db: ReturnType<typeof useStore>["db"], turmaId: string): ItemRanking[] {
  return db.squads
    .filter((s) => s.turma_id === turmaId)
    .map((s) => {
      const alunosDoItem = s.alunos_ids
        .map((id) => db.alunos.find((a) => a.id === id))
        .filter((a): a is Aluno => !!a)
        .sort((a, b) => b.xp_total - a.xp_total)
      return {
        id: s.id,
        nome: s.nome,
        xp: s.xp_coletivo,
        membros: s.alunos_ids.length,
        subtitulo: NOMES_TIPO_SQUAD[s.tipo] ?? "Squad",
        alunosDoItem,
      }
    })
}

function montarRankingTurmas(db: ReturnType<typeof useStore>["db"], escolaId: string): ItemRanking[] {
  return db.turmas
    .filter((t) => t.escola_id === escolaId)
    .map((t) => {
      const alunosDaTurma = db.alunos.filter((a) => a.turma_id === t.id).sort((a, b) => b.xp_total - a.xp_total)
      return {
        id: t.id,
        nome: t.nome,
        xp: alunosDaTurma.reduce((soma, a) => soma + a.xp_total, 0),
        membros: alunosDaTurma.length,
        subtitulo: "Turma",
        alunosDoItem: alunosDaTurma,
      }
    })
}

// ---------------------------------------------------------------------------
// Pilha de avatares
// ---------------------------------------------------------------------------

/** Pequena pilha de avatares (ícones escolhidos pelos alunos) com overflow "+N". */
function AvatarStack({ alunos, max = 4 }: { alunos: Aluno[]; max?: number }) {
  const visiveis = alunos.slice(0, max)
  const resto = alunos.length - visiveis.length

  return (
    <div className="flex -space-x-2.5">
      {visiveis.map((a) => {
        const temIcone = a.icone_selecionado && a.icone_selecionado !== "default"
        const tema = temIcone ? temaDoIcone(a.icone_selecionado as IconeId) : null
        return (
          <span
            key={a.id}
            title={a.nome}
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-full bg-card text-base ring-2 ring-card shadow-sm",
              temIcone ? tema!.text : "text-foreground",
            )}
          >
            {temIcone ? <RewardIcon icone={a.icone_selecionado} className="size-4.5" /> : a.avatar}
          </span>
        )
      })}
      {resto > 0 && (
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-extrabold text-muted-foreground ring-2 ring-card">
          +{resto}
        </span>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Seletor de aba (turma / escola)
// ---------------------------------------------------------------------------

function SeletorAba({ aba, onChange }: { aba: Aba; onChange: (aba: Aba) => void }) {
  return (
    <div className="flex gap-2 rounded-full bg-muted p-1">
      {(["turma", "escola"] as Aba[]).map((a) => (
        <button
          key={a}
          onClick={() => onChange(a)}
          className={cn(
            "flex-1 rounded-full py-2 text-sm font-display font-extrabold transition-colors",
            aba === a ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
          )}
        >
          {a === "turma" ? "Minha turma" : "Minha escola"}
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Card da liga atual
// ---------------------------------------------------------------------------

function CardLigaAtual({
  aba,
  minhaLiga,
  totalNaLiga,
  xpLider,
  minhaPosicao,
  totalNaLista,
  proximaLiga,
  faltaProximaLiga,
}: {
  aba: Aba
  minhaLiga: LigaInfo
  totalNaLiga: number
  xpLider: number
  minhaPosicao: number
  totalNaLista: number
  proximaLiga: LigaInfo | null
  faltaProximaLiga: number
}) {
  const LigaIcon = minhaLiga.icon

  return (
    <Card className={cn("border-2 p-4", minhaLiga.corBg, minhaLiga.corBorda)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl", minhaLiga.corBg)}>
            <LigaIcon className={cn("size-6", minhaLiga.corTexto)} />
          </span>
          <div>
            <p className="font-display text-lg font-extrabold text-foreground">Liga {minhaLiga.nome}</p>
            <p className="text-xs font-semibold text-muted-foreground">
              {aba === "turma" ? "Squads competindo neste nível" : "Turmas da sua escola"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-display text-xl font-extrabold text-foreground">{totalNaLiga}</p>
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            {aba === "turma" ? "squads" : "turmas"}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3 text-xs font-semibold text-muted-foreground">
        <span>Líder atual</span>
        <span className="font-display font-extrabold text-foreground">{xpLider.toLocaleString("pt-BR")} XP</span>
      </div>

      {aba === "turma" && minhaPosicao >= 0 && (
        <div className="mt-1 flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>Sua posição</span>
          <span className="font-display font-extrabold text-foreground">
            {minhaPosicao + 1}º lugar de {totalNaLista}
          </span>
        </div>
      )}

      {proximaLiga && (
        <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <ChevronUp className={cn("size-3.5 shrink-0", proximaLiga.corTexto)} />
          {faltaProximaLiga > 0 ? (
            <span>
              Faltam{" "}
              <span className="font-display font-extrabold text-foreground">
                {faltaProximaLiga.toLocaleString("pt-BR")} XP
              </span>{" "}
              para a Liga {proximaLiga.nome}
            </span>
          ) : (
            <span className="font-display font-extrabold text-foreground">Pronto para subir de liga!</span>
          )}
        </div>
      )}
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Cabeçalho e linhas da tabela
// ---------------------------------------------------------------------------

function CabecalhoTabela({ aba }: { aba: Aba }) {
  return (
    <div className="flex items-center gap-3 px-3 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
      <span className="w-9 shrink-0 text-center">Pos.</span>
      <span className="flex-1">{aba === "turma" ? "Squad" : "Turma"}</span>
      <span className="hidden w-16 shrink-0 items-center justify-end gap-1 sm:flex">
        <Users className="size-3" /> Membros
      </span>
      <span className="w-24 shrink-0 text-right">XP</span>
    </div>
  )
}

function MedalhaPosicao({ posicao }: { posicao: number }) {
  const noPodio = posicao < 3
  if (!noPodio) {
    return (
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted font-display text-sm font-extrabold text-muted-foreground">
        {posicao + 1}
      </span>
    )
  }
  const Icone = ICONE_PODIO[posicao]
  return (
    <span className={cn("grid size-9 shrink-0 place-items-center rounded-full font-display text-sm font-extrabold", COR_PODIO[posicao])}>
      <Icone className="size-4" />
    </span>
  )
}

function LinhaRanking({
  item,
  posicao,
  destaque,
  xpLider,
  itemAcima,
}: {
  item: ItemRanking
  posicao: number
  destaque: boolean
  xpLider: number
  itemAcima: ItemRanking | null
}) {
  const noPodio = posicao < 3
  const pctBarra = xpLider > 0 ? Math.max(4, Math.round((item.xp / xpLider) * 100)) : 0
  const gapAcima = itemAcima ? itemAcima.xp - item.xp : 0

  return (
    <Card className={cn("p-3 transition-colors", destaque && "ring-2 ring-primary bg-primary/5")}>
      <div className="flex items-center gap-3">
        <MedalhaPosicao posicao={posicao} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-display font-extrabold text-foreground">{item.nome}</span>
            {destaque && (
              <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-primary">
                Seu squad
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-muted-foreground">
            {item.subtitulo} · {item.membros} {item.membros === 1 ? "membro" : "membros"}
          </p>
        </div>

        {item.alunosDoItem.length > 0 && <AvatarStack alunos={item.alunosDoItem} />}

        <span className="w-24 shrink-0 text-right font-display font-extrabold text-foreground">
          {item.xp.toLocaleString("pt-BR")}
          <span className="ml-1 text-[10px] font-bold text-muted-foreground">XP</span>
        </span>
      </div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", noPodio ? "bg-primary" : "bg-muted-foreground/40")}
          style={{ width: `${pctBarra}%` }}
        />
      </div>

      {itemAcima && gapAcima > 0 && (
        <p className="mt-1.5 text-[11px] font-semibold text-muted-foreground">
          <span className="font-extrabold text-foreground">{gapAcima.toLocaleString("pt-BR")} XP</span> atrás de{" "}
          {itemAcima.nome}
        </p>
      )}
    </Card>
  )
}

function ListaVazia() {
  return (
    <p className="py-8 text-center text-sm text-muted-foreground">
      Ainda não há squads/turmas para rankear aqui.
    </p>
  )
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function RankingView() {
  const store = useStore()
  const { db, escolaId, turmaId, alunoId } = store
  const [aba, setAba] = useState<Aba>("turma")

  const meuSquadId = useMemo(() => db.alunos.find((a) => a.id === alunoId)?.squad_id ?? null, [db.alunos, alunoId])

  // Ranking por squads (nunca aluno individual exposto isoladamente — só em grupo)
  const squadsTurma = useMemo(() => montarRankingSquads(db, turmaId), [db, turmaId])

  // Ranking por turmas dentro da escola
  const turmasEscola = useMemo(() => montarRankingTurmas(db, escolaId), [db, escolaId])

  const lista = useMemo(
    () => [...(aba === "turma" ? squadsTurma : turmasEscola)].sort((a, b) => b.xp - a.xp),
    [aba, squadsTurma, turmasEscola],
  )

  const xpLider = lista[0]?.xp ?? 0
  const minhaPosicao = aba === "turma" ? lista.findIndex((item) => item.id === meuSquadId) : -1

  const xpReferencia = useMemo(() => {
    if (aba === "turma" && meuSquadId) return squadsTurma.find((s) => s.id === meuSquadId)?.xp ?? 0
    return xpLider
  }, [aba, meuSquadId, squadsTurma, xpLider])

  const minhaLiga = ligaDoXp(xpReferencia)
  const totalNaLiga = lista.filter((item) => ligaDoXp(item.xp).nome === minhaLiga.nome).length

  // Progresso da liga: quanto falta (em XP) para a próxima liga acima da atual
  const proximaLiga = useMemo(() => {
    const idxAtual = LIGAS.findIndex((l) => l.nome === minhaLiga.nome)
    return idxAtual > 0 ? LIGAS[idxAtual - 1] : null
  }, [minhaLiga])

  const faltaProximaLiga = proximaLiga ? Math.max(0, proximaLiga.min - xpReferencia) : 0

  return (
    <div className="space-y-4">
      <SeletorAba aba={aba} onChange={setAba} />

      <CardLigaAtual
        aba={aba}
        minhaLiga={minhaLiga}
        totalNaLiga={totalNaLiga}
        xpLider={xpLider}
        minhaPosicao={minhaPosicao}
        totalNaLista={lista.length}
        proximaLiga={proximaLiga}
        faltaProximaLiga={faltaProximaLiga}
      />

      {lista.length > 0 && <CabecalhoTabela aba={aba} />}

      <div className="space-y-2">
        {lista.map((item, i) => (
          <LinhaRanking
            key={item.id}
            item={item}
            posicao={i}
            destaque={aba === "turma" && item.id === meuSquadId}
            xpLider={xpLider}
            itemAcima={i > 0 ? lista[i - 1] : null}
          />
        ))}
        {lista.length === 0 && <ListaVazia />}
      </div>
    </div>
  )
}
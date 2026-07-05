"use client"

import type { Aluno } from "@/lib/types"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Heart, Target, Users } from "lucide-react"
import { StreakFlame } from "@/components/brand"
import { RewardIcon } from "@/components/rewards/reward-icon"

const TIPO_LABEL: Record<string, string> = { dupla: "Dupla", trio: "Trio", squad: "Squad de 4+" }

// Paleta vibrante por squad — mesma lógica usada na visão do professor
// (SquadsTab), pra manter a identidade visual consistente entre as telas.
const CORES_SQUAD = [
  { badge: "bg-orange-500/15 text-orange-600", faixa: "bg-orange-500" },
  { badge: "bg-cyan-500/15 text-cyan-600", faixa: "bg-cyan-500" },
  { badge: "bg-fuchsia-500/15 text-fuchsia-600", faixa: "bg-fuchsia-500" },
  { badge: "bg-lime-500/15 text-lime-700", faixa: "bg-lime-500" },
  { badge: "bg-amber-500/15 text-amber-600", faixa: "bg-amber-500" },
  { badge: "bg-sky-500/15 text-sky-600", faixa: "bg-sky-500" },
  { badge: "bg-rose-500/15 text-rose-600", faixa: "bg-rose-500" },
  { badge: "bg-violet-500/15 text-violet-600", faixa: "bg-violet-500" },
]

// Escolhe uma cor estável por squad a partir do id, assim o mesmo squad
// sempre aparece com a mesma cor entre renders e entre telas.
function corSquad(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return CORES_SQUAD[hash % CORES_SQUAD.length]
}

// Extrai iniciais do nome do squad (ex: "Foguetes" -> "FO") pra usar como
// badge no lugar de um emoji fixo.
function iniciaisSquad(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return "SQ"
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[1][0]).toUpperCase()
}

// Resolve o avatar de um aluno com a mesma prioridade usada na tela inicial
// (HomePage): ícone de recompensa escolhido > foto de avatar > emoji padrão.
// Lê sempre direto de db.alunos a cada render, então qualquer troca de
// perfil aparece aqui automaticamente.
function isImagePath(avatar: string): boolean {
  return avatar.startsWith("/") || avatar.startsWith("http")
}

function AvatarAluno({ aluno, className }: { aluno: Aluno; className?: string }) {
  if (aluno.icone_selecionado && aluno.icone_selecionado !== "default") {
    return <RewardIcon icone={aluno.icone_selecionado} className={className} />
  }
  if (isImagePath(aluno.avatar)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={aluno.avatar} alt="" className={cn("rounded-xl object-cover", className)} />
  }
  return <span className={cn("grid place-items-center", className)}>{aluno.avatar}</span>
}

export function SquadView({ aluno }: { aluno: Aluno }) {
  const { db } = useStore()
  const squad = db.squads.find((s) => s.id === aluno.squad_id)

  if (!squad) {
    return <SemSquad />
  }

  const membros = squad.alunos_ids
    .map((id) => db.alunos.find((a) => a.id === id))
    .filter((a): a is Aluno => Boolean(a))

  const hoje = db.data_atual
  const colegaAusente = membros.find(
    (m) => m.id !== aluno.id && !db.presencas.some((p) => p.aluno_id === m.id && p.data === hoje && p.presente),
  )

  const missao = db.missoes.find((m) => m.squad_id === squad.id)
  const metaXp = 1500
  const pctColetivo = Math.min(100, Math.round((squad.xp_coletivo / metaXp) * 100))
  const cor = corSquad(squad.id)

  return (
    <div className="space-y-4 pb-4">
      <CabecalhoSquad
        nome={squad.nome}
        tipo={squad.tipo}
        xpColetivo={squad.xp_coletivo}
        metaXp={metaXp}
        pctColetivo={pctColetivo}
        badgeCor={cor.badge}
      />

      {missao && <CardMissao titulo={missao.titulo} descricao={missao.descricao} xp={missao.xp_recompensa} />}

      {colegaAusente && <CardMissaoCuidado primeiroNome={colegaAusente.nome.split(" ")[0]} />}

      <ListaMembros membros={membros} alunoId={aluno.id} />
    </div>
  )
}

/* --------------------------------------------------------------------- */
/*  Estado vazio — aluno ainda não foi colocado em nenhum squad           */
/* --------------------------------------------------------------------- */

function SemSquad() {
  return (
    <div className="grid place-items-center gap-3 rounded-3xl bg-card p-10 text-center shadow-sm ring-1 ring-border">
      <span className="text-5xl">🧩</span>
      <h3 className="font-display text-xl font-extrabold">Você ainda não tem um squad</h3>
      <p className="text-sm font-semibold text-muted-foreground">
        A professora vai te colocar em um grupo em breve para vocês aprenderem juntos!
      </p>
    </div>
  )
}

/* --------------------------------------------------------------------- */
/*  Cabeçalho — nome do squad (com iniciais no lugar do emoji) e XP       */
/* --------------------------------------------------------------------- */

function CabecalhoSquad({
  nome,
  tipo,
  xpColetivo,
  metaXp,
  pctColetivo,
  badgeCor,
}: {
  nome: string
  tipo: string
  xpColetivo: number
  metaXp: number
  pctColetivo: number
  badgeCor: string
}) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-brand-purple/15 to-brand-turquoise/10 p-5 ring-1 ring-brand-purple/20">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "grid size-14 shrink-0 place-items-center rounded-2xl bg-white text-lg font-extrabold shadow-sm",
            badgeCor,
          )}
        >
          {iniciaisSquad(nome)}
        </span>
        <div>
          <h2 className="font-display text-2xl font-extrabold">Squad {nome}</h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-xs font-bold text-brand-purple">
            <Users className="size-3" /> {TIPO_LABEL[tipo]}
          </span>
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-sm font-extrabold">
          <span>XP coletivo</span>
          <span className="text-brand-purple">
            {xpColetivo} / {metaXp}
          </span>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-full bg-white/60">
          <div
            className="h-full rounded-full bg-brand-purple transition-all duration-700"
            style={{ width: `${pctColetivo}%` }}
          />
        </div>
      </div>
    </div>
  )
}

/* --------------------------------------------------------------------- */
/*  Missão ativa do squad                                                 */
/* --------------------------------------------------------------------- */

function CardMissao({ titulo, descricao, xp }: { titulo: string; descricao: string; xp: number }) {
  return (
    <div className="flex items-start gap-3 rounded-3xl bg-card p-4 shadow-sm ring-1 ring-border">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-green/15 text-primary">
        <Target className="size-5" />
      </span>
      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display font-extrabold">{titulo}</h3>
          <span className="rounded-full bg-brand-gold/20 px-2 py-0.5 text-xs font-extrabold text-amber-700">
            +{xp} XP
          </span>
        </div>
        <p className="text-sm font-semibold text-muted-foreground">{descricao}</p>
      </div>
    </div>
  )
}

/* --------------------------------------------------------------------- */
/*  Missão de cuidado — incentivo sutil quando um colega falta            */
/* --------------------------------------------------------------------- */

function CardMissaoCuidado({ primeiroNome }: { primeiroNome: string }) {
  return (
    <div className="flex items-center gap-3 rounded-3xl bg-brand-pink/10 p-4 ring-1 ring-brand-pink/20">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-pink/20 text-brand-pink">
        <Heart className="size-5 fill-brand-pink" />
      </span>
      <div>
        <h3 className="font-display font-extrabold">Missão de cuidado</h3>
        <p className="text-sm font-semibold text-muted-foreground">
          Que tal mandar um oi pro(a) {primeiroNome}? Um squad unido vai mais longe! 💜
        </p>
      </div>
    </div>
  )
}

/* --------------------------------------------------------------------- */
/*  Lista de membros — avatar sempre lido direto do cadastro do aluno     */
/* --------------------------------------------------------------------- */

function ListaMembros({ membros, alunoId }: { membros: Aluno[]; alunoId: string }) {
  return (
    <div className="rounded-3xl bg-card p-4 shadow-sm ring-1 ring-border">
      <h3 className="mb-3 font-display text-lg font-extrabold">Meu squad</h3>
      <div className="space-y-2">
        {membros.map((m) => {
          const souEu = m.id === alunoId
          return (
            <div
              key={m.id}
              className={cn(
                "flex items-center gap-3 rounded-2xl p-2",
                souEu ? "bg-primary/10 ring-1 ring-primary/30" : "bg-muted/50",
              )}
            >
              <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-white shadow-sm">
                <AvatarAluno aluno={m} className="size-11 text-2xl" />
              </span>
              <div className="flex-1">
                <p className="font-display font-extrabold">
                  {m.nome} {souEu && <span className="text-xs text-primary">(você)</span>}
                </p>
                <p className="text-xs font-bold text-muted-foreground">
                  Nível {m.nivel} · {m.xp_total} XP
                </p>
              </div>
              <StreakFlame dias={m.streak_dias} className="px-2 py-1 text-xs" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
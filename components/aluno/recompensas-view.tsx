"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { RARIDADE_INFO } from "@/lib/game"
import { Check, Clock, Gift, Lock, Palette, Sparkles } from "lucide-react"
import { toast } from "sonner"
import type { Banner, CorNome, Recompensa } from "@/lib/types"

type Aba = "jogo" | "real"

/* ------------------------------------------------------------------ */
/*  Card genérico de item colecionável (banner ou cor de nome)         */
/* ------------------------------------------------------------------ */

function ItemColecionavelCard({
  nome,
  raridade,
  desbloqueado,
  equipado,
  faltamXp,
  onEquipar,
  preview,
}: {
  nome: string
  raridade: keyof typeof RARIDADE_INFO
  desbloqueado: boolean
  equipado: boolean
  faltamXp: number
  onEquipar: () => void
  preview: React.ReactNode
}) {
  const info = RARIDADE_INFO[raridade]

  return (
    <Card className={cn("overflow-hidden border-2 p-0", equipado ? "border-primary" : info.borda)}>
      <div className="relative h-20">
        {preview}
        {!desbloqueado && (
          <div className="absolute inset-0 grid place-items-center bg-black/40 backdrop-blur-[2px]">
            <Lock className="size-6 text-white" />
          </div>
        )}
        {equipado && (
          <Badge className="absolute right-1 top-1 bg-primary text-primary-foreground">Em uso</Badge>
        )}
      </div>
      <div className="space-y-2 p-2">
        <p className="font-display text-sm font-extrabold leading-tight">{nome}</p>
        <Badge variant="secondary" className={cn("text-[10px]", info.classe)}>
          {info.nome}
        </Badge>
        {desbloqueado ? (
          <Button
            size="sm"
            variant={equipado ? "secondary" : "default"}
            className="w-full font-bold"
            disabled={equipado}
            onClick={onEquipar}
          >
            {equipado ? "Equipado" : "Equipar"}
          </Button>
        ) : (
          <p className="text-center text-[11px] font-bold text-muted-foreground">
            Faltam {faltamXp > 0 ? faltamXp : 0} XP
          </p>
        )}
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Aba "No jogo" — banners e cores de nome                            */
/* ------------------------------------------------------------------ */

function AbaJogo({
  aluno,
  banners,
  coresNome,
  equiparBanner,
  equiparCorNome,
}: {
  aluno: { id: string; xp_total: number; banners_desbloqueados: string[]; banner_equipado: string | null; cores_nome_desbloqueadas: string[]; cor_nome_equipada: string | null }
  banners: Banner[]
  coresNome: CorNome[]
  equiparBanner: (alunoId: string, bannerId: string) => void
  equiparCorNome: (alunoId: string, corId: string) => void
}) {
  const bannersOrdenados = [...banners].sort((a, b) => a.custo_xp - b.custo_xp)
  const coresOrdenadas = [...coresNome].sort((a, b) => a.custo_xp - b.custo_xp)

  return (
    <>
      <Card className="border-2 border-dashed border-brand-green/40 bg-brand-green/5 p-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles className="size-4 text-brand-green" />
          Banners de perfil desbloqueiam sozinhos ao atingir a meta de XP. Sem aprovação!
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {bannersOrdenados.map((b) => (
          <ItemColecionavelCard
            key={b.id}
            nome={b.nome}
            raridade={b.raridade}
            desbloqueado={aluno.banners_desbloqueados.includes(b.id)}
            equipado={aluno.banner_equipado === b.id}
            faltamXp={b.custo_xp - aluno.xp_total}
            preview={<div className={cn("h-full w-full", b.gradiente)} />}
            onEquipar={() => {
              equiparBanner(aluno.id, b.id)
              toast.success("Banner equipado!", { description: b.nome })
            }}
          />
        ))}
      </div>

      <Card className="border-2 border-dashed border-brand-purple/40 bg-brand-purple/5 p-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles className="size-4 text-brand-purple" />
          Cores de nome desbloqueiam sozinhas ao atingir a meta de XP. Sem aprovação!
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {coresOrdenadas.map((c) => (
          <ItemColecionavelCard
            key={c.id}
            nome={c.nome}
            raridade={c.raridade}
            desbloqueado={aluno.cores_nome_desbloqueadas.includes(c.id)}
            equipado={aluno.cor_nome_equipada === c.id}
            faltamXp={c.custo_xp - aluno.xp_total}
            preview={
              <div className="flex h-full w-full items-center justify-center bg-slate-900">
                <span className={cn("font-display text-lg font-extrabold", c.classe)}>Ex: Nome</span>
              </div>
            }
            onEquipar={() => {
              equiparCorNome(aluno.id, c.id)
              toast.success("Cor de nome equipada!", { description: c.nome })
            }}
          />
        ))}
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Aba "Mundo real" — recompensas cadastradas pela professora          */
/* ------------------------------------------------------------------ */

function StatusResgate({ status }: { status: "pendente" | "aprovada" | "negada" }) {
  return (
    <Badge
      className={cn(
        "gap-1",
        status === "pendente" && "bg-brand-gold/20 text-amber-700",
        status === "aprovada" && "bg-brand-green/20 text-green-700",
        status === "negada" && "bg-destructive/15 text-destructive",
      )}
    >
      {status === "pendente" && <Clock className="size-3" />}
      {status === "aprovada" && <Check className="size-3" />}
      {status === "pendente" ? "Na fila" : status === "aprovada" ? "Aprovada" : "Negada"}
    </Badge>
  )
}

function RecompensaRealCard({
  recompensa,
  xpAluno,
  resgate,
  onSolicitar,
}: {
  recompensa: Recompensa
  xpAluno: number
  resgate: { status: "pendente" | "aprovada" | "negada" } | undefined
  onSolicitar: () => void
}) {
  const esgotada = recompensa.quantidade <= 0
  const podeSolicitar = !esgotada && xpAluno >= recompensa.custo_xp

  return (
    <Card className="flex items-center gap-3 p-3">
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-orange/15 text-brand-orange">
        <Gift className="size-5" />
      </span>
      <div className="flex-1">
        <p className="font-display font-extrabold leading-tight">{recompensa.nome}</p>
        <p className="text-xs font-semibold text-muted-foreground">
          {esgotada ? "Esgotada" : `Meta: ${recompensa.custo_xp} XP`}
        </p>
      </div>
      {resgate ? (
        <StatusResgate status={resgate.status} />
      ) : (
        <Button size="sm" className="font-bold" disabled={!podeSolicitar} onClick={onSolicitar}>
          {esgotada
            ? "Indisponível"
            : podeSolicitar
              ? "Solicitar"
              : `Faltam ${recompensa.custo_xp - xpAluno}`}
        </Button>
      )}
    </Card>
  )
}

function AbaReal({
  aluno,
  recompensas,
  resgates,
  solicitarResgate,
}: {
  aluno: { id: string; xp_total: number; turma_id: string }
  recompensas: Recompensa[]
  resgates: { recompensa_id: string; solicitante_id: string; status: "pendente" | "aprovada" | "negada" }[]
  solicitarResgate: (recompensaId: string, tipo: "aluno", solicitanteId: string, turmaId: string) => void
}) {
  // Só recompensas ativas cadastradas pela professora para a turma do aluno.
  const disponiveis = recompensas
    .filter((r) => r.turma_id === aluno.turma_id && r.status === "ativa")
    .sort((a, b) => a.custo_xp - b.custo_xp)

  return (
    <>
      <Card className="border-2 border-dashed border-brand-orange/40 bg-brand-orange/5 p-3">
        <p className="text-sm font-semibold text-foreground">
          Recompensas do mundo real precisam da aprovação da professora. Ao atingir o critério, você
          solicita o resgate e ele entra na fila dela.
        </p>
      </Card>

      <div className="space-y-3">
        {disponiveis.map((r) => {
          const resgate = resgates.find(
            (rg) => rg.recompensa_id === r.id && rg.solicitante_id === aluno.id,
          )
          return (
            <RecompensaRealCard
              key={r.id}
              recompensa={r}
              xpAluno={aluno.xp_total}
              resgate={resgate}
              onSolicitar={() => {
                solicitarResgate(r.id, "aluno", aluno.id, aluno.turma_id)
                toast.success("Resgate solicitado!", {
                  description: "A professora vai avaliar seu pedido.",
                })
              }}
            />
          )
        })}

        {disponiveis.length === 0 && (
          <Card className="grid place-items-center gap-2 p-8 text-center">
            <Gift className="size-8 text-muted-foreground" />
            <p className="text-sm font-semibold text-muted-foreground">
              Sua professora ainda não cadastrou recompensas para esta turma.
            </p>
          </Card>
        )}
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Componente principal                                               */
/* ------------------------------------------------------------------ */

export function RecompensasView() {
  const { db, alunoId, equiparBanner, equiparCorNome, solicitarResgate } = useStore()
  const aluno = db.alunos.find((a) => a.id === alunoId)
  const [aba, setAba] = useState<Aba>("jogo")

  if (!aluno) return null

  return (
    <div className="space-y-4">
      <div className="flex gap-2 rounded-full bg-muted p-1">
        <button
          onClick={() => setAba("jogo")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-sm font-display font-extrabold transition-colors",
            aba === "jogo" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
          )}
        >
          <Palette className="size-4" /> No jogo
        </button>
        <button
          onClick={() => setAba("real")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-sm font-display font-extrabold transition-colors",
            aba === "real" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
          )}
        >
          <Gift className="size-4" /> Mundo real
        </button>
      </div>

      {aba === "jogo" ? (
        <AbaJogo
          aluno={aluno}
          banners={db.banners}
          coresNome={db.cores_nome}
          equiparBanner={equiparBanner}
          equiparCorNome={equiparCorNome}
        />
      ) : (
        <AbaReal
          aluno={aluno}
          recompensas={db.recompensas}
          resgates={db.resgates}
          solicitarResgate={solicitarResgate}
        />
      )}
    </div>
  )
}
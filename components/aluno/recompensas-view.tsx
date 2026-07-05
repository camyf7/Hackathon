"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { RARIDADE_INFO } from "@/lib/game"
import { Lock, Check, Clock, Sparkles } from "lucide-react"
import { toast } from "sonner"

export function RecompensasView() {
  const { db, alunoId, equiparBanner, equiparCorNome, solicitarResgate } = useStore()
  const aluno = db.alunos.find((a) => a.id === alunoId)
  const [aba, setAba] = useState<"jogo" | "real">("jogo")
  if (!aluno) return null

  const bannersOrdenados = [...db.banners].sort((a, b) => a.custo_xp - b.custo_xp)

  return (
    <div className="space-y-4">
      <div className="flex gap-2 rounded-full bg-muted p-1">
        <button
          onClick={() => setAba("jogo")}
          className={cn(
            "flex-1 rounded-full py-2 text-sm font-display font-extrabold transition-colors",
            aba === "jogo" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
          )}
        >
          🎨 No jogo
        </button>
        <button
          onClick={() => setAba("real")}
          className={cn(
            "flex-1 rounded-full py-2 text-sm font-display font-extrabold transition-colors",
            aba === "real" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
          )}
        >
          🎁 Mundo real
        </button>
      </div>

      {aba === "jogo" ? (
        <>
          <Card className="border-2 border-dashed border-brand-green/40 bg-brand-green/5 p-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="size-4 text-brand-green" />
              Banners de perfil desbloqueiam sozinhos ao atingir a meta de XP. Sem aprovação!
            </p>
          </Card>
           <div className="grid grid-cols-2 gap-3">
            {bannersOrdenados.map((b) => {
              const desbloqueado = aluno.banners_desbloqueados.includes(b.id)
              const equipado = aluno.banner_equipado === b.id
              const info = RARIDADE_INFO[b.raridade]
              const falta = b.custo_xp - aluno.xp_total
              return (
                <Card
                  key={b.id}
                  className={cn(
                    "overflow-hidden border-2 p-0",
                    equipado ? "border-primary" : info.borda,
                  )}
                >
                  <div className={cn("relative h-20", b.gradiente)}>
                    {!desbloqueado && (
                      <div className="absolute inset-0 grid place-items-center bg-black/40 backdrop-blur-[2px]">
                        <Lock className="size-6 text-white" />
                      </div>
                    )}
                    {equipado && (
                      <Badge className="absolute right-1 top-1 bg-primary text-primary-foreground">
                        Em uso
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2 p-2">
                    <p className="font-display text-sm font-extrabold leading-tight">{b.nome}</p>
                    <Badge variant="secondary" className={cn("text-[10px]", info.classe)}>
                      {info.nome}
                    </Badge>
                    {desbloqueado ? (
                      <Button
                        size="sm"
                        variant={equipado ? "secondary" : "default"}
                        className="w-full font-bold"
                        disabled={equipado}
                        onClick={() => {
                          equiparBanner(aluno.id, b.id)
                          toast.success("Banner equipado!", { description: b.nome })
                        }}
                      >
                        {equipado ? "Equipado" : "Equipar"}
                      </Button>
                    ) : (
                      <p className="text-center text-[11px] font-bold text-muted-foreground">
                        Faltam {falta > 0 ? falta : 0} XP
                      </p>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>

          {/* ---- NOVA SEÇÃO: Cor do nome ---- */}
          <Card className="border-2 border-dashed border-brand-purple/40 bg-brand-purple/5 p-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="size-4 text-brand-purple" />
              Cores de nome desbloqueiam sozinhas ao atingir a meta de XP. Sem aprovação!
            </p>
          </Card>
          <div className="grid grid-cols-2 gap-3">
            {[...db.cores_nome].sort((a, b) => a.custo_xp - b.custo_xp).map((c) => {
              const desbloqueado = aluno.cores_nome_desbloqueadas.includes(c.id)
              const equipado = aluno.cor_nome_equipada === c.id
              const info = RARIDADE_INFO[c.raridade]
              const falta = c.custo_xp - aluno.xp_total
              return (
                <Card
                  key={c.id}
                  className={cn(
                    "overflow-hidden border-2 p-0",
                    equipado ? "border-primary" : info.borda,
                  )}
                >
                  <div className="relative flex h-20 items-center justify-center bg-slate-900">
                    {!desbloqueado && (
                      <div className="absolute inset-0 grid place-items-center bg-black/40 backdrop-blur-[2px]">
                        <Lock className="size-6 text-white" />
                      </div>
                    )}
                    {equipado && (
                      <Badge className="absolute right-1 top-1 bg-primary text-primary-foreground">
                        Em uso
                      </Badge>
                    )}
                    <span className={cn("font-display text-lg font-extrabold", c.classe)}>
                      Ex: Nome
                    </span>
                  </div>
                  <div className="space-y-2 p-2">
                    <p className="font-display text-sm font-extrabold leading-tight">{c.nome}</p>
                    <Badge variant="secondary" className={cn("text-[10px]", info.classe)}>
                      {info.nome}
                    </Badge>
                    {desbloqueado ? (
                      <Button
                        size="sm"
                        variant={equipado ? "secondary" : "default"}
                        className="w-full font-bold"
                        disabled={equipado}
                        onClick={() => {
                          equiparCorNome(aluno.id, c.id)
                          toast.success("Cor de nome equipada!", { description: c.nome })
                        }}
                      >
                        {equipado ? "Equipado" : "Equipar"}
                      </Button>
                    ) : (
                      <p className="text-center text-[11px] font-bold text-muted-foreground">
                        Faltam {falta > 0 ? falta : 0} XP
                      </p>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      ) : (
        <>
          <Card className="border-2 border-dashed border-brand-orange/40 bg-brand-orange/5 p-3">
            <p className="text-sm font-semibold text-foreground">
              Recompensas do mundo real precisam da aprovação da professora. Ao atingir o critério, você
              solicita o resgate e ele entra na fila dela.
            </p>
          </Card>
          <div className="space-y-3">
            {db.recompensas_reais.map((r) => {
              const podeSolicitar = aluno.xp_total >= r.criterio_xp
              const resgate = db.resgates.find(
                (rg) => rg.recompensa_id === r.id && rg.solicitante_id === aluno.id,
              )
              return (
                <Card key={r.id} className="flex items-center gap-3 p-3">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-orange/15 text-2xl">
                    {r.emoji}
                  </span>
                  <div className="flex-1">
                    <p className="font-display font-extrabold leading-tight">{r.nome}</p>
                    <p className="text-xs font-semibold text-muted-foreground">
                      Meta: {r.criterio_xp} XP
                    </p>
                  </div>
                  {resgate ? (
                    <Badge
                      className={cn(
                        "gap-1",
                        resgate.status === "pendente" && "bg-brand-gold/20 text-amber-700",
                        resgate.status === "aprovada" && "bg-brand-green/20 text-green-700",
                        resgate.status === "negada" && "bg-destructive/15 text-destructive",
                      )}
                    >
                      {resgate.status === "pendente" && <Clock className="size-3" />}
                      {resgate.status === "aprovada" && <Check className="size-3" />}
                      {resgate.status === "pendente"
                        ? "Na fila"
                        : resgate.status === "aprovada"
                          ? "Aprovada"
                          : "Negada"}
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      className="font-bold"
                      disabled={!podeSolicitar}
                      onClick={() => {
                        solicitarResgate(r.id, "aluno", aluno.id, aluno.turma_id)
                        toast.success("Resgate solicitado!", {
                          description: "A professora vai avaliar seu pedido.",
                        })
                      }}
                    >
                      {podeSolicitar ? "Solicitar" : `Faltam ${r.criterio_xp - aluno.xp_total}`}
                    </Button>
                  )}
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

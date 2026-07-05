"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { Logo, StreakFlame, XpShieldIcon } from "@/components/brand"
import { TrilhasView } from "@/components/aluno/trilhas-view"
import { PerfilView } from "@/components/aluno/perfil-view"
import { SquadView } from "@/components/aluno/squad-view"
import { RankingView } from "@/components/aluno/ranking-view"
import { RecompensasView } from "@/components/aluno/recompensas-view"
import { cn } from "@/lib/utils"
import { Gift, Home, LogOut, Trophy, User, Users, Flame, ChevronDown } from "lucide-react"

type Tab = "trilhas" | "squad" | "ranking" | "recompensas" | "perfil"

const TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "trilhas", label: "Trilhas", icon: Home },
  { id: "squad", label: "Squad", icon: Users },
  { id: "ranking", label: "Ranking", icon: Trophy },
  { id: "recompensas", label: "Prêmios", icon: Gift },
  { id: "perfil", label: "Perfil", icon: User },
]

export default function AlunoPage() {
  const router = useRouter()
  const { db, ready, alunoId, setAlunoId } = useStore()
  const [tab, setTab] = useState<Tab>("trilhas")

  const aluno = db.alunos.find((a) => a.id === alunoId)

  useEffect(() => {
    if (ready && !alunoId) router.replace("/")
  }, [ready, alunoId, router])

  if (!ready || !aluno) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="animate-bounce-soft text-5xl">🎯</div>
      </div>
    )
  }

  function sair() {
    setAlunoId(null)
    router.push("/")
  }

  // ajuste aqui a origem do progresso geral (trilhas concluídas, etc)
  const progressoGeral = aluno.progresso_geral ?? 0 // 0-100

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Topo com stats */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-2.5">
          <Logo className="scale-90" />
          <button
            onClick={sair}
            aria-label="Sair"
            className="grid size-9 place-items-center rounded-full bg-muted text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="size-4" />
          </button>
        </div>

        {/* Cards de progresso e nível */}
        <div className="mx-auto grid max-w-2xl grid-cols-2 gap-2 px-4 pb-3">
          {/* Card: progresso geral */}
          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card px-3 py-2.5">
            <div className="flex items-center gap-1.5">
              <Flame className="size-4 fill-primary text-primary" />
              <span className="text-xs font-bold text-muted-foreground">
                Seu progresso geral
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progressoGeral}%` }}
              />
            </div>
          </div>

          {/* Card: nível / XP */}
          <button
            onClick={() => router.push("/aluno/trilha-recompensas")}
            className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-card px-3 py-2.5 text-left transition hover:bg-muted/60"
          >
            <div className="flex items-center gap-2">
              <XpShieldIcon className="size-8 shrink-0" />
              <div className="flex flex-col">
                <span className="font-display text-sm font-extrabold leading-tight text-foreground">
                  Nível {aluno.nivel}
                </span>
                <span className="text-xs font-bold leading-tight text-muted-foreground">
                  {aluno.xp_total} XP
                </span>
              </div>
            </div>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-5">
        {tab === "trilhas" && <TrilhasView aluno={aluno} />}
        {tab === "squad" && <SquadView aluno={aluno} />}
        {tab === "ranking" && <RankingView />}
        {tab === "recompensas" && <RecompensasView />}
        {tab === "perfil" && <PerfilView aluno={aluno} />}
      </main>

      {/* Nav inferior */}
      <nav className="sticky bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-stretch justify-around px-2 py-1.5">
          {TABS.map((t) => {
            const Icon = t.icon
            const ativo = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                aria-current={ativo ? "page" : undefined}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-xs font-bold transition",
                  ativo ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-2xl transition",
                    ativo && "bg-primary/15",
                  )}
                >
                  <Icon className={cn("size-5", ativo && "scale-110")} />
                </span>
                {t.label}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
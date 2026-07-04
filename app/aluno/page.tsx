"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { Logo, StreakFlame, XpBar, XpShieldIcon } from "@/components/brand"
import { TrilhasView } from "@/components/aluno/trilhas-view"
import { PerfilView } from "@/components/aluno/perfil-view"
import { SquadView } from "@/components/aluno/squad-view"
import { RankingView } from "@/components/aluno/ranking-view"
import { RecompensasView } from "@/components/aluno/recompensas-view"
import { cn } from "@/lib/utils"
import { Gift, Home, LogOut, Trophy, User, Users } from "lucide-react"
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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Topo com stats */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-2.5">
          <Logo className="scale-90" />
          <div className="flex items-center gap-2">
            <StreakFlame dias={aluno.streak_dias} />
            <button
              onClick={() => router.push("/aluno/trilha-recompensas")}
              aria-label="Trilha de Recompensas"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1.5 font-display font-extrabold text-primary transition hover:bg-primary/25"
            >
             <XpShieldIcon className="size-4" />
              {aluno.xp_total}
            </button>
            <button
              onClick={sair}
              aria-label="Sair"
              className="grid size-9 place-items-center rounded-full bg-muted text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
        {/* Barra de XP e nível */}
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 pb-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary font-display text-sm font-extrabold text-primary-foreground">
            {aluno.nivel}
          </span>
          <XpBar xp={aluno.xp_total} mostrarTexto={false} className="flex-1" />
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

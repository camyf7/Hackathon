"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { Logo } from "@/components/brand"
import { SchoolTurmaSelector } from "@/components/school-turma-selector"
import { DashboardTab } from "@/components/professor/dashboard-tab"
import { AlunosTab } from "@/components/professor/alunos-tab"
import { SquadsTab } from "@/components/professor/squads-tab"
import { AtividadesTab } from "@/components/professor/atividades-tab"
import { MissoesTab } from "@/components/professor/missoes-tab"
import { PresencaTab } from "@/components/professor/presenca-tab"
import { AprovacoesTab } from "@/components/professor/aprovacoes-tab"
import { AlertasTab } from "@/components/professor/alertas-tab"
import { DemoBar } from "@/components/demo-bar"
import { cn } from "@/lib/utils"
import {
  Activity,
  AlertTriangle,
  CalendarCheck,
  ClipboardList,
  Gift,
  Loader2,
  LogOut,
  Target,
  UsersRound,
} from "lucide-react"

type Tab =
  | "dashboard"
  | "alunos"
  | "squads"
  | "atividades"
  | "missoes"
  | "presenca"
  | "aprovacoes"
  | "alertas"

const TABS: { id: Tab; label: string; icon: typeof Activity }[] = [
  { id: "dashboard", label: "Painel", icon: Activity },
  { id: "alunos", label: "Alunos", icon: UsersRound },
  { id: "squads", label: "Squads", icon: UsersRound },
  { id: "atividades", label: "Atividades", icon: ClipboardList },
  { id: "missoes", label: "Missões", icon: Target },
  { id: "presenca", label: "Presença", icon: CalendarCheck },
  { id: "aprovacoes", label: "Prêmios", icon: Gift },
  { id: "alertas", label: "Alertas", icon: AlertTriangle },
]

export default function ProfessorPage() {
  const router = useRouter()
  const { ready, turmaId } = useStore()
  const [tab, setTab] = useState<Tab>("dashboard")

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Logo />
          <div className="flex items-center gap-2">
            <SchoolTurmaSelector showTurma />
            <button
              onClick={() => router.push("/")}
              aria-label="Sair"
              className="grid size-9 place-items-center rounded-full bg-muted text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>

        <nav className="mx-auto w-full max-w-6xl overflow-x-auto px-4 pb-2">
          <div className="flex items-center gap-1.5">
            {TABS.map((t) => {
              const Icon = t.icon
              const ativo = tab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  aria-current={ativo ? "page" : undefined}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition",
                    ativo ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="size-4" />
                  {t.label}
                </button>
              )
            })}
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        {tab === "dashboard" && <DashboardTab turmaId={turmaId} />}
        {tab === "alunos" && <AlunosTab turmaId={turmaId} />}
        {tab === "squads" && <SquadsTab turmaId={turmaId} />}
        {tab === "atividades" && <AtividadesTab turmaId={turmaId} />}
        {tab === "missoes" && <MissoesTab turmaId={turmaId} />}
        {tab === "presenca" && <PresencaTab turmaId={turmaId} />}
        {tab === "aprovacoes" && <AprovacoesTab turmaId={turmaId} />}
        {tab === "alertas" && <AlertasTab turmaId={turmaId} />}
      </main>

      <DemoBar />
    </div>
  )
}
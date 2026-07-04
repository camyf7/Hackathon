"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { Logo } from "@/components/brand"
import { TurmaSelector } from "@/components/professor/turma-selector"
import { DashboardTab } from "@/components/professor/dashboard-tab"
import { TurmasTab } from "@/components/professor/turmas-tab"
import { AlunosTab } from "@/components/professor/alunos-tab"
import { AtividadesTab } from "@/components/professor/atividades-tab"
import { RecompensasTab } from "@/components/professor/recompensas-tab"
import { SquadsTab } from "@/components/professor/squads-tab"
import { MissoesTab } from "@/components/professor/missoes-tab"

import { AprovacoesTab } from "@/components/professor/aprovacoes-tab"
import { AlertasTab } from "@/components/professor/alertas-tab"
import { DemoBar } from "@/components/demo-bar"
import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  ClipboardList,
  Gift,
  LayoutDashboard,
  LogOut,
  School,
  Target,
  Trophy,
  UsersRound,
} from "lucide-react"

type Tab =
  | "dashboard"
  | "turmas"
  | "alunos"
  | "atividades"
  | "recompensas"
  | "squads"
  | "missoes"
  | "aprovacoes"
  | "alertas"

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Painel", icon: LayoutDashboard },
  { id: "turmas", label: "Turmas", icon: School },
  { id: "alunos", label: "Alunos", icon: UsersRound },
  { id: "atividades", label: "Atividades", icon: ClipboardList },
  { id: "recompensas", label: "Recompensas", icon: Gift },
  { id: "squads", label: "Squads", icon: Trophy },
  { id: "missoes", label: "Missões", icon: Target },
  { id: "aprovacoes", label: "Resgates", icon: Gift },
  { id: "alertas", label: "Alertas", icon: AlertTriangle },
]

export default function ProfessorPage() {
  const router = useRouter()
  const { db, ready, professorId, escolaId, turmaId, logoutProfessor } = useStore()
  const [tab, setTab] = useState<Tab>("dashboard")

  useEffect(() => {
    if (ready && !professorId) router.replace("/professor/login")
  }, [ready, professorId, router])

  if (!ready || !professorId) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    )
  }

  const professor = db.professores.find((p) => p.id === professorId)
  const escola = db.escolas.find((e) => e.id === escolaId)
  const turmas = db.turmas.filter((t) => t.professor_id === professorId)
  const semTurma = turmas.length === 0
  const turmaValida = turmas.some((t) => t.id === turmaId)

  function sair() {
    logoutProfessor()
    router.push("/")
  }

  // abas que dependem de uma turma selecionada
  const precisaTurma = tab !== "turmas" && tab !== "dashboard"

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Logo />
            {escola && (
  <div className="hidden sm:flex flex-col">
    <span className="text-xs text-muted-foreground">
      Escola selecionada
    </span>
    <span className="text-sm font-semibold">
      {escola.nome}
    </span>
  </div>
)}
          </div>
          <div className="flex items-center gap-2">
            <TurmaSelector />
            <button
              onClick={sair}
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
                    "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold transition",
                    ativo
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted",
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
        {tab === "dashboard" && <DashboardTab turmaId={turmaValida ? turmaId : ""} />}
        {tab === "turmas" && <TurmasTab />}
        {precisaTurma && (semTurma || !turmaValida) ? (
          <EmptyTurma onIr={() => setTab("turmas")} sem={semTurma} />
        ) : (
          <>
            {tab === "alunos" && <AlunosTab turmaId={turmaId} />}
            {tab === "atividades" && <AtividadesTab turmaId={turmaId} />}
            {tab === "recompensas" && <RecompensasTab turmaId={turmaId} />}
            {tab === "squads" && <SquadsTab turmaId={turmaId} />}
            {tab === "missoes" && <MissoesTab turmaId={turmaId} />}
            {tab === "aprovacoes" && <AprovacoesTab turmaId={turmaId} />}
            {tab === "alertas" && <AlertasTab turmaId={turmaId} />}
          </>
        )}
      </main>

      <DemoBar />
    </div>
  )
}

function EmptyTurma({ onIr, sem }: { onIr: () => void; sem: boolean }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card p-10 text-center">
      <School className="mb-3 size-8 text-muted-foreground" />
      <p className="font-display text-lg font-bold text-foreground">
        {sem ? "Você ainda não tem turmas" : "Selecione uma turma"}
      </p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {sem
          ? "Crie sua primeira turma para cadastrar alunos, lançar atividades e recompensas."
          : "Escolha uma turma no topo para ver estes dados."}
      </p>
      {sem && (
        <button
          onClick={onIr}
          className="mt-4 rounded-2xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90"
        >
          Criar turma
        </button>
      )}
    </div>
  )
}
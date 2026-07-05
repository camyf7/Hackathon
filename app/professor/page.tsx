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
import { AlertasTab } from "@/components/professor/alertas-tab"
import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  ClipboardList,
  Gift,
  LayoutDashboard,
  LogOut,
  School,
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
  | "alertas"

type TabDef = { id: Tab; label: string; icon: typeof LayoutDashboard }

// Lista plana — a bottom nav mostra tudo de uma vez, sem agrupamento,
// então cada item precisa de um label curto o suficiente para caber.
const TABS: TabDef[] = [
  { id: "dashboard", label: "Painel", icon: LayoutDashboard },
  { id: "turmas", label: "Turmas", icon: School },
  { id: "alunos", label: "Alunos", icon: UsersRound },
  { id: "atividades", label: "Ativid.", icon: ClipboardList },
  { id: "recompensas", label: "Prêmios", icon: Gift },
  { id: "squads", label: "Squads", icon: Trophy },
  { id: "alertas", label: "Alertas", icon: AlertTriangle },
]

// Extrai iniciais do nome do professor (ex: "Prof. Marina Andrade" -> "PA")
// pra usar como avatar quando não há foto cadastrada.
function iniciais(nome?: string) {
  if (!nome) return "P"
  const partes = nome.trim().split(/\s+/)
  const primeira = partes[0]?.[0] ?? ""
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ""
  return (primeira + ultima).toUpperCase()
}

export default function ProfessorPage() {
  const router = useRouter()
  const { db, ready, professorId, escolaId, turmaId, logoutProfessor } = useStore()
  const [tab, setTab] = useState<Tab>("dashboard")
  const [isScrolled, setIsScrolled] = useState(false)

  // Detect scroll para efeito de sombra sutil no header
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Scroll suave para o topo ao mudar de tab
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [tab])

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

  function irPara(t: Tab) {
    setTab(t)
  }

  const precisaTurma = tab !== "turmas" && tab !== "dashboard"

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Topo com identidade, escola, turma e sair */}
      <header
        className={cn(
          "sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur transition-shadow",
          isScrolled && "shadow-sm",
        )}
      >
        <div className="mx-auto max-w-2xl px-4 py-3">
          {/* Linha principal: marca da escola + seletor de turma */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <Logo className="scale-90" />
              {escola && (
                <div className="hidden min-w-0 flex-col truncate sm:flex">
                  <span className="text-[10px] font-medium leading-none text-muted-foreground">
                    Escola
                  </span>
                  <span className="mt-0.5 max-w-[180px] truncate text-sm font-bold leading-none text-foreground">
                    {escola.nome}
                  </span>
                </div>
              )}
            </div>

            <TurmaSelector />
          </div>

          {/* Linha de identidade: avatar com iniciais + nome + sair,
              como um cartão compacto em vez de texto solto */}
          <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-muted/50 py-1.5 pl-1.5 pr-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/15 text-[11px] font-extrabold text-primary">
                {iniciais(professor?.nome)}
              </span>
              <span className="min-w-0 truncate text-xs font-semibold text-foreground">
                {professor?.nome ?? "Professor"}
              </span>
            </div>
            <button
              onClick={sair}
              className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="size-3.5" />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo — padding inferior reserva espaço pra bottom nav não cobrir nada */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-5 pb-24">
        {tab === "dashboard" && <DashboardTab turmaId={turmaValida ? turmaId : ""} />}
        {tab === "turmas" && <TurmasTab />}
        {precisaTurma && (semTurma || !turmaValida) ? (
          <EmptyTurma onIr={() => irPara("turmas")} sem={semTurma} />
        ) : (
          <>
            {tab === "alunos" && <AlunosTab turmaId={turmaId} />}
            {tab === "atividades" && <AtividadesTab turmaId={turmaId} />}
            {tab === "recompensas" && <RecompensasTab turmaId={turmaId} />}
            {tab === "squads" && <SquadsTab turmaId={turmaId} />}
            {tab === "alertas" && <AlertasTab turmaId={turmaId} />}
          </>
        )}
      </main>

      {/* Bottom nav — 7 colunas de largura igual, ícone + label proporcionais */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto grid max-w-2xl grid-cols-7">
          {TABS.map((item) => {
            const Icon = item.icon
            const ativo = tab === item.id
            return (
              <button
                key={item.id}
                onClick={() => irPara(item.id)}
                aria-current={ativo ? "page" : undefined}
                className="flex flex-col items-center justify-center gap-1 py-2 transition-colors"
              >
                <span
                  className={cn(
                    "grid aspect-square w-7 place-items-center rounded-xl transition-colors",
                    ativo ? "bg-primary/10 text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span
                  className={cn(
                    "max-w-full truncate text-[10px] font-bold leading-none",
                    ativo ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

function EmptyTurma({ onIr, sem }: { onIr: () => void; sem: boolean }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card p-10 text-center animate-in fade-in duration-500">
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
          className="mt-4 rounded-2xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition hover:scale-105 active:scale-95"
        >
          Criar turma
        </button>
      )}
    </div>
  )
}
"use client"

import { useEffect, useState, useRef } from "react"
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
  Menu,
  School,
  Target,
  Trophy,
  UsersRound,
  X,
  ChevronDown,
} from "lucide-react"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer"

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

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard; color?: string }[] = [
  { id: "dashboard", label: "Painel", icon: LayoutDashboard, color: "text-blue-500" },
  { id: "turmas", label: "Turmas", icon: School, color: "text-purple-500" },
  { id: "alunos", label: "Alunos", icon: UsersRound, color: "text-green-500" },
  { id: "atividades", label: "Atividades", icon: ClipboardList, color: "text-orange-500" },
  { id: "recompensas", label: "Recompensas", icon: Gift, color: "text-pink-500" },
  { id: "squads", label: "Squads", icon: Trophy, color: "text-yellow-500" },
  { id: "missoes", label: "Missões", icon: Target, color: "text-red-500" },
  { id: "aprovacoes", label: "Resgates", icon: Gift, color: "text-teal-500" },
  { id: "alertas", label: "Alertas", icon: AlertTriangle, color: "text-amber-500" },
]

export default function ProfessorPage() {
  const router = useRouter()
  const { db, ready, professorId, escolaId, turmaId, logoutProfessor } = useStore()
  const [tab, setTab] = useState<Tab>("dashboard")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showTurmasDropdown, setShowTurmasDropdown] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)

  // Detect scroll para efeitos visuais
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Fecha menu móvel ao mudar de tab
  useEffect(() => {
    setMobileMenuOpen(false)
    // Scroll suave para o topo ao mudar de tab
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [tab])

  // Fecha dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setShowTurmasDropdown(false)
      }
    }
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

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

  const precisaTurma = tab !== "turmas" && tab !== "dashboard"

  const tabAtual = TABS.find((t) => t.id === tab)
  const TabIcon = tabAtual?.icon || LayoutDashboard

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      {/* Header - Versão Mobile Otimizada */}
      <header
        ref={headerRef}
        className={cn(
          "sticky top-0 z-40 transition-all duration-300",
          isScrolled
            ? "border-b border-border bg-background/95 backdrop-blur-xl shadow-lg"
            : "bg-background/80 backdrop-blur-sm"
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2 lg:px-4 lg:py-3">
          {/* Logo e Escola */}
          <div className="flex items-center gap-2 min-w-0">
            <Logo />
            {escola && (
              <div className="hidden sm:flex flex-col truncate">
                <span className="text-[10px] leading-none text-muted-foreground">
                  Escola
                </span>
                <span className="text-sm font-semibold truncate max-w-[120px] lg:max-w-[200px]">
                  {escola.nome}
                </span>
              </div>
            )}
          </div>

          {/* Ações - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <TurmaSelector />
            <button
              onClick={sair}
              aria-label="Sair"
              className="grid size-9 place-items-center rounded-full bg-muted/50 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive hover:scale-105 active:scale-95"
            >
              <LogOut className="size-4" />
            </button>
          </div>

          {/* Ações - Mobile */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              onClick={() => setShowTurmasDropdown(!showTurmasDropdown)}
              aria-label="Selecionar turma"
              className="flex items-center gap-1 rounded-full bg-muted/50 px-3 py-1.5 text-sm font-medium transition hover:bg-muted active:scale-95"
            >
              <span className="max-w-[80px] truncate">
                {turmas.find((t) => t.id === turmaId)?.nome || "Turma"}
              </span>
              <ChevronDown
                className={cn(
                  "size-3 transition-transform duration-200",
                  showTurmasDropdown && "rotate-180"
                )}
              />
            </button>
            <button
              onClick={sair}
              aria-label="Sair"
              className="grid size-9 place-items-center rounded-full bg-muted/50 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive active:scale-95"
            >
              <LogOut className="size-4" />
            </button>
            {/* Botão Menu Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
              className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground transition hover:scale-105 active:scale-95"
            >
              {mobileMenuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          </div>
        </div>

        {/* Dropdown Turmas Mobile */}
        {showTurmasDropdown && (
          <div className="border-t border-border bg-background p-2 md:hidden">
            <div className="space-y-1">
              <TurmaSelector />
              <button
                onClick={() => setShowTurmasDropdown(false)}
                className="w-full rounded-lg bg-muted px-4 py-2 text-sm text-muted-foreground hover:bg-muted/70"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* Navegação Desktop */}
        <nav className="hidden md:block mx-auto w-full max-w-6xl overflow-x-auto px-4 pb-2">
          <div className="flex items-center gap-1">
            {TABS.map((t) => {
              const Icon = t.icon
              const ativo = tab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  aria-current={ativo ? "page" : undefined}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-all duration-200",
                    ativo
                      ? "bg-primary text-primary-foreground shadow-md hover:shadow-lg"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className={cn("size-4", ativo ? "text-current" : t.color)} />
                  {t.label}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Navegação Mobile - Drawer */}
        <Drawer open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <DrawerTrigger asChild>
            <button className="hidden" />
          </DrawerTrigger>
          <DrawerContent className="max-h-[85vh] rounded-t-3xl">
            <div className="mx-auto w-full max-w-md px-4 pb-6 pt-4">
              {/* Indicador visual */}
              <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-muted-foreground/30" />
              
              {/* Cabeçalho do drawer */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TabIcon className="size-5 text-primary" />
                  <span className="font-bold">Navegação</span>
                </div>
                <DrawerClose asChild>
                  <button className="grid size-8 place-items-center rounded-full bg-muted hover:bg-muted/70">
                    <X className="size-4" />
                  </button>
                </DrawerClose>
              </div>

              {/* Grid de Tabs Mobile */}
              <div className="grid grid-cols-3 gap-2">
                {TABS.map((t) => {
                  const Icon = t.icon
                  const ativo = tab === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-xl p-3 transition-all duration-200",
                        ativo
                          ? "bg-primary text-primary-foreground shadow-md scale-95"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:scale-105"
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-5 transition-transform",
                          ativo && "scale-110"
                        )}
                      />
                      <span className="text-xs font-medium">{t.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Informações do professor */}
              <div className="mt-4 rounded-xl bg-muted/50 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{professor?.nome}</p>
                    <p className="text-xs text-muted-foreground">{professor?.email}</p>
                  </div>
                  <button
                    onClick={sair}
                    className="flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive transition hover:bg-destructive/20 active:scale-95"
                  >
                    <LogOut className="size-3.5" />
                    Sair
                  </button>
                </div>
              </div>

              {/* Versão do app */}
              <p className="mt-3 text-center text-[10px] text-muted-foreground">
                v2.0.0 • {new Date().getFullYear()}
              </p>
            </div>
          </DrawerContent>
        </Drawer>
      </header>

      {/* Indicador de Tab Atual - Mobile */}
      <div className="md:hidden border-b border-border bg-background/50 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TabIcon className="size-4 text-primary" />
            <span className="text-sm font-bold">{tabAtual?.label || "Dashboard"}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {turmas.find((t) => t.id === turmaId)?.nome || "Sem turma"}
          </span>
        </div>
      </div>

      {/* Main Content */}
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
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { Logo, StreakFlame } from "@/components/brand"
import { SchoolTurmaSelector } from "@/components/school-turma-selector"
import { DemoBar } from "@/components/demo-bar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { QrCode, Rocket, ScanLine, Sparkles, UserRound } from "lucide-react"
import { cn } from "@/lib/utils"

export default function HomePage() {
  const router = useRouter()
  const { db, ready, turmaId, setAlunoId } = useStore()
  const [modo, setModo] = useState<"aluno" | null>(null)

  const alunosTurma = db.alunos
    .filter((a) => a.turma_id === turmaId)
    .sort((a, b) => a.nome.localeCompare(b.nome))

  function entrarComoAluno(id: string) {
    setAlunoId(id)
    router.push("/aluno")
  }

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="animate-bounce-soft text-5xl">🎯</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Logo />
          <SchoolTurmaSelector showTurma={modo === "aluno"} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {/* Hero */}
        <section className="mb-8 flex flex-col items-center gap-4 text-center">
          <span className="animate-bounce-soft text-6xl drop-shadow-sm sm:text-7xl">🦊</span>
          <h1 className="font-display text-4xl font-extrabold leading-tight text-balance sm:text-5xl">
            Aprender vira <span className="text-primary">aventura</span>
          </h1>
          <p className="max-w-xl text-pretty text-base font-semibold text-muted-foreground sm:text-lg">
            Complete trilhas, ganhe XP, mantenha seu streak aceso e evolua com seu squad. O Duolingo da
            vida escolar da rede municipal de Caraguatatuba.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-bold">
            <span className="rounded-full bg-brand-green/15 px-3 py-1 text-primary">🔥 Streaks</span>
            <span className="rounded-full bg-brand-purple/15 px-3 py-1 text-brand-purple">🏆 Squads</span>
            <span className="rounded-full bg-brand-orange/15 px-3 py-1 text-brand-orange">🎁 Recompensas</span>
            <span className="rounded-full bg-brand-turquoise/15 px-3 py-1 text-cyan-700">📚 Trilhas</span>
          </div>
        </section>

        {/* Seleção de papel */}
        {modo === null && (
          <section className="grid gap-4 sm:grid-cols-2">
            <RoleCard
              icon={<UserRound className="size-8" />}
              cor="bg-brand-green"
              titulo="Sou Aluno(a)"
              desc="Aproxime sua carteirinha e comece a jogar!"
              cta="Entrar como aluno"
              onClick={() => setModo("aluno")}
            />
            <RoleCard
              icon={<Sparkles className="size-8" />}
              cor="bg-brand-purple"
              titulo="Sou Professor(a)"
              desc="Gerencie turmas, squads, presença e recompensas."
              cta="Painel da professora"
              onClick={() => router.push("/professor")}
            />
          </section>
        )}

        {/* Login por carteirinha */}
        {modo === "aluno" && (
          <section>
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ScanLine className="size-5 text-primary" />
                <h2 className="font-display text-2xl font-extrabold">Toque sua carteirinha</h2>
              </div>
              <Button variant="ghost" className="rounded-full font-bold" onClick={() => setModo(null)}>
                Voltar
              </Button>
            </div>
            <p className="mb-4 text-sm font-semibold text-muted-foreground">
              Escolha seu cartão para entrar (simula o QR da carteirinha da escola).
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {alunosTurma.map((a) => (
                <button
                  key={a.id}
                  onClick={() => entrarComoAluno(a.id)}
                  className="group flex flex-col items-center gap-2 rounded-3xl border-2 border-border bg-card p-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-primary hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <span className="grid size-16 place-items-center rounded-2xl bg-muted text-4xl transition group-hover:bg-primary/10">
                    {a.avatar}
                  </span>
                  <span className="line-clamp-1 font-display font-extrabold">{a.nome}</span>
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <span className="rounded-full bg-brand-gold/20 px-2 py-0.5 text-amber-700">Nv {a.nivel}</span>
                    <StreakFlame dias={a.streak_dias} className="px-2 py-0.5 text-xs" />
                  </div>
                  <span className="mt-1 flex items-center gap-1 text-xs font-bold text-primary opacity-0 transition group-hover:opacity-100">
                    <QrCode className="size-3" /> Entrar
                  </span>
                </button>
              ))}
              {alunosTurma.length === 0 && (
                <p className="col-span-full rounded-2xl bg-muted p-6 text-center font-semibold text-muted-foreground">
                  Nenhum aluno nesta turma ainda. A professora precisa cadastrar os alunos.
                </p>
              )}
            </div>
          </section>
        )}
      </main>

      <DemoBar />
    </div>
  )
}

function RoleCard({
  icon,
  cor,
  titulo,
  desc,
  cta,
  onClick,
}: {
  icon: React.ReactNode
  cor: string
  titulo: string
  desc: string
  cta: string
  onClick: () => void
}) {
  return (
    <Card className="group flex flex-col items-start gap-4 rounded-3xl border-2 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <span className={cn("grid size-16 place-items-center rounded-2xl text-white shadow-md", cor)}>
        {icon}
      </span>
      <div>
        <h3 className="font-display text-2xl font-extrabold">{titulo}</h3>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">{desc}</p>
      </div>
      <Button
        onClick={onClick}
        className="mt-auto w-full rounded-2xl py-6 text-base font-extrabold shadow-[0_4px_0_0_rgba(0,0,0,0.15)] active:translate-y-0.5 active:shadow-none"
      >
        <Rocket className="size-5" /> {cta}
      </Button>
    </Card>
  )
}

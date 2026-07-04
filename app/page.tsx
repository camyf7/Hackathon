"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { Logo, StreakFlame } from "@/components/brand"
import { SchoolTurmaSelector } from "@/components/school-turma-selector"
import { DemoBar } from "@/components/demo-bar"
import { cn } from "@/lib/utils"
import { ArrowRight, GraduationCap, QrCode, ScanLine } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const { db, ready, turmaId, setAlunoId } = useStore()
  const [tela, setTela] = useState<"perfil" | "carteirinha">("perfil")

  const alunosTurma = db.alunos
    .filter((a) => a.turma_id === turmaId)
    .sort((a, b) => a.nome.localeCompare(b.nome))

  function entrarComoAluno(id: string) {
    setAlunoId(id)
    router.push("/aluno")
  }

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-gradient-to-b from-indigo-50 via-sky-50 to-violet-50">
        <div className="animate-bounce-soft text-5xl">🎯</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col ">
      <header className="mx-auto flex w-full max-w-md flex-wrap items-center justify-between gap-3 px-6 pt-6">
        <Logo />
        <SchoolTurmaSelector showTurma={tela === "carteirinha"} />
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-10">
        {tela === "perfil" && (
          <>
            <div className="mb-10 text-center">
              <h1 className="text-5xl font-extrabold text-orange-600 sm:text-5xl">
                Olá, novamente!
              </h1>
              <p className="mt-2 text-base font-semibold text-orange-400">
                Já estávamos sentindo sua falta.
              </p>
            </div>

            <p className="mb-4 text-center text-sm font-bold text-purple-500">
              Escolha abaixo um perfil para acessar.
            </p>

            <div className="flex flex-col gap-4 ">
              <ProfileCard
                sou="Sou"
                titulo="Estudante"
                onClick={() => setTela("carteirinha")}
              />
              <ProfileCard
                sou="Sou"
                titulo="Professor(a)"
                extra="painel da turma"
                onClick={() => router.push("/professor")}
              />
            </div>
          </>
        )}

        {tela === "carteirinha" && (
          <>
            <div className="mb-6 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ScanLine className="size-5 text-primary" />
                <h2 className="font-display text-2xl font-extrabold text-red-600">
                  Toque sua carteirinha
                </h2>
              </div>
              <button
                onClick={() => setTela("perfil")}
                className="rounded-full px-3 py-1.5 text-sm font-bold text-slate-500 transition hover:bg-white/60"
              >
                Voltar
              </button>
            </div>
            <p className="mb-5 text-sm font-semibold text-slate-500">
              Escolha seu cartão para entrar (simula o QR da carteirinha da escola).
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {alunosTurma.map((a) => (
                <button
                  key={a.id}
                  onClick={() => entrarComoAluno(a.id)}
                  className="group flex flex-col items-center gap-2 rounded-3xl border border-white/60 bg-white/90 p-4 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <span className="grid size-14 place-items-center rounded-2xl bg-muted text-3xl transition group-hover:bg-primary/10">
                    {a.avatar}
                  </span>
                  <span className="line-clamp-1 font-display font-extrabold text-slate-700">
                    {a.nome}
                  </span>
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <span className="rounded-full bg-brand-gold/20 px-2 py-0.5 text-amber-700">
                      Nv {a.nivel}
                    </span>
                    <StreakFlame dias={a.streak_dias} className="px-2 py-0.5 text-xs" />
                  </div>
                  <span className="mt-1 flex items-center gap-1 text-xs font-bold text-primary opacity-0 transition group-hover:opacity-100">
                    <QrCode className="size-3" /> Entrar
                  </span>
                </button>
              ))}
              {alunosTurma.length === 0 && (
                <p className="col-span-full rounded-2xl bg-white/80 p-6 text-center font-semibold text-muted-foreground">
                  Nenhum aluno nesta turma ainda. A professora precisa cadastrar os alunos.
                </p>
              )}
            </div>
          </>
        )}
      </main>

      <DemoBar />
    </div>
  )
}

function ProfileCard({
  sou,
  titulo,
  extra,
  onClick,
}: {
  sou: string
  titulo: string
  extra?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center justify-between gap-3 rounded-[28px] border border-white/60",
        "bg-gradient-to-r from-zinc-800 to-zinc-900 px-6 py-5 text-left shadow-[0_6px_20px_-8px_rgba(30,41,59,0.25)]",
        "transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-8px_rgba(30,41,59,0.3)]",
      )}
    >
      <span>
        <span className="block text-sm font-semibold">{sou}</span>
        <span className="block font-display text-2xl font-extrabold text-purple-500">{titulo}</span>
      </span>

      <span className="flex items-center gap-2">
        {extra && (
          <span className="hidden items-center gap-1 text-xs font-bold text-secondary sm:flex">
            <GraduationCap className="size-4" />
            {extra}
          </span>
        )}
        <span className="grid size-10 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-400 transition group-hover:border-primary group-hover:text-primary">
          <ArrowRight className="size-4" />
        </span>
      </span>
    </button>
  )
}
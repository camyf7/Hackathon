"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { useRewards } from "@/hooks/useRewards"
import { temaDoIcone, type IconeId } from "@/lib/rewards"
import { XPBar } from "@/components/rewards/XPBar"
import { RewardTrack } from "@/components/rewards/RewardTrack"
import { RewardCard } from "@/components/rewards/RewardCard"
import { Logo } from "@/components/brand"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function TrilhaRecompensasPage() {
  const router = useRouter()
  const { ready, alunoId } = useStore()
  const { aluno, carregado, xpTotal, recompensas, resgatar, selectedIcon } = useRewards(alunoId ?? "")
  const [subiuDeNivel, setSubiuDeNivel] = useState(false)
  const nivelAnteriorRef = useRef<number | null>(null)

  const tema = temaDoIcone((selectedIcon ?? "default") as IconeId)

  useEffect(() => {
    if (ready && !alunoId) router.replace("/")
  }, [ready, alunoId, router])

  useEffect(() => {
    if (!aluno) return
    if (nivelAnteriorRef.current === null) {
      nivelAnteriorRef.current = aluno.nivel
      return
    }
    if (aluno.nivel > nivelAnteriorRef.current) {
      setSubiuDeNivel(true)
      toast.success(`Você alcançou o nível ${aluno.nivel}!`, { icon: "✨" })
      const t = setTimeout(() => setSubiuDeNivel(false), 1200)
      nivelAnteriorRef.current = aluno.nivel
      return () => clearTimeout(t)
    }
    nivelAnteriorRef.current = aluno.nivel
  }, [aluno?.nivel])

  if (!carregado || !aluno) {
    return <div className="min-h-screen bg-background" />
  }

  function handleResgatar(id: number) {
    const ok = resgatar(id)
    if (ok) {
      const recompensa = recompensas.find((r) => r.id === id)
      toast.success("Recompensa resgatada!", { description: recompensa?.nome })
    }
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.back()}
            aria-label="Voltar"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground transition hover:bg-muted/70"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-lg font-extrabold text-foreground">Trilha de Recompensas</h1>
            <p className="text-xs font-semibold text-muted-foreground">
              O mesmo XP das suas atividades desbloqueia novos ícones de perfil
            </p>
          </div>
          <Logo className="hidden scale-75 sm:block" />
        </div>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-5">
        <section className={cn("rounded-3xl bg-card p-4 shadow-sm ring-1", tema.ring)}>
          <XPBar xp={xpTotal} subiuDeNivel={subiuDeNivel} />
          <p className={cn("mt-3 text-right font-display text-sm font-extrabold", tema.text)}>
            {xpTotal} XP acumulados
          </p>
        </section>

        <RewardTrack recompensas={recompensas} />

        <section className="space-y-3">
          <h2 className="px-1 font-display text-lg font-extrabold text-foreground">Recompensas</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {recompensas.map((r) => (
              <RewardCard key={r.id} recompensa={r} onResgatar={handleResgatar} />
            ))}
          </div>
        </section>

        <p className="px-1 text-center text-xs font-semibold text-muted-foreground">
          Complete atividades, questionários, presenças e desafios nas Trilhas para ganhar XP.
        </p>
      </main>
    </div>
  )
}
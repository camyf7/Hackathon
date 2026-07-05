"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion"
import { useStore } from "@/lib/store"
import { StreakFlame } from "@/components/brand"
import { RewardIcon } from "@/components/rewards/reward-icon"
import { SchoolTurmaSelector } from "@/components/school-turma-selector"
import { DemoBar } from "@/components/demo-bar"

import { cn } from "@/lib/utils"
import { ArrowRight, FlaskConical, GraduationCap, QrCode, ScanLine, Sparkles, X } from "lucide-react"

/* ---------------------------------------------------------------------- */
/* Motion tokens                                                          */
/* ---------------------------------------------------------------------- */

const pageEase = [0.16, 1, 0.3, 1] as const

const screenVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: pageEase, staggerChildren: 0.07 },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.25, ease: pageEase },
  },
}

const itemVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: pageEase } },
}

/** Um "avatar" pode ser um emoji (ex: "🦊") ou um caminho de imagem (ex: "/avatar1.png"). */
function isImagePath(avatar: string): boolean {
  return avatar.startsWith("/") || avatar.startsWith("http")
}

export default function HomePage() {
  const router = useRouter()
  const { db, ready, turmaId, setAlunoId } = useStore()
  const [tela, setTela] = useState<"perfil" | "carteirinha">("perfil")
  const [modalProfessorAberto, setModalProfessorAberto] = useState(false)
  const [demoAberto, setDemoAberto] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  useEffect(() => {
    function handlePointerMove(e: PointerEvent) {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      mouseX.set(e.clientX - rect.left)
      mouseY.set(e.clientY - rect.top)
    }
    window.addEventListener("pointermove", handlePointerMove)
    return () => window.removeEventListener("pointermove", handlePointerMove)
  }, [mouseX, mouseY])

  const alunosTurma = db.alunos
    .filter((a) => a.turma_id === turmaId)
    .sort((a, b) => a.nome.localeCompare(b.nome))

  function entrarComoAluno(id: string) {
    setAlunoId(id)
    router.push("/aluno")
  }

  if (!ready) {
    return (
      <div className="relative grid min-h-screen place-items-center overflow-hidden bg-[#0c0c0f]">
        <StaticAtmosphere />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: pageEase }}
          className="relative z-10 flex flex-col items-center gap-4"
        >
          <div className="relative grid size-16 place-items-center rounded-2xl border border-white/10 bg-white/[0.03]">
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="size-2.5 rounded-full bg-emerald-400"
            />
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
            Carregando
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#0c0c0f] text-white"
    >
      <BackgroundAtmosphere mouseX={mouseX} mouseY={mouseY} />

      {/* ---------------------------------------------------------------- */}
      {/* Header                                                          */}
      {/* ---------------------------------------------------------------- */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: pageEase }}
        className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#0c0c0f]/70 backdrop-blur-xl"
      >
        <div className="mx-auto flex w-full max-w-md items-center justify-between gap-4 px-6 py-5">
          <div className="relative flex shrink-0 items-center">
            <div className="absolute -left-3 size-14 rounded-full bg-emerald-400/[0.12] blur-2xl" />
            <Image
              src="/logo.png"
              alt="Logo"
              width={190}
              height={60}
              priority
              className="relative h-15 w-auto object-contain drop-shadow-[0_2px_16px_rgba(52,211,153,0.15)]"
            />
          </div>

          <div className="h-6 w-px shrink-0 bg-white/[0.08]" />

          <div className="min-w-0 flex-1">
            <SchoolTurmaSelector showTurma={tela === "carteirinha"} />
          </div>
        </div>
      </motion.header>

      {/* ---------------------------------------------------------------- */}
      {/* Main                                                            */}
      {/* ---------------------------------------------------------------- */}
      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-14">
        <AnimatePresence mode="wait">
          {tela === "perfil" && (
            <motion.div
              key="perfil"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.div variants={itemVariants} className="mb-12">
                
                <h1 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white">
                  Bem-vindo
                  <br />
                  de volta.
                </h1>
                <p className="mt-3 text-[15px] font-medium leading-relaxed text-zinc-400">
                  Continue sua jornada de aprendizado. Escolha um perfil para
                  entrar.
                </p>
              </motion.div>

              <div className="flex flex-col gap-3.5">
                <motion.div variants={itemVariants}>
                  <ProfileCard
                    sou="Sou"
                    titulo="Estudante"
                    descricao="Acesse sua carteirinha e seu progresso"
                    icon={<ScanLine className="size-5" />}
                    accent="emerald"
                    onClick={() => setTela("carteirinha")}
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <ProfileCard
                    sou="Sou"
                    titulo="Professor(a)"
                    descricao="Gerencie sua turma e acompanhe resultados"
                    extra="Painel da turma"
                    icon={<GraduationCap className="size-5" />}
                    accent="violet"
                    onClick={() => router.push("/professor/login")}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}

          {tela === "carteirinha" && (
            <motion.div
              key="carteirinha"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.div
                variants={itemVariants}
                className="mb-8 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5">
                  <div className="grid size-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-emerald-400">
                    <ScanLine className="size-4" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-white">
                      Toque sua carteirinha
                    </h2>
                    <p className="text-xs font-medium text-zinc-500">
                      Selecione seu perfil para entrar
                    </p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setTela("perfil")}
                  className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-xs font-semibold text-zinc-400 transition hover:border-white/[0.14] hover:text-white"
                >
                  Voltar
                </motion.button>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="grid grid-cols-2 gap-3 sm:grid-cols-3"
              >
                {alunosTurma.map((a, i) => (
                  <motion.button
                    key={a.id}
                    variants={itemVariants}
                    custom={i}
                    whileHover={{ y: -3, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.25, ease: pageEase }}
                    onClick={() => entrarComoAluno(a.id)}
                    className={cn(
                      "group relative flex flex-col items-center gap-2.5 overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5 text-center",
                      "shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] transition-colors hover:border-emerald-400/20 hover:bg-white/[0.045]",
                    )}
                  >
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <motion.span
                      whileHover={{ scale: 1.03 }}
                      className="relative grid size-14 place-items-center overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03]"
                    >
                      {a.icone_selecionado && a.icone_selecionado !== "default" ? (
                        <RewardIcon icone={a.icone_selecionado} className="size-14 rounded-2xl" />
                      ) : isImagePath(a.avatar) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.avatar} alt="" className="size-14 rounded-2xl object-cover" />
                      ) : (
                        <span className="text-3xl">{a.avatar}</span>
                      )}
                    </motion.span>

                    <span className="relative line-clamp-1 font-display text-[13px] font-bold text-zinc-100">
                      {a.nome}
                    </span>

                    <div className="relative flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500">
                      <span className="rounded-full border border-amber-400/15 bg-amber-400/[0.08] px-2 py-0.5 text-amber-300/90">
                        Nv {a.nivel}
                      </span>
                      <StreakFlame dias={a.streak_dias} className="px-2 py-0.5 text-[11px]" />
                    </div>

                    <span className="relative mt-0.5 flex items-center gap-1 text-[11px] font-bold text-emerald-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <QrCode className="size-3" /> Entrar
                    </span>
                  </motion.button>
                ))}

                {alunosTurma.length === 0 && (
                  <p className="col-span-full rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 text-center text-sm font-medium text-zinc-500">
                    Nenhum aluno nesta turma ainda. A professora precisa
                    cadastrar os alunos.
                  </p>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ---------------------------------------------------------------- */}
      {/* Simulador de demo — escondido atrás de um botão flutuante para   */}
      {/* não poluir a tela; abre um painel pequeno só quando necessário.  */}
      {/* ---------------------------------------------------------------- */}
      <DemoSimuladorFlutuante open={demoAberto} onToggle={() => setDemoAberto((v) => !v)} />
    </div>
  )
}

/* ---------------------------------------------------------------------- */
/* Simulador de demo flutuante                                            */
/* ---------------------------------------------------------------------- */

function DemoSimuladorFlutuante({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <>
      <motion.button
        onClick={onToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.94 }}
        aria-label={open ? "Fechar simulador de demo" : "Abrir simulador de demo"}
        className={cn(
          "fixed bottom-4 right-4 z-50 grid size-11 place-items-center rounded-full border backdrop-blur-xl transition-colors",
          open
            ? "border-emerald-400/30 bg-emerald-400/15 text-emerald-300"
            : "border-white/[0.08] bg-white/[0.04] text-zinc-500 opacity-70 hover:opacity-100 hover:text-white",
        )}
      >
        {open ? <X className="size-4" /> : <FlaskConical className="size-4" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2, ease: pageEase }}
            className="fixed bottom-[4.25rem] right-4 z-50 w-[min(320px,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-white/[0.08] bg-[#111114]/95 p-3 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                Simulador de demo
              </span>
              <button
                onClick={onToggle}
                aria-label="Fechar simulador de demo"
                className="grid size-6 place-items-center rounded-full text-zinc-500 transition hover:bg-white/[0.06] hover:text-white"
              >
                <X className="size-3.5" />
              </button>
            </div>
            <DemoBar />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ---------------------------------------------------------------------- */
/* Background atmosphere                                                  */
/* ---------------------------------------------------------------------- */

function StaticAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#111114] via-[#0c0c0f] to-[#0a0a0c]" />
      <motion.div
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-1/2 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/[0.07] blur-[110px]"
      />
    </div>
  )
}

function BackgroundAtmosphere({
  mouseX,
  mouseY,
}: {
  mouseX: ReturnType<typeof useMotionValue<number>>
  mouseY: ReturnType<typeof useMotionValue<number>>
}) {
  const springX = useSpring(mouseX, { damping: 30, stiffness: 60, mass: 0.6 })
  const springY = useSpring(mouseY, { damping: 30, stiffness: 60, mass: 0.6 })

  const glowX = useTransform(springX, (v) => v - 260)
  const glowY = useTransform(springY, (v) => v - 260)

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* base tone lift so it doesn't read as pure black */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#111114] via-[#0c0c0f] to-[#0a0a0c]" />

      {/* cursor-following glow */}
      <motion.div
        className="absolute size-[520px] rounded-full bg-emerald-400/[0.09] blur-[110px]"
        style={{ x: glowX, y: glowY }}
      />
      <motion.div
        className="absolute size-[300px] rounded-full bg-violet-400/[0.07] blur-[100px]"
        style={{
          x: useTransform(springX, (v) => v - 150),
          y: useTransform(springY, (v) => v - 150),
        }}
      />

      {/* ambient floating shapes, always alive even without mouse movement */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[8%] top-[-8%] size-[420px] rounded-full bg-emerald-500/[0.06] blur-[120px]"
      />
      <motion.div
        animate={{ x: [0, -24, 0], y: [0, 26, 0] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-24 top-[36%] size-[380px] rounded-full bg-violet-500/[0.055] blur-[110px]"
      />
      <motion.div
        animate={{ x: [0, 18, 0], y: [0, -16, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-24 bottom-[-10%] size-[420px] rounded-full bg-emerald-500/[0.05] blur-[130px]"
      />

      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  )
}

/* ---------------------------------------------------------------------- */
/* Profile card                                                           */
/* ---------------------------------------------------------------------- */

function ProfileCard({
  sou,
  titulo,
  descricao,
  extra,
  icon,
  accent,
  onClick,
}: {
  sou: string
  titulo: string
  descricao?: string
  extra?: string
  icon?: React.ReactNode
  accent?: "emerald" | "violet"
  onClick: () => void
}) {
  const accentText = accent === "violet" ? "text-violet-400" : "text-emerald-400"
  const accentBg = accent === "violet" ? "bg-violet-400/10" : "bg-emerald-400/10"
  const accentBorder = accent === "violet" ? "group-hover:border-violet-400/25" : "group-hover:border-emerald-400/25"

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: pageEase }}
      className={cn(
        "group relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-[26px] border border-white/[0.08] bg-white/[0.03] p-6 text-left",
        "shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset] transition-colors",
        accentBorder,
      )}
    >
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <span className="relative flex items-center gap-4">
        <span
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-2xl border border-white/[0.06]",
            accentBg,
            accentText,
          )}
        >
          {icon}
        </span>
        <span className="flex flex-col gap-0.5">
          <span className="text-[13px] font-medium text-zinc-500">{sou}</span>
          <span className="font-display text-xl font-extrabold tracking-tight text-white">
            {titulo}
          </span>
          {descricao && (
            <span className="mt-1 text-[13px] font-medium leading-snug text-zinc-500">
              {descricao}
            </span>
          )}
          {extra && (
            <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-zinc-500">
              {extra}
            </span>
          )}
        </span>
      </span>

      <motion.span
        className="relative grid size-10 shrink-0 place-items-center rounded-full border border-white/[0.08] bg-white/[0.03] text-zinc-500 transition-colors group-hover:text-white"
        whileHover={{ x: 6 }}
        transition={{ duration: 0.2, ease: pageEase }}
      >
        <ArrowRight className="size-4" />
      </motion.span>
    </motion.button>
  )
}
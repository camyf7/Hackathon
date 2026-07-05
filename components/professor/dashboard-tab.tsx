"use client"

import { motion } from "framer-motion"
import { useStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { META_TELA_DIARIA } from "@/lib/game"
import { Activity, Clock, TrendingUp, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const ease = [0.16, 1, 0.3, 1] as const

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease } },
}

export function DashboardTab({ turmaId }: { turmaId: string }) {
  const { db } = useStore()
  const alunos = db.alunos.filter((a) => a.turma_id === turmaId)
  const squads = db.squads.filter((s) => s.turma_id === turmaId)

  const xpMedio = alunos.length
    ? Math.round(alunos.reduce((s, a) => s + a.xp_total, 0) / alunos.length)
    : 0

  // frequência da semana
  const hoje = db.data_atual
  const ultimos7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoje + "T12:00:00")
    d.setDate(d.getDate() - i)
    return d.toISOString().slice(0, 10)
  })
  const presencasSemana = db.presencas.filter(
    (p) => alunos.some((a) => a.id === p.aluno_id) && ultimos7.includes(p.data),
  )
  const freq = presencasSemana.length
    ? Math.round((presencasSemana.filter((p) => p.presente).length / presencasSemana.length) * 100)
    : 0

  const telaMediaSemana = alunos.length
    ? Math.round(alunos.reduce((s, a) => s + a.tempo_tela_minutos_semana, 0) / alunos.length)
    : 0
  const telaMediaDia = Math.round(telaMediaSemana / 7)

  const maxXp = Math.max(1, ...alunos.map((a) => a.xp_total))

  const rankingXp = [...alunos].sort((a, b) => b.xp_total - a.xp_total)
  const rankingTela = [...alunos].sort(
    (a, b) => b.tempo_tela_minutos_semana - a.tempo_tela_minutos_semana,
  )

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<TrendingUp className="size-5" />}
          tone="emerald"
          label="XP médio"
          valor={`${xpMedio}`}
        />
        <StatCard
          icon={<Activity className="size-5" />}
          tone="sky"
          label="Frequência (7d)"
          valor={`${freq}%`}
        />
        <StatCard
          icon={<Users className="size-5" />}
          tone="violet"
          label="Squads ativos"
          valor={`${squads.length}`}
        />
        <StatCard
          icon={<Clock className="size-5" />}
          tone={telaMediaDia > META_TELA_DIARIA * 1.5 ? "rose" : "amber"}
          label="Tela média/dia"
          valor={`${telaMediaDia}min`}
        />
      </motion.div>

      {/* Engajamento por aluno */}
      <motion.div variants={itemVariants}>
        <Card className="p-5">
          <h3 className="mb-4 font-display text-base font-bold text-foreground">
            Engajamento por aluno
          </h3>

          {alunos.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhum aluno cadastrado nesta turma.
            </p>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {rankingXp.map((a) => (
                <motion.div key={a.id} variants={itemVariants} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 truncate text-sm font-semibold text-foreground">
                    {a.nome.split(" ")[0]}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-emerald-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(4, (a.xp_total / maxXp) * 100)}%` }}
                      transition={{ duration: 0.6, ease }}
                    />
                  </div>
                  <span className="w-14 shrink-0 text-right text-xs font-bold tabular-nums text-muted-foreground">
                    {a.xp_total} xp
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </Card>
      </motion.div>

      {/* Tempo de tela por aluno */}
      <motion.div variants={itemVariants}>
        <Card className="p-5">
          <h3 className="font-display text-base font-bold text-foreground">
            Tempo de tela — últimos 7 dias
          </h3>
          <p className="mb-4 mt-0.5 text-xs text-muted-foreground">
            Identifica baixo engajamento e uso excessivo. Não é exibido aos alunos.
          </p>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {rankingTela.map((a) => {
              const diaMedia = Math.round(a.tempo_tela_minutos_semana / 7)
              const excessivo = diaMedia > META_TELA_DIARIA * 1.5
              const baixo = diaMedia < META_TELA_DIARIA * 0.4

              return (
                <motion.div key={a.id} variants={itemVariants} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 truncate text-sm font-semibold text-foreground">
                    {a.nome.split(" ")[0]}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className={cn(
                        "h-full rounded-full",
                        excessivo ? "bg-rose-500" : baixo ? "bg-amber-500" : "bg-sky-500",
                      )}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(100, (a.tempo_tela_minutos_semana / 350) * 100)}%`,
                      }}
                      transition={{ duration: 0.6, ease }}
                    />
                  </div>
                  <span
                    className={cn(
                      "w-20 shrink-0 text-right text-xs font-bold tabular-nums",
                      excessivo
                        ? "text-rose-500"
                        : baixo
                          ? "text-amber-500"
                          : "text-muted-foreground",
                    )}
                  >
                    {diaMedia}min/dia
                  </span>
                </motion.div>
              )
            })}
          </motion.div>
        </Card>
      </motion.div>
    </motion.div>
  )
}

const TONE_STYLES = {
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  sky: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
} as const

function StatCard({
  icon,
  tone,
  label,
  valor,
}: {
  icon: React.ReactNode
  tone: keyof typeof TONE_STYLES
  label: string
  valor: string
}) {
  return (
    <Card className="flex items-center gap-3 p-4 transition-shadow hover:shadow-md">
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-2xl", TONE_STYLES[tone])}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="font-display text-xl font-bold leading-none text-foreground">{valor}</p>
        <p className="truncate text-xs font-semibold text-muted-foreground">{label}</p>
      </div>
    </Card>
  )
}
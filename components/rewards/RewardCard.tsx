"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Lock } from "lucide-react"
import { RewardIcon } from "./reward-icon"
import { ClaimButton } from "./ClaimButton"
import type { RecompensaComEstado } from "@/hooks/useRewards"

export function RewardCard({
  recompensa,
  onResgatar,
}: {
  recompensa: RecompensaComEstado
  onResgatar: (id: number) => void
}) {
  const { estado } = recompensa
  const bloqueada = estado === "bloqueada"
  const resgatada = estado === "resgatada"

  return (
    <motion.div layout transition={{ type: "spring", stiffness: 220, damping: 22 }}>
      <Card
        className={cn(
          "items-center gap-2 p-4 text-center transition-colors",
          resgatada && "ring-2 ring-primary/40",
          bloqueada && "opacity-70",
        )}
      >
        <motion.div
          key={estado}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className={cn(
            "grid size-14 place-items-center rounded-2xl",
            bloqueada ? "bg-muted text-muted-foreground" : "bg-primary/12 text-primary",
          )}
        >
          {bloqueada ? <Lock className="size-6" /> : <RewardIcon icone={recompensa.icone} />}
        </motion.div>

        <p className="font-display text-sm font-extrabold leading-tight text-foreground">
          {recompensa.nome}
        </p>
        <p className="text-xs font-semibold text-muted-foreground">
          Nível {recompensa.nivelNecessario}
        </p>

        <ClaimButton estado={estado} onResgatar={() => onResgatar(recompensa.id)} className="mt-1" />
      </Card>
    </motion.div>
  )
}

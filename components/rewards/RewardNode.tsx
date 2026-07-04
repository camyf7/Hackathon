"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Check, Lock } from "lucide-react"
import type { EstadoRecompensa } from "@/lib/rewards"

export function RewardNode({
  nivel,
  estado,
}: {
  nivel: number
  estado: EstadoRecompensa
}) {
  return (
    <motion.div
      layout
      initial={false}
      animate={{ scale: estado === "disponivel" ? 1.06 : 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full border-2 font-display text-sm font-extrabold transition-colors",
        estado === "resgatada" && "border-primary bg-primary text-primary-foreground",
        estado === "disponivel" && "border-primary bg-primary/10 text-primary",
        estado === "bloqueada" && "border-border bg-muted text-muted-foreground",
      )}
    >
      {estado === "resgatada" ? (
        <Check className="size-4" />
      ) : estado === "bloqueada" ? (
        <Lock className="size-3.5" />
      ) : (
        nivel
      )}
    </motion.div>
  )
}

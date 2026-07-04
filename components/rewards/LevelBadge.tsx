"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function LevelBadge({
  nivel,
  pulsar = false,
  className,
}: {
  nivel: number
  pulsar?: boolean
  className?: string
}) {
  return (
    <motion.span
      key={nivel}
      initial={pulsar ? { scale: 0.6, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 16 }}
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-2xl bg-primary font-display text-base font-extrabold text-primary-foreground shadow-sm",
        className,
      )}
    >
      {nivel}
    </motion.span>
  )
}

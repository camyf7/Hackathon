"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Check, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { EstadoRecompensa } from "@/lib/rewards"

interface ClaimButtonProps {
  estado: EstadoRecompensa
  onResgatar: () => void
  className?: string
}

export function ClaimButton({ estado, onResgatar, className }: ClaimButtonProps) {
  const [confirmando, setConfirmando] = useState(false)

  if (estado === "resgatada") {
    return (
      <Button size="sm" variant="secondary" disabled className={cn("w-full font-bold", className)}>
        <Check className="size-3.5" />
        Resgatado
      </Button>
    )
  }

  if (estado === "bloqueada") {
    return (
      <Button size="sm" variant="outline" disabled className={cn("w-full font-bold", className)}>
        <Lock className="size-3.5" />
        Bloqueado
      </Button>
    )
  }

  return (
    <div className={cn("relative", className)}>
      <Button
        size="sm"
        className="w-full font-bold"
        onClick={() => {
          setConfirmando(true)
          onResgatar()
          setTimeout(() => setConfirmando(false), 900)
        }}
      >
        Resgatar
      </Button>
      <AnimatePresence>
        {confirmando && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-none absolute inset-0 grid place-items-center rounded-lg bg-primary text-primary-foreground"
          >
            <Check className="size-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

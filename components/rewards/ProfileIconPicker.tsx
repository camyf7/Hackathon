"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { RewardIcon } from "./reward-icon"
import { temaDoIcone } from "@/lib/rewards"
import type { IconeId } from "@/lib/rewards"

interface IconPickerProps {
  ownedIcons: string[]
  selectedIcon: string
  onSelect: (icone: string) => void
  className?: string
}

export function ProfileIconPicker({
  ownedIcons,
  selectedIcon,
  onSelect,
  className,
}: IconPickerProps) {
  const [escolhido, setEscolhido] = useState<string>(selectedIcon)
  const [confirmado, setConfirmado] = useState(false)
  const alterado = escolhido !== selectedIcon

  return (
    <Card className={cn("p-4", className)}>
      <h3 className="mb-3 font-display text-lg font-extrabold text-foreground">Meus ícones</h3>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
        {ownedIcons.map((icone) => {
          const marcado = icone === escolhido
          const tema = temaDoIcone(icone as IconeId)
          return (
            <button
              key={icone}
              onClick={() => {
                setEscolhido(icone)
                setConfirmado(false)
              }}
              className="flex flex-col items-center gap-1.5"
            >
              <motion.span
                whileTap={{ scale: 0.92 }}
                className={cn(
                  "relative grid size-14 place-items-center rounded-2xl transition-colors ring-2 ring-offset-2 ring-offset-card",
                  marcado ? cn(tema.bg, tema.text, tema.ring) : "bg-muted text-muted-foreground ring-transparent hover:bg-muted/70",
                )}
              >
                <RewardIcon icone={icone} className="size-6" />
                {marcado && (
                  <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground ring-2 ring-card">
                    <Check className="size-3" />
                  </span>
                )}
              </motion.span>
            </button>
          )
        })}
      </div>

      <div className="relative mt-4">
        <Button
          size="sm"
          className="w-full font-bold"
          disabled={!alterado}
          onClick={() => {
            onSelect(escolhido)
            setConfirmado(true)
            setTimeout(() => setConfirmado(false), 1200)
          }}
        >
          Usar como foto de perfil
        </Button>
        <AnimatePresence>
          {confirmado && (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 grid place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground"
            >
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-4" /> Foto atualizada
              </span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </Card>
  )
}

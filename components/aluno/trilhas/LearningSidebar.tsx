"use client"

import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { LearningCard } from "./LearningCard"
import { cn } from "@/lib/utils"

export interface TrilhaSidebarItem {
  id: string
  emoji: string
  nome: string
  percentual: number
  corBarra: string
  corTextoAtivo: string
}

interface LearningSidebarProps {
  trilhas: TrilhaSidebarItem[]
  trilhaSelecionadaId: string | null
  onSelecionar: (id: string) => void
  mobileAberta: boolean
  onFecharMobile: () => void
}

/** Sidebar fixa (desktop/tablet) + drawer deslizante (mobile) com a lista de trilhas. */
export function LearningSidebar({
  trilhas,
  trilhaSelecionadaId,
  onSelecionar,
  mobileAberta,
  onFecharMobile,
}: LearningSidebarProps) {
  const conteudo = (
    <div className="flex h-full flex-col">
      <div className="px-4 pb-2 pt-1">
        <p className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-500">
          Trilhas de aprendizagem
        </p>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto px-2 pb-4">
        {trilhas.map((t) => (
          <LearningCard
            key={t.id}
            emoji={t.emoji}
            nome={t.nome}
            percentual={t.percentual}
            corBarra={t.corBarra}
            corTextoAtivo={t.corTextoAtivo}
            selecionado={t.id === trilhaSelecionadaId}
            onClick={() => onSelecionar(t.id)}
          />
        ))}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop / tablet: sidebar fixa (estica para acompanhar a altura do conteúdo principal) */}
      <aside className="hidden shrink-0 border-r border-white/5 bg-[#0B0E14] md:block md:w-[240px] lg:w-[300px]">
        <div className="py-4">{conteudo}</div>
      </aside>

      {/* Mobile: drawer */}
      <AnimatePresence>
        {mobileAberta && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onFecharMobile}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className={cn(
                "fixed inset-y-0 left-0 z-50 w-[280px] bg-[#0B0E14] shadow-2xl md:hidden",
              )}
            >
              <div className="flex items-center justify-between px-4 pt-4">
                <p className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Trilhas
                </p>
                <button
                  onClick={onFecharMobile}
                  className="grid size-8 place-items-center rounded-full bg-white/5 text-slate-400"
                  aria-label="Fechar menu de trilhas"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="h-[calc(100%-3rem)] py-2">{conteudo}</div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
"use client"

import { cn } from "@/lib/utils"
import { SUBJECT_COLOR_STYLES, type SubjectWorld } from "@/lib/learning-path/subjects"

interface SubjectTabsProps {
  subjects: (SubjectWorld & { progresso: number })[]
  activeId: string
  onSelect: (id: string) => void
}

export function SubjectTabs({ subjects, activeId, onSelect }: SubjectTabsProps) {
  return (
    <nav aria-label="Disciplinas" className="flex flex-col gap-2">
      {subjects.map((subject) => {
        const styles = SUBJECT_COLOR_STYLES[subject.cor]
        const active = subject.trilhaId === activeId
        return (
          <button
            key={subject.id}
            onClick={() => onSelect(subject.trilhaId)}
            aria-current={active ? "true" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-2xl border p-3 text-left transition-all duration-300",
              active
                ? "border-white/10 bg-white/5 shadow-lg backdrop-blur-sm"
                : "border-transparent bg-transparent hover:bg-white/5",
            )}
          >
            <span
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-xl text-lg transition-transform group-hover:scale-105",
                styles.bg,
              )}
            >
              {subject.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <p className={cn("truncate text-sm font-bold", active ? "text-white" : "text-white/70")}>
                {subject.nome}
              </p>
              <p className="text-xs text-white/40">{subject.progresso}% concluído</p>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", styles.bg)}
                  style={{ width: `${subject.progresso}%` }}
                />
              </div>
            </div>
          </button>
        )
      })}
    </nav>
  )
}

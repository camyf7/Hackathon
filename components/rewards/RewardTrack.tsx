"use client"

import { cn } from "@/lib/utils"
import { RewardNode } from "./RewardNode"
import type { RecompensaComEstado } from "@/hooks/useRewards"

export function RewardTrack({
  recompensas,
  className,
}: {
  recompensas: RecompensaComEstado[]
  className?: string
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <p className="px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Linha de progressão
      </p>
      <div className="flex items-center overflow-x-auto rounded-2xl bg-card p-4 ring-1 ring-border">
        {recompensas.map((r, i) => (
          <div key={r.id} className="flex items-center">
            <RewardNode nivel={r.nivelNecessario} estado={r.estado} />
            {i < recompensas.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-6 shrink-0 sm:w-9",
                  r.estado === "resgatada" ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

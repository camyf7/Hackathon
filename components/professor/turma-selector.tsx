"use client"

import { useStore } from "@/lib/store"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GraduationCap } from "lucide-react"

export function TurmaSelector() {
  const {
  db,
  professorId,
  escolaId,
  turmaId,
  setTurmaId,
} = useStore()

const escola = db.escolas.find((e) => e.id === escolaId)
  const turmas = db.turmas.filter((t) => t.professor_id === professorId)

  if (turmas.length === 0) {
    return (
      <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
        Nenhuma turma
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-full bg-card px-2 py-1 shadow-sm ring-1 ring-border">
      <GraduationCap className="ml-1 size-4 shrink-0 text-muted-foreground" />
      <Select value={turmaId} onValueChange={(v) => v && setTurmaId(v)}>
        <SelectTrigger className="h-8 min-w-[120px] border-0 bg-transparent font-bold shadow-none focus-visible:ring-0">
          <SelectValue placeholder="Turma" />
        </SelectTrigger>
        <SelectContent>
          {turmas.map((t) => (
            <SelectItem key={t.id} value={t.id} className="font-semibold">
              {t.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

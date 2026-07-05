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
      <span className="shrink-0 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
        Nenhuma turma
      </span>
    )
  }

  return (
    <div className="flex min-w-0 max-w-[168px] items-center gap-1.5 rounded-full bg-card py-1 pl-2.5 pr-1 shadow-sm ring-1 ring-border sm:max-w-[220px]">
      <GraduationCap className="size-4 shrink-0 text-muted-foreground" />
      <Select value={turmaId} onValueChange={(v) => v && setTurmaId(v)}>
        <SelectTrigger
          aria-label="Selecionar turma"
          className="h-9 min-w-0 flex-1 border-0 bg-transparent px-1 font-bold shadow-none focus-visible:ring-0 [&>span]:truncate"
        >
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
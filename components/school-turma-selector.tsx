"use client"

import { useStore } from "@/lib/store"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GraduationCap, School } from "lucide-react"

export function SchoolTurmaSelector({ showTurma = true }: { showTurma?: boolean }) {
  const { db, escolaId, turmaId, setEscolaId, setTurmaId } = useStore()
  const turmas = db.turmas.filter((t) => t.escola_id === escolaId)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2 rounded-full bg-card px-2 py-1 shadow-sm ring-1 ring-border">
        <School className="ml-1 size-4 shrink-0 text-brand-turquoise" />
        <Select value={escolaId} onValueChange={setEscolaId}>
          <SelectTrigger className="h-8 min-w-[180px] border-0 bg-transparent font-bold shadow-none focus-visible:ring-0">
            <SelectValue placeholder="Escola" />
          </SelectTrigger>
          <SelectContent>
            <div className="px-2 py-1 text-xs font-bold text-muted-foreground">Caraguatatuba · SEDUC</div>
            {db.escolas.map((e) => (
              <SelectItem key={e.id} value={e.id} className="font-semibold">
                {e.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showTurma && (
        <div className="flex items-center gap-2 rounded-full bg-card px-2 py-1 shadow-sm ring-1 ring-border">
          <GraduationCap className="ml-1 size-4 shrink-0 text-brand-purple" />
          <Select value={turmaId} onValueChange={setTurmaId}>
            <SelectTrigger className="h-8 min-w-[110px] border-0 bg-transparent font-bold shadow-none focus-visible:ring-0">
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
      )}
    </div>
  )
}

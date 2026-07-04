"use client"

import { useMemo, useState } from "react"
import { useStore } from "@/lib/store"
import { escolas, type Escola } from "@/lib/data/escolas"
import { turmasPorEscola, type Turma } from "@/lib/data/turmas"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Building2,
  ChevronDown,
  Check,
  Users,
  MapPin,
} from "lucide-react"

interface SchoolTurmaSelectorProps {
  showTurma?: boolean
  className?: string
}

/**
 * Seletor institucional de Escola / Turma.
 *
 * Substitui o antigo par de <Select> por dois combobox com busca,
 * agrupados visualmente como um único filtro de navbar — no padrão
 * usado por painéis de secretarias de educação (GOV.BR, Google
 * Workspace Admin, Microsoft 365 Admin Center).
 */
export function SchoolTurmaSelector({
  showTurma = true,
  className,
}: SchoolTurmaSelectorProps) {
  const { escolaId, turmaId, setEscolaId, setTurmaId } = useStore()

  const escolaSelecionada = useMemo(
    () => escolas.find((e) => e.id === escolaId),
    [escolaId]
  )

  const turmas = useMemo<Turma[]>(
    () => (escolaId ? turmasPorEscola[escolaId] ?? [] : []),
    [escolaId]
  )

  const turmaSelecionada = useMemo(
    () => turmas.find((t) => t.id === turmaId),
    [turmas, turmaId]
  )

  function handleSelecionarEscola(novaEscola: Escola) {
    setEscolaId(novaEscola.id)
    const novasTurmas = turmasPorEscola[novaEscola.id] ?? []
    setTurmaId(novasTurmas[0]?.id ?? "")
  }

  return (
    <div
      className={cn(
        "flex w-full flex-wrap items-center gap-2",
        className
      )}
    >
      <EscolaCombobox
        escolas={escolas}
        selecionada={escolaSelecionada}
        onSelecionar={handleSelecionarEscola}
      />

      {showTurma && (
        <TurmaCombobox
          turmas={turmas}
          selecionada={turmaSelecionada}
          disabled={!escolaSelecionada}
          onSelecionar={(turma) => setTurmaId(turma.id)}
        />
      )}
    </div>
  )
}

/* --------------------------------------------------------------------- */
/*  Escola combobox                                                       */
/* --------------------------------------------------------------------- */

function EscolaCombobox({
  escolas: lista,
  selecionada,
  onSelecionar,
}: {
  escolas: Escola[]
  selecionada?: Escola
  onSelecionar: (escola: Escola) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "group flex h-11 min-w-[210px] flex-1 items-center gap-2.5 rounded-[14px] border border-border/70 bg-card px-3",
            "shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-200 ease-out",
            "hover:border-border hover:shadow-[0_2px_6px_rgba(16,24,40,0.06)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-1"
          )}
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-[10px] bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
            <Building2 className="size-4" strokeWidth={2} />
          </span>

          <span className="flex min-w-0 flex-1 flex-col items-start leading-tight">
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Escola
            </span>
            <span className="w-full truncate text-left text-[13px] font-semibold text-foreground">
              {selecionada ? selecionada.nome : "Selecionar escola"}
            </span>
          </span>

          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-[--radix-popover-trigger-width] min-w-[320px] overflow-hidden rounded-[16px] border-border/70 p-0 shadow-lg"
      >
        <Command
          filter={(value, search) =>
            value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }
        >
          <div className="border-b border-border/70 px-1">
            <CommandInput placeholder="Buscar escola..." className="h-11 text-sm" />
          </div>

          <CommandList className="max-h-[320px]">
            <CommandEmpty className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma escola encontrada.
            </CommandEmpty>

            <CommandGroup
              heading="Rede Municipal · SEDUC Caraguatatuba"
              className="px-1.5 py-1.5 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground"
            >
              {lista.map((escola) => {
                const ativa = escola.id === selecionada?.id
                return (
                  <CommandItem
                    key={escola.id}
                    value={`${escola.nome} ${escola.bairro}`}
                    onSelect={() => {
                      onSelecionar(escola)
                      setOpen(false)
                    }}
                    className={cn(
                      "flex items-center gap-2.5 rounded-[10px] px-2.5 py-2.5 text-sm transition-colors",
                      "data-[selected=true]:bg-accent"
                    )}
                  >
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-medium text-foreground">
                        {escola.nome}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3" />
                        {escola.bairro}
                      </span>
                    </span>
                    <Check
                      className={cn(
                        "size-4 shrink-0 text-primary transition-opacity",
                        ativa ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

/* --------------------------------------------------------------------- */
/*  Turma combobox                                                       */
/* --------------------------------------------------------------------- */

function TurmaCombobox({
  turmas,
  selecionada,
  disabled,
  onSelecionar,
}: {
  turmas: Turma[]
  selecionada?: Turma
  disabled?: boolean
  onSelecionar: (turma: Turma) => void
}) {
  const [open, setOpen] = useState(false)

  const grupos = useMemo(() => {
    const rotulo: Record<Turma["segmento"], string> = {
      infantil: "Educação Infantil",
      fundamental: "Ensino Fundamental",
      eja: "EJA",
    }
    const ordem: Turma["segmento"][] = ["infantil", "fundamental", "eja"]
    return ordem
      .map((segmento) => ({
        segmento,
        rotulo: rotulo[segmento],
        itens: turmas.filter((t) => t.segmento === segmento),
      }))
      .filter((grupo) => grupo.itens.length > 0)
  }, [turmas])

  return (
    <Popover open={open} onOpenChange={(v) => !disabled && setOpen(v)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "group flex h-11 min-w-[150px] flex-1 items-center gap-2.5 rounded-[14px] border border-border/70 bg-card px-3",
            "shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-200 ease-out",
            "hover:border-border hover:shadow-[0_2px_6px_rgba(16,24,40,0.06)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-1",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
          )}
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-[10px] bg-violet-500/10 text-violet-600 transition-colors group-hover:bg-violet-500/15 dark:text-violet-400">
            <Users className="size-4" strokeWidth={2} />
          </span>

          <span className="flex min-w-0 flex-1 flex-col items-start leading-tight">
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Turma
            </span>
            <span className="w-full truncate text-left text-[13px] font-semibold text-foreground">
              {selecionada ? selecionada.nome : "Selecionar turma"}
            </span>
          </span>

          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-[--radix-popover-trigger-width] min-w-[220px] overflow-hidden rounded-[16px] border-border/70 p-0 shadow-lg"
      >
        <Command>
          <div className="border-b border-border/70 px-1">
            <CommandInput placeholder="Buscar turma..." className="h-11 text-sm" />
          </div>

          <CommandList className="max-h-[300px]">
            <CommandEmpty className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma turma encontrada.
            </CommandEmpty>

            {grupos.map((grupo) => (
              <CommandGroup
                key={grupo.segmento}
                heading={grupo.rotulo}
                className="px-1.5 py-1.5 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground"
              >
                {grupo.itens.map((turma) => {
                  const ativa = turma.id === selecionada?.id
                  return (
                    <CommandItem
                      key={turma.id}
                      value={turma.nome}
                      onSelect={() => {
                        onSelecionar(turma)
                        setOpen(false)
                      }}
                      className="flex items-center justify-between gap-2 rounded-[10px] px-2.5 py-2 text-sm font-medium data-[selected=true]:bg-accent"
                    >
                      {turma.nome}
                      <Check
                        className={cn(
                          "size-4 shrink-0 text-primary transition-opacity",
                          ativa ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
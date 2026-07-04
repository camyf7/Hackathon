"use client"

import { useState, type FormEvent } from "react"
import { useStore } from "@/lib/store"
import { formatarDataCurta } from "@/lib/game"
import { cn } from "@/lib/utils"
import { CalendarClock, CheckCircle2, ClipboardList, Plus, Trash2, XCircle } from "lucide-react"

export function AtividadesTab({ turmaId }: { turmaId: string }) {
  const { db, criarAtividade, encerrarAtividade, removerAtividade } = useStore()

  const trilhas = db.trilhas
  const alunosTurma = db.alunos.filter((a) => a.turma_id === turmaId)
  const atividades = db.atividades
    .filter((a) => a.turma_id === turmaId)
    .sort((a, b) => (a.criada_em < b.criada_em ? 1 : -1))

  const [trilhaId, setTrilhaId] = useState(trilhas[0]?.id ?? "")
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [nivelAlvo, setNivelAlvo] = useState(1)
  const [prazo, setPrazo] = useState("")
  const [xpBonus, setXpBonus] = useState(50)

  const trilhaAtual = trilhas.find((t) => t.id === trilhaId)

  function lancar(e: FormEvent) {
    e.preventDefault()
    if (!titulo.trim() || !trilhaId) return
    criarAtividade(turmaId, trilhaId, titulo.trim(), descricao.trim(), nivelAlvo, prazo || null, xpBonus)
    setTitulo("")
    setDescricao("")
    setPrazo("")
    setXpBonus(50)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <ClipboardList className="size-5 text-muted-foreground" />
          <h2 className="font-display text-lg font-bold text-foreground">Lançar nova atividade</h2>
        </div>

        <form onSubmit={lancar} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Título</label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Revisão de frações"
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Trilha</label>
            <select
              value={trilhaId}
              onChange={(e) => setTrilhaId(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium outline-none focus:border-primary"
            >
              {trilhas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Nível alvo</label>
            <select
              value={nivelAlvo}
              onChange={(e) => setNivelAlvo(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium outline-none focus:border-primary"
            >
              {Array.from({ length: trilhaAtual?.niveis ?? 5 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  Nível {n}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Descrição</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Instruções para os alunos"
              rows={2}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Prazo (opcional)</label>
            <input
              type="date"
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">XP bônus</label>
            <input
              type="number"
              min={0}
              step={5}
              value={xpBonus}
              onChange={(e) => setXpBonus(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium outline-none focus:border-primary"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90"
            >
              <Plus className="size-4" />
              Lançar atividade
            </button>
          </div>
        </form>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-bold text-muted-foreground">
          Atividades da turma ({atividades.length})
        </h3>

        {atividades.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm font-medium text-muted-foreground">
            Nenhuma atividade lançada ainda para esta turma.
          </p>
        ) : (
          <div className="space-y-3">
            {atividades.map((at) => {
              const trilha = trilhas.find((t) => t.id === at.trilha_id)
              const total = alunosTurma.length
              const concluidos = at.alunos_concluidos.length
              const pct = total > 0 ? Math.round((concluidos / total) * 100) : 0
              const encerrada = at.status === "encerrada"

              return (
                <div key={at.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-bold text-foreground">{at.titulo}</h4>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-bold",
                            encerrada ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary",
                          )}
                        >
                          {encerrada ? "Encerrada" : "Aberta"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {trilha?.nome} · Nível {at.nivel_alvo} · Bônus de {at.xp_bonus} XP
                      </p>
                      {at.descricao && <p className="mt-1 text-sm text-foreground/80">{at.descricao}</p>}
                      {at.prazo && (
                        <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                          <CalendarClock className="size-3.5" />
                          Prazo: {formatarDataCurta(at.prazo)}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      {!encerrada && (
                        <button
                          onClick={() => encerrarAtividade(at.id)}
                          aria-label="Encerrar atividade"
                          className="grid size-8 place-items-center rounded-full text-muted-foreground transition hover:bg-muted"
                        >
                          <XCircle className="size-4" />
                        </button>
                      )}
                      <button
                        onClick={() => removerAtividade(at.id)}
                        aria-label="Remover atividade"
                        className="grid size-8 place-items-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="size-3.5" />
                        {concluidos} de {total} alunos concluíram
                      </span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
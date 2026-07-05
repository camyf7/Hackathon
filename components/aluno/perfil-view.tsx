"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Aluno } from "@/lib/types"
import { useStore } from "@/lib/store"
import { BannerPerfil, XpBar, XpShieldIcon } from "@/components/brand"
import { BADGES, META_TELA_DIARIA } from "@/lib/game"
import { cn } from "@/lib/utils"
import { Clock, Flame, Pencil, Trophy } from "lucide-react"
import { useRewards } from "@/hooks/useRewards"
import { ProfileIconPicker } from "@/components/rewards/ProfileIconPicker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"

/** Milissegundos restantes até a próxima meia-noite (horário do dispositivo). */
function msAteProximaMeiaNoite(): number {
  const agora = new Date()
  const proxima = new Date(agora)
  proxima.setHours(24, 0, 0, 0)
  return proxima.getTime() - agora.getTime()
}

/** Formata ms restantes como "Xh Ymin" (ou "Ymin" se menos de 1h). */
function formatarContagem(ms: number): string {
  const totalMin = Math.max(0, Math.ceil(ms / 60000))
  const h = Math.floor(totalMin / 60)
  const min = totalMin % 60
  if (h <= 0) return `${min}min`
  return `${h}h ${min}min`
}

// Avatares disponíveis para o aluno escolher ao editar o perfil (usados apenas
// como fallback enquanto nenhum ícone da Trilha de Recompensas é escolhido)
const AVATARES_DISPONIVEIS = [
  "🦊", "🐼", "🦁", "🐨", "🐸", "🦉", "🐙", "🦄",
  "🐵", "🐯", "🐧", "🦖", "🐢", "🐝", "🦋",
]

export function PerfilView({ aluno }: { aluno: Aluno }) {
  const { db, atualizarAluno } = useStore()
  const router = useRouter()
  const { ownedIcons, selectedIcon, escolherIcone } = useRewards(aluno.id)
  const banner = db.banners.find((b) => b.id === aluno.banner_equipado)
  const turma = db.turmas.find((t) => t.id === aluno.turma_id)

  const minHoje = aluno.tempo_tela_minutos_hoje
  const atingiuMeta = minHoje >= META_TELA_DIARIA
  const excedeu = minHoje >= META_TELA_DIARIA * 2

  // Contagem regressiva até o próximo reset diário (meia-noite)
  const [restante, setRestante] = useState(() => msAteProximaMeiaNoite())
  useEffect(() => {
    const id = setInterval(() => setRestante(msAteProximaMeiaNoite()), 30_000)
    return () => clearInterval(id)
  }, [])

  // Notifica (toast) uma única vez por dia quando a meta diária é batida
  useEffect(() => {
    if (!atingiuMeta) return
    const chave = `limite-diario-notificado-${aluno.id}-${db.data_atual}`
    if (typeof window === "undefined" || localStorage.getItem(chave)) return
    localStorage.setItem(chave, "1")
    toast.success("Limite diário atingido! 🎉", {
      description: `Suas tarefas de hoje foram concluídas. Próximas tarefas em ${formatarContagem(msAteProximaMeiaNoite())}.`,
      icon: "⏳",
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atingiuMeta, aluno.id, db.data_atual])

  // ---------- Edição de perfil ----------
  const [editando, setEditando] = useState(false)
  const [nomeEdit, setNomeEdit] = useState(aluno.nome)
  const [avatarEdit, setAvatarEdit] = useState(aluno.avatar)

  function abrirEdicao() {
    setNomeEdit(aluno.nome)
    setAvatarEdit(aluno.avatar)
    setEditando(true)
  }

  function salvarEdicao() {
    const nomeLimpo = nomeEdit.trim()
    if (!nomeLimpo) {
      toast.error("O nome não pode ficar vazio.")
      return
    }
    atualizarAluno(aluno.id, nomeLimpo, avatarEdit)
    toast.success("Perfil atualizado!")
    setEditando(false)
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="relative">
        <BannerPerfil banner={banner} avatar={aluno.avatar} icone={selectedIcon} nome={aluno.nome}>
          <div className="mt-3 flex items-center gap-2">
            <span className="rounded-full bg-white/85 px-3 py-1 font-display text-sm font-extrabold text-slate-800">
              Nível {aluno.nivel}
            </span>
            <span className="rounded-full bg-white/85 px-3 py-1 text-sm font-bold text-slate-800">
              {turma?.nome}
            </span>
          </div>
        </BannerPerfil>
        <button
          onClick={abrirEdicao}
          aria-label="Editar perfil"
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/85 text-slate-800 shadow-md transition hover:bg-white"
        >
          <Pencil className="size-4" />
        </button>
      </div>

      <div className="rounded-3xl bg-card p-4 shadow-sm ring-1 ring-border">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-display font-extrabold">Progresso do nível</span>
          <span className="font-display font-extrabold text-primary">{aluno.xp_total} XP</span>
        </div>
        <XpBar xp={aluno.xp_total} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col items-center gap-1 rounded-3xl bg-brand-orange/10 p-4 text-center ring-1 ring-brand-orange/20">
          <Flame className="size-7 fill-brand-orange text-brand-orange" />
          <span className="font-display text-2xl font-extrabold text-brand-orange">{aluno.streak_dias}</span>
          <span className="text-xs font-bold text-muted-foreground">dias de streak</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-3xl bg-brand-gold/10 p-4 text-center ring-1 ring-brand-gold/20">
          <Trophy className="size-7 text-amber-500" />
          <span className="font-display text-2xl font-extrabold text-amber-600">{aluno.badges.length}</span>
          <span className="text-xs font-bold text-muted-foreground">medalhas</span>
        </div>
      </div>

      {/* Bem-estar digital / tempo de tela */}
      <div
        className={cn(
          "rounded-3xl p-4 ring-1",
          excedeu ? "bg-brand-purple/10 ring-brand-purple/20" : "bg-brand-turquoise/10 ring-brand-turquoise/20",
        )}
      >
        <div className="flex items-center gap-2">
          <Clock className={cn("size-5", excedeu ? "text-brand-purple" : "text-cyan-700")} />
          <span className="font-display font-extrabold">Tempo de estudo hoje</span>
        </div>
        <p className="mt-1 font-display text-2xl font-extrabold">
          {minHoje} min <span className="text-sm font-bold text-muted-foreground">de {META_TELA_DIARIA} min</span>
        </p>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-all", excedeu ? "bg-brand-purple" : "bg-brand-turquoise")}
            style={{ width: `${Math.min(100, (minHoje / META_TELA_DIARIA) * 100)}%` }}
          />
        </div>

        {atingiuMeta ? (
          <div className="mt-3 flex items-start gap-2 rounded-2xl bg-background/60 p-3 ring-1 ring-border">
            <span className="text-lg">🎉</span>
            <p className="text-sm font-semibold text-foreground">
              Suas tarefas de hoje foram concluídas!{" "}
              <span className="font-extrabold text-primary">
                Próximas tarefas em {formatarContagem(restante)}.
              </span>
            </p>
          </div>
        ) : (
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            Cada minutinho conta. Bora completar um exercício?
          </p>
        )}
      </div>

      {/* Trilha de Recompensas: ícones desbloqueados por nível */}
      <div className="rounded-3xl bg-card p-4 shadow-sm ring-1 ring-border">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-display font-extrabold">Trilha de Recompensas</span>
          <Button
            size="sm"
            variant="ghost"
            className="gap-1 font-bold text-primary"
            onClick={() => router.push("/aluno/trilha-recompensas")}
          >
           <XpShieldIcon className="size-3.5" />
            Ver trilha
          </Button>
        </div>
        <ProfileIconPicker
          ownedIcons={ownedIcons}
          selectedIcon={selectedIcon}
          onSelect={escolherIcone}
        />
      </div>

      {/* Medalhas */}
      <div className="rounded-3xl bg-card p-4 shadow-sm ring-1 ring-border">
        <h3 className="mb-3 font-display text-lg font-extrabold">Minhas medalhas</h3>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {Object.entries(BADGES).map(([id, badge]) => {
            const conquistada = aluno.badges.includes(id)
            return (
              <div
                key={id}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl p-3 text-center transition",
                  conquistada ? "bg-brand-gold/15 ring-1 ring-brand-gold/30" : "bg-muted opacity-50 grayscale",
                )}
                title={badge.desc}
              >
                <span className={cn("text-3xl", conquistada && "animate-pop-in")}>{badge.emoji}</span>
                <span className="text-xs font-bold leading-tight">{badge.nome}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Diálogo de edição de perfil */}
      <Dialog open={editando} onOpenChange={setEditando}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display font-extrabold">Editar perfil</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Nome</label>
              <Input
                value={nomeEdit}
                onChange={(e) => setNomeEdit(e.target.value)}
                maxLength={40}
                placeholder="Seu nome"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">
                Avatar (usado se você ainda não tiver ícones da Trilha de Recompensas)
              </label>
              <div className="grid grid-cols-5 gap-2">
                {AVATARES_DISPONIVEIS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setAvatarEdit(av)}
                    aria-label={`Escolher avatar ${av}`}
                    className={cn(
                      "grid aspect-square place-items-center rounded-2xl text-2xl transition",
                      avatarEdit === av
                        ? "bg-primary/15 ring-2 ring-primary"
                        : "bg-muted hover:bg-muted/70",
                    )}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setEditando(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarEdicao} className="font-bold">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
"use client"

import { useEffect, useState } from "react"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Sparkles } from "lucide-react"
import { toast } from "sonner"

const XP_POR_PAR = 8
const XP_BONUS_VITORIA = 20

type Carta = { uid: string; parId: string; conteudo: string; tipo: "termo" | "emoji" }

// Pares termo <-> símbolo de Ciências. O aluno vira duas cartas por vez
// e tenta encontrar os pares correspondentes.
const PARES: { termo: string; emoji: string }[] = [
  { termo: "Sol", emoji: "☀️" },
  { termo: "Planta", emoji: "🌱" },
  { termo: "Coração", emoji: "🫀" },
  { termo: "Água", emoji: "💧" },
  { termo: "Pulmão", emoji: "🫁" },
  { termo: "Cérebro", emoji: "🧠" },
]

function embaralhar<T>(lista: T[]): T[] {
  return [...lista].sort(() => Math.random() - 0.5)
}

function gerarCartas(): Carta[] {
  const cartas: Carta[] = []
  PARES.forEach((p, i) => {
    cartas.push({ uid: `t${i}-${Math.random().toString(36).slice(2, 6)}`, parId: `par${i}`, conteudo: p.termo, tipo: "termo" })
    cartas.push({ uid: `e${i}-${Math.random().toString(36).slice(2, 6)}`, parId: `par${i}`, conteudo: p.emoji, tipo: "emoji" })
  })
  return embaralhar(cartas)
}

export function JogoMemoria({ alunoId, bloqueado }: { alunoId: string; bloqueado?: boolean }) {
  const { ganharXpExtra } = useStore()
  const [cartas, setCartas] = useState<Carta[]>(() => gerarCartas())
  const [viradas, setViradas] = useState<string[]>([])
  const [encontrados, setEncontrados] = useState<Set<string>>(new Set())
  const [tentativas, setTentativas] = useState(0)
  const [travado, setTravado] = useState(false)

  const venceu = encontrados.size === PARES.length

  useEffect(() => {
    if (!venceu) return
    ganharXpExtra(alunoId, XP_BONUS_VITORIA)
    toast.success(`Você encontrou todos os pares! +${XP_BONUS_VITORIA} XP bônus 🎉`, { icon: "🏆" })
    // dispara só quando o jogo é vencido
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venceu])

  function reiniciar() {
    setCartas(gerarCartas())
    setViradas([])
    setEncontrados(new Set())
    setTentativas(0)
    setTravado(false)
  }

  function virar(uid: string) {
    if (bloqueado || travado) return
    if (viradas.includes(uid) || viradas.length === 2) return
    const carta = cartas.find((c) => c.uid === uid)
    if (!carta || encontrados.has(carta.parId)) return

    const novasViradas = [...viradas, uid]
    setViradas(novasViradas)

    if (novasViradas.length === 2) {
      setTravado(true)
      setTentativas((t) => t + 1)
      const c1 = cartas.find((c) => c.uid === novasViradas[0])!
      const c2 = cartas.find((c) => c.uid === novasViradas[1])!

      if (c1.parId === c2.parId) {
        setTimeout(() => {
          setEncontrados((prev) => new Set(prev).add(c1.parId))
          ganharXpExtra(alunoId, XP_POR_PAR)
          toast.success(`Par encontrado! +${XP_POR_PAR} XP 🔍`, { icon: "✅" })
          setViradas([])
          setTravado(false)
        }, 500)
      } else {
        setTimeout(() => {
          setViradas([])
          setTravado(false)
        }, 900)
      }
    }
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-teal-500/15 text-teal-600">
          1
        </span>
        <div>
          <h3 className="font-display text-base font-extrabold">Jogo da memória de Ciências</h3>
          <p className="text-xs font-semibold text-muted-foreground">
            Encontre os pares de termo e símbolo. Tentativas: {tentativas}
          </p>
        </div>
      </div>

      {bloqueado ? (
        <p className="rounded-2xl bg-muted/60 p-3 text-center text-sm font-semibold text-muted-foreground">
          Disponível de novo depois do limite diário de tempo de tela.
        </p>
      ) : venceu ? (
        <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
          <Sparkles className="size-8 text-teal-500" />
          <p className="font-display text-lg font-extrabold text-teal-500">
            Você encontrou todos os pares em {tentativas} tentativas!   
          </p>
          <button
            onClick={reiniciar}
            className="rounded-2xl bg-teal-500 px-4 py-2 text-sm font-extrabold text-white shadow-[0_4px_0_0_rgba(0,0,0,0.15)] transition active:translate-y-0.5 active:shadow-none"
          >
            Jogar de novo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {cartas.map((carta) => {
            const aberta = viradas.includes(carta.uid) || encontrados.has(carta.parId)
            const combinada = encontrados.has(carta.parId)
            return (
              <button
                key={carta.uid}
                onClick={() => virar(carta.uid)}
                disabled={aberta}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-2xl border-2 p-1 text-center text-sm font-extrabold transition active:scale-95 sm:text-xl",
                  combinada && "border-emerald-500 bg-emerald-500/10 text-emerald-500",
                  aberta && !combinada && "border-teal-500 bg-teal-500/10",
                  !aberta && "border-border bg-muted hover:bg-muted/70",
                )}
              >
                {aberta ? carta.conteudo : "❓"}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
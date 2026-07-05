"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Check, Heart, Landmark, X } from "lucide-react"
import { toast } from "sonner"

const TOTAL_RODADAS = 5
const VIDAS_INICIAIS = 3
const XP_POR_ACERTO = 5
const XP_BONUS_VITORIA = 20

type Afirmacao = { texto: string; correta: boolean }

const BANCO_DE_AFIRMACOES: Afirmacao[] = [
  { texto: "O Brasil foi 'descoberto' pelos portugueses em 1500.", correta: true },
  { texto: "D. Pedro I proclamou a Independência do Brasil.", correta: true },
  { texto: "A Lei Áurea aboliu a escravidão em 1822.", correta: false },
  { texto: "Tiradentes participou da Inconfidência Mineira.", correta: true },
  { texto: "Brasília é a capital do Brasil desde 1960.", correta: true },
  { texto: "O Brasil já foi uma colônia da Espanha.", correta: false },
  { texto: "A Proclamação da República aconteceu em 1889.", correta: true },
  { texto: "Getúlio Vargas foi o primeiro presidente do Brasil.", correta: false },
]

function sortear<T>(lista: T[], n: number): T[] {
  return [...lista].sort(() => Math.random() - 0.5).slice(0, n)
}

export function JogoVerdadeiroFalso({ alunoId, bloqueado }: { alunoId: string; bloqueado?: boolean }) {
  const { ganharXpExtra } = useStore()
  const [rodadas, setRodadas] = useState<Afirmacao[]>(() => sortear(BANCO_DE_AFIRMACOES, TOTAL_RODADAS))
  const [indice, setIndice] = useState(0)
  const [vidas, setVidas] = useState(VIDAS_INICIAIS)
  const [escolha, setEscolha] = useState<boolean | null>(null)
  const [feedback, setFeedback] = useState<"certo" | "errado" | null>(null)
  const [status, setStatus] = useState<"jogando" | "venceu" | "perdeu">("jogando")

  const afirmacao = rodadas[indice]

  function reiniciar() {
    setRodadas(sortear(BANCO_DE_AFIRMACOES, TOTAL_RODADAS))
    setIndice(0)
    setVidas(VIDAS_INICIAIS)
    setEscolha(null)
    setFeedback(null)
    setStatus("jogando")
  }

  function responder(resposta: boolean) {
    if (bloqueado || feedback || status !== "jogando") return
    setEscolha(resposta)
    const acertou = resposta === afirmacao.correta

    if (acertou) {
      setFeedback("certo")
      ganharXpExtra(alunoId, XP_POR_ACERTO)
      toast.success(`+${XP_POR_ACERTO} XP! Resposta certa 🏛️`, { icon: "✅" })
    } else {
      setFeedback("errado")
      toast.error("Resposta errada! Perdeu uma vida.", { icon: "💔" })
    }

    setTimeout(() => {
      const vidasRestantes = acertou ? vidas : vidas - 1
      if (!acertou) setVidas(vidasRestantes)

      const proximo = indice + 1
      if (!acertou && vidasRestantes <= 0) {
        setStatus("perdeu")
      } else if (proximo >= TOTAL_RODADAS) {
        setStatus("venceu")
        ganharXpExtra(alunoId, XP_BONUS_VITORIA)
        toast.success(`Você terminou o desafio de História! +${XP_BONUS_VITORIA} XP bônus 🎉`, { icon: "🏆" })
      } else {
        setIndice(proximo)
      }
      setEscolha(null)
      setFeedback(null)
    }, 700)
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-orange-500/15 text-orange-600">
            <Landmark className="size-5" />
          </span>
          <div>
            <h3 className="font-display text-base font-extrabold">Verdadeiro ou Falso: História</h3>
            <p className="text-xs font-semibold text-muted-foreground">
              Responda {TOTAL_RODADAS} afirmações sem perder todas as vidas.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {Array.from({ length: VIDAS_INICIAIS }).map((_, i) => (
            <Heart
              key={i}
              className={cn("size-4", i < vidas ? "fill-red-500 text-red-500" : "fill-muted text-muted")}
            />
          ))}
        </div>
      </div>

      {bloqueado ? (
        <p className="rounded-2xl bg-muted/60 p-3 text-center text-sm font-semibold text-muted-foreground">
          Disponível de novo depois do limite diário de tempo de tela.
        </p>
      ) : status === "venceu" ? (
        <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
          <p className="font-display text-lg font-extrabold text-orange-500">
            Você acertou o desafio de História! 
          </p>
          <button
            onClick={reiniciar}
            className="rounded-2xl bg-orange-500 px-4 py-2 text-sm font-extrabold text-white shadow-[0_4px_0_0_rgba(0,0,0,0.15)] transition active:translate-y-0.5 active:shadow-none"
          >
            Jogar de novo
          </button>
        </div>
      ) : status === "perdeu" ? (
        <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
          <p className="font-display text-lg font-extrabold text-destructive">
            Você perdeu todas as vidas. Tente de novo!
          </p>
          <button
            onClick={reiniciar}
            className="rounded-2xl bg-orange-500 px-4 py-2 text-sm font-extrabold text-white shadow-[0_4px_0_0_rgba(0,0,0,0.15)] transition active:translate-y-0.5 active:shadow-none"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-3 flex items-center justify-center gap-1.5">
            {rodadas.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-2 w-8 rounded-full transition-colors",
                  i < indice ? "bg-orange-500" : i === indice ? "bg-orange-300" : "bg-muted",
                )}
              />
            ))}
          </div>

          <p className="mb-4 text-center font-display text-lg font-extrabold">{afirmacao.texto}</p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => responder(true)}
              disabled={!!feedback}
              className={cn(
                "rounded-2xl border-2 py-2.5 text-base font-extrabold transition active:scale-95",
                feedback && afirmacao.correta && "border-emerald-500 bg-emerald-500/10 text-emerald-500",
                feedback === "errado" && escolha === true && "border-destructive bg-destructive/10 text-destructive",
                !feedback && "border-border bg-background hover:bg-muted",
              )}
            >
              Verdadeiro
            </button>
            <button
              onClick={() => responder(false)}
              disabled={!!feedback}
              className={cn(
                "rounded-2xl border-2 py-2.5 text-base font-extrabold transition active:scale-95",
                feedback && !afirmacao.correta && "border-emerald-500 bg-emerald-500/10 text-emerald-500",
                feedback === "errado" && escolha === false && "border-destructive bg-destructive/10 text-destructive",
                !feedback && "border-border bg-background hover:bg-muted",
              )}
            >
              Falso
            </button>
          </div>

          {feedback === "certo" && (
            <p className="mt-2 flex items-center justify-center gap-1 text-sm font-bold text-emerald-500">
              <Check className="size-4" /> Isso aí! Próxima afirmação...
            </p>
          )}
          {feedback === "errado" && (
            <p className="mt-2 flex items-center justify-center gap-1 text-sm font-bold text-destructive">
              <X className="size-4" /> Quase! Você perdeu uma vida.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
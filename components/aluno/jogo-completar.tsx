"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Check, X, BookOpen } from "lucide-react"
import { toast } from "sonner"

const TOTAL_RODADAS = 5
const XP_POR_ACERTO = 5
const XP_BONUS_VITORIA = 20

type Frase = { texto: string; resposta: string; opcoes: string[] }

// Banco de frases com lacuna. A palavra correta e as opções erradas
// aparecem embaralhadas como botões — o aluno completa a frase.
const BANCO_DE_FRASES: Frase[] = [
  { texto: "O ___ está latindo no quintal.", resposta: "cachorro", opcoes: ["cachorro", "gato", "peixe", "passarinho"] },
  { texto: "Ela foi à ___ comprar pão.", resposta: "padaria", opcoes: ["padaria", "escola", "praia", "floresta"] },
  { texto: "Nós ___ para a escola todos os dias.", resposta: "vamos", opcoes: ["vamos", "vai", "vão", "foi"] },
  { texto: "O sol ___ muito forte hoje.", resposta: "está", opcoes: ["está", "estão", "estar", "estive"] },
  { texto: "Minha ___ favorita é a laranja.", resposta: "fruta", opcoes: ["fruta", "comida", "bebida", "cor"] },
  { texto: "Os pássaros ___ no céu.", resposta: "voam", opcoes: ["voam", "voa", "voando", "voará"] },
  { texto: "Aquele livro é muito ___.", resposta: "interessante", opcoes: ["interessante", "correndo", "rapidamente", "azul"] },
  { texto: "Precisamos ___ as mãos antes de comer.", resposta: "lavar", opcoes: ["lavar", "lavamos", "lavando", "lavou"] },
]

function sortear<T>(lista: T[], n: number): T[] {
  return [...lista].sort(() => Math.random() - 0.5).slice(0, n)
}

function embaralhar<T>(lista: T[]): T[] {
  return [...lista].sort(() => Math.random() - 0.5)
}

export function JogoCompletar({ alunoId, bloqueado }: { alunoId: string; bloqueado?: boolean }) {
  const { ganharXpExtra } = useStore()
  const [rodadas, setRodadas] = useState<Frase[]>(() => sortear(BANCO_DE_FRASES, TOTAL_RODADAS))
  const [indice, setIndice] = useState(0)
  const [opcoes, setOpcoes] = useState<string[]>(() => embaralhar(rodadas[0].opcoes))
  const [selecionada, setSelecionada] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<"certo" | "errado" | null>(null)
  const [venceu, setVenceu] = useState(false)

  const frase = rodadas[indice]
  const [antes, depois] = frase.texto.split("___")

  function reiniciar() {
    const novas = sortear(BANCO_DE_FRASES, TOTAL_RODADAS)
    setRodadas(novas)
    setIndice(0)
    setOpcoes(embaralhar(novas[0].opcoes))
    setSelecionada(null)
    setFeedback(null)
    setVenceu(false)
  }

  function responder(opcao: string) {
    if (bloqueado || feedback) return
    setSelecionada(opcao)

    if (opcao === frase.resposta) {
      setFeedback("certo")
      ganharXpExtra(alunoId, XP_POR_ACERTO)
      toast.success(`+${XP_POR_ACERTO} XP! Palavra certa ✍️`, { icon: "✅" })

      const proximo = indice + 1
      setTimeout(() => {
        if (proximo >= TOTAL_RODADAS) {
          setVenceu(true)
          ganharXpExtra(alunoId, XP_BONUS_VITORIA)
          toast.success(`Você completou todas as frases! +${XP_BONUS_VITORIA} XP bônus 🎉`, { icon: "🏆" })
        } else {
          setIndice(proximo)
          setOpcoes(embaralhar(rodadas[proximo].opcoes))
        }
        setSelecionada(null)
        setFeedback(null)
      }, 700)
    } else {
      setFeedback("errado")
      toast.error("Quase! Essa não é a palavra certa.", { icon: "❌" })
      setTimeout(() => {
        setSelecionada(null)
        setFeedback(null)
      }, 700)
    }
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-purple-500/15 text-purple-600">
          <BookOpen className="size-5" />
        </span>
        <div>
          <h3 className="font-display text-base font-extrabold">Complete a frase!</h3>
          <p className="text-xs font-semibold text-muted-foreground">
            Escolha a palavra certa para preencher a lacuna.
          </p>
        </div>
      </div>

      {bloqueado ? (
        <p className="rounded-2xl bg-muted/60 p-3 text-center text-sm font-semibold text-muted-foreground">
          Disponível de novo depois do limite diário de tempo de tela.
        </p>
      ) : venceu ? (
        <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
          <p className="font-display text-lg font-extrabold text-purple-500">
            Você completou todas as frases! 🎉
          </p>
          <button
            onClick={reiniciar}
            className="rounded-2xl bg-purple-500 px-4 py-2 text-sm font-extrabold text-white shadow-[0_4px_0_0_rgba(0,0,0,0.15)] transition active:translate-y-0.5 active:shadow-none"
          >
            Jogar de novo
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-center gap-1.5">
            {rodadas.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-2 w-8 rounded-full transition-colors",
                  i < indice ? "bg-purple-500" : i === indice ? "bg-purple-300" : "bg-muted",
                )}
              />
            ))}
          </div>

          <p className="mb-4 text-center font-display text-lg font-extrabold leading-relaxed">
            {antes}
            <span
              className={cn(
                "mx-1 inline-block min-w-[90px] rounded-lg border-b-4 border-dashed px-1 text-center",
                feedback === "certo" ? "border-emerald-500 text-emerald-500" : "border-purple-400 text-purple-500",
              )}
            >
              {feedback === "certo" ? frase.resposta : "?????"}
            </span>
            {depois}
          </p>

          <div className="grid grid-cols-2 gap-2">
            {opcoes.map((op) => {
              const ehCorreta = op === frase.resposta
              const ehSelecionada = op === selecionada
              return (
                <button
                  key={op}
                  onClick={() => responder(op)}
                  disabled={!!feedback}
                  className={cn(
                    "rounded-2xl border-2 py-2.5 text-sm font-extrabold capitalize transition active:scale-95",
                    feedback && ehCorreta && "border-emerald-500 bg-emerald-500/10 text-emerald-500",
                    feedback === "errado" && ehSelecionada && !ehCorreta &&
                      "border-destructive bg-destructive/10 text-destructive",
                    !feedback && "border-border bg-background hover:bg-muted",
                  )}
                >
                  {op}
                </button>
              )
            })}
          </div>

          {feedback === "certo" && (
            <p className="mt-2 flex items-center justify-center gap-1 text-sm font-bold text-emerald-500">
              <Check className="size-4" /> Isso aí! Próxima frase...
            </p>
          )}
          {feedback === "errado" && (
            <p className="mt-2 flex items-center justify-center gap-1 text-sm font-bold text-destructive">
              <X className="size-4" /> Quase! Tenta de novo.
            </p>
          )}
        </>
      )}
    </div>
  )
}
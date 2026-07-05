    "use client"

    import { useState } from "react"
    import { useStore } from "@/lib/store"
    import { cn } from "@/lib/utils"
    import { Check, X } from "lucide-react"
    import { toast } from "sonner"

    const TOTAL_DEGRAUS = 5
    const XP_POR_ACERTO = 5
    const XP_BONUS_VITORIA = 20

    type Pergunta = { texto: string; resposta: number; opcoes: number[] }

    // Gera uma conta simples de matemática. A dificuldade cresce um pouco
    // conforme o aluno sobe os degraus.
    function gerarPergunta(nivel: number): Pergunta {
    const max = 5 + nivel * 3
    const operadores = ["+", "-", "×"] as const
    const op = operadores[Math.floor(Math.random() * operadores.length)]

    let resposta: number
    let texto: string

    if (op === "+") {
        const a = Math.floor(Math.random() * max) + 1
        const b = Math.floor(Math.random() * max) + 1
        resposta = a + b
        texto = `Quanto é ${a} + ${b}?`
    } else if (op === "-") {
        const a = Math.floor(Math.random() * max) + 1
        const b = Math.floor(Math.random() * max) + 1
        const maior = Math.max(a, b)
        const menor = Math.min(a, b)
        resposta = maior - menor
        texto = `Quanto é ${maior} - ${menor}?`
    } else {
        const x = Math.floor(Math.random() * 9) + 2
        const y = Math.floor(Math.random() * 9) + 2
        resposta = x * y
        texto = `Quanto é ${x} × ${y}?`
    }

    const opcoesSet = new Set<number>([resposta])
    while (opcoesSet.size < 4) {
        const delta = Math.floor(Math.random() * 9) - 4
        const candidato = resposta + delta
        if (candidato >= 0 && candidato !== resposta) opcoesSet.add(candidato)
    }
    const opcoes = Array.from(opcoesSet).sort(() => Math.random() - 0.5)

    return { texto, resposta, opcoes }
    }

    export function JogoEscada({ alunoId, bloqueado }: { alunoId: string; bloqueado?: boolean }) {
    const { ganharXpExtra } = useStore()
    const [degrau, setDegrau] = useState(0)
    const [pergunta, setPergunta] = useState<Pergunta>(() => gerarPergunta(0))
    const [selecionada, setSelecionada] = useState<number | null>(null)
    const [feedback, setFeedback] = useState<"certo" | "errado" | null>(null)
    const [venceu, setVenceu] = useState(false)

    function reiniciar() {
        setDegrau(0)
        setPergunta(gerarPergunta(0))
        setSelecionada(null)
        setFeedback(null)
        setVenceu(false)
    }

    function responder(valor: number) {
        if (bloqueado || feedback) return
        setSelecionada(valor)

        if (valor === pergunta.resposta) {
        setFeedback("certo")
        ganharXpExtra(alunoId, XP_POR_ACERTO)
        toast.success(`+${XP_POR_ACERTO} XP! Subiu um degrau 🪜`, { icon: "⚡" })

        const proximoDegrau = degrau + 1
        setTimeout(() => {
            if (proximoDegrau >= TOTAL_DEGRAUS) {
            setDegrau(TOTAL_DEGRAUS)
            setVenceu(true)
            ganharXpExtra(alunoId, XP_BONUS_VITORIA)
            toast.success(`Você chegou ao topo da escada! +${XP_BONUS_VITORIA} XP bônus 🎉`, { icon: "🏆" })
            } else {
            setDegrau(proximoDegrau)
            setPergunta(gerarPergunta(proximoDegrau))
            }
            setSelecionada(null)
            setFeedback(null)
        }, 700)
        } else {
        setFeedback("errado")
        toast.error("Ops, errou! Desceu um degrau. Tenta de novo.", { icon: "⬇️" })
        const degrauAnterior = Math.max(0, degrau - 1)
        setTimeout(() => {
            setDegrau(degrauAnterior)
            setPergunta(gerarPergunta(degrauAnterior))
            setSelecionada(null)
            setFeedback(null)
        }, 700)
        }
    }

    return (
        <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-brand-turquoise/15 text-cyan-600">
            🪜
            </span>
            <div>
            <h3 className="font-display text-base font-extrabold">Suba a escada da matemática!</h3>
            <p className="text-xs font-semibold text-muted-foreground">
                Acertou, sobe um degrau. Errou, desce um. Chegue ao topo!
            </p>
            </div>
        </div>

        {bloqueado ? (
            <p className="rounded-2xl bg-muted/60 p-3 text-center text-sm font-semibold text-muted-foreground">
            Disponível de novo depois do limite diário de tempo de tela.
            </p>
        ) : (
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-stretch sm:gap-6">
            {/* Escada visual */}
            <div className="flex flex-row-reverse items-end gap-1.5 sm:flex-col-reverse sm:items-center sm:gap-2">
                {Array.from({ length: TOTAL_DEGRAUS }).map((_, i) => {
                const numero = i + 1
                const alcancado = degrau >= numero
                return (
                    <div key={numero} className="flex flex-col items-center gap-1 sm:flex-row-reverse sm:gap-2">
                    <span
                        className={cn(
                        "h-2 w-10 rounded-full transition-colors sm:h-2.5 sm:w-14",
                        alcancado ? "bg-brand-turquoise" : "bg-muted",
                        )}
                    />
                    {degrau === numero && !venceu && <span className="text-lg">🧍</span>}
                    </div>
                )
                })}
                {venceu && <span className="text-2xl">🏆</span>}
            </div>

            {/* Pergunta / opções */}
            <div className="flex-1">
                {venceu ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 py-2 text-center">
                    <p className="font-display text-lg font-extrabold text-brand-turquoise">
                    Você chegou ao topo! 🎉
                    </p>
                    <button
                    onClick={reiniciar}
                    className="rounded-2xl bg-brand-turquoise px-4 py-2 text-sm font-extrabold text-white shadow-[0_4px_0_0_rgba(0,0,0,0.15)] transition active:translate-y-0.5 active:shadow-none"
                    >
                    Jogar de novo
                    </button>
                </div>
                ) : (
                <>
                    <p className="mb-3 text-center font-display text-lg font-extrabold sm:text-left">
                    {pergunta.texto}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                    {pergunta.opcoes.map((op) => {
                        const ehCorreta = op === pergunta.resposta
                        const ehSelecionada = op === selecionada
                        return (
                        <button
                            key={op}
                            onClick={() => responder(op)}
                            disabled={!!feedback}
                            className={cn(
                            "rounded-2xl border-2 py-2.5 text-base font-extrabold transition active:scale-95",
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
                    <p className="mt-2 flex items-center justify-center gap-1 text-sm font-bold text-emerald-500 sm:justify-start">
                        <Check className="size-4" /> Isso aí! Subindo...
                    </p>
                    )}
                    {feedback === "errado" && (
                    <p className="mt-2 flex items-center justify-center gap-1 text-sm font-bold text-destructive sm:justify-start">
                        <X className="size-4" /> Quase! Descendo um degrau...
                    </p>
                    )}
                </>
                )}
            </div>
            </div>
        )}
        </div>
    )
    }
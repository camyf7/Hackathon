// components/teacher-password-modal.tsx
"use client"

import { useState, useRef, useEffect } from "react"
import { Lock, Eye, EyeOff, X, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

const TEACHER_PASSWORD = "professor2024" // TODO: mover para variável de ambiente / validação no servidor

export function TeacherPasswordModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [senha, setSenha] = useState("")
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setSenha("")
      setErro(false)
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!senha) return

    setCarregando(true)
    // Simula uma pequena verificação para dar feedback de "processando"
    setTimeout(() => {
      if (senha === TEACHER_PASSWORD) {
        onSuccess()
      } else {
        setErro(true)
        setSenha("")
        inputRef.current?.focus()
      }
      setCarregando(false)
    }, 400)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative w-full max-w-sm rounded-[28px] border border-white/10 bg-zinc-900 p-7 shadow-2xl",
          "animate-in zoom-in-95 slide-in-from-bottom-2 duration-200",
          erro && "animate-shake",
        )}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-5 top-5 grid size-8 place-items-center rounded-full text-zinc-500 transition hover:bg-white/5 hover:text-zinc-300"
        >
          <X className="size-4" />
        </button>

        <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg shadow-purple-500/20">
          <Lock className="size-6 text-white" />
        </div>

        <h2 className="font-display text-2xl font-extrabold text-white">
          Acesso do professor
        </h2>
        <p className="mt-1.5 text-sm font-medium text-zinc-400">
          Digite a senha para acessar o painel da turma.
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <div
            className={cn(
              "flex items-center gap-2 rounded-2xl border bg-white/5 px-4 py-3 transition",
              erro
                ? "border-red-500/60 bg-red-500/5"
                : "border-white/10 focus-within:border-purple-400/60",
            )}
          >
            <Lock className="size-4 shrink-0 text-zinc-500" />
            <input
              ref={inputRef}
              type={mostrarSenha ? "text" : "password"}
              value={senha}
              onChange={(e) => {
                setSenha(e.target.value)
                if (erro) setErro(false)
              }}
              placeholder="Senha"
              className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-zinc-500"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setMostrarSenha((v) => !v)}
              aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              className="shrink-0 text-zinc-500 transition hover:text-zinc-300"
            >
              {mostrarSenha ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          {erro && (
            <p className="mt-2 text-xs font-bold text-red-400">
              Senha incorreta. Tente novamente.
            </p>
          )}

          <button
            type="submit"
            disabled={!senha || carregando}
            className={cn(
              "mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-extrabold text-white transition",
              "bg-gradient-to-r from-purple-500 to-violet-600 shadow-lg shadow-purple-500/20",
              "hover:brightness-110 active:scale-[0.98]",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100",
            )}
          >
            {carregando ? (
              <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <ShieldCheck className="size-4" />
            )}
            {carregando ? "Verificando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  )
}
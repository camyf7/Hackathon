"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { PROFESSOR_DEMO } from "@/lib/seed"
import { Logo } from "@/components/brand"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { ArrowLeft, LogIn, UserPlus } from "lucide-react"
import { toast } from "sonner"

type Modo = "login" | "cadastro"

export default function ProfessorLoginPage() {
  const router = useRouter()
  const { ready, professorId, loginProfessor, registrarProfessor } = useStore()
  const [modo, setModo] = useState<Modo>("login")
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (ready && professorId) router.replace("/professor")
  }, [ready, professorId, router])

  function submit(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    const res =
      modo === "login"
        ? loginProfessor(email, senha)
        : registrarProfessor(nome, email, senha)
    if (!res.ok) {
      setErro(res.error ?? "Não foi possível continuar.")
      return
    }
    toast.success(modo === "login" ? "Bem-vindo(a) de volta!" : "Conta criada com sucesso!")
    router.push("/professor")
  }

  function preencherDemo() {
    setModo("login")
    setEmail(PROFESSOR_DEMO.email)
    setSenha(PROFESSOR_DEMO.senha)
    setErro(null)
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 pt-6">
        <Logo />
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-muted-foreground transition hover:bg-muted"
        >
          <ArrowLeft className="size-4" /> Início
        </button>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-10">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <h1 className="font-display text-2xl font-extrabold text-foreground">
            Painel do Professor
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {modo === "login"
              ? "Entre para gerenciar suas turmas, atividades e recompensas."
              : "Crie sua conta para começar a gerenciar turmas."}
          </p>

          <div className="mt-5 flex gap-1 rounded-2xl bg-muted p-1">
            <button
              type="button"
              onClick={() => {
                setModo("login")
                setErro(null)
              }}
              className={cn(
                "flex-1 rounded-xl py-2 text-sm font-bold transition",
                modo === "login" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setModo("cadastro")
                setErro(null)
              }}
              className={cn(
                "flex-1 rounded-xl py-2 text-sm font-bold transition",
                modo === "cadastro" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={submit} className="mt-5 space-y-4">
            {modo === "cadastro" && (
              <div className="space-y-1.5">
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Marina Andrade"
                  autoComplete="name"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@escola.com"
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 4 caracteres"
                autoComplete={modo === "login" ? "current-password" : "new-password"}
              />
            </div>

            {erro && (
              <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
                {erro}
              </p>
            )}

            <Button type="submit" className="w-full rounded-2xl py-6 font-extrabold">
              {modo === "login" ? (
                <>
                  <LogIn className="size-4" /> Entrar
                </>
              ) : (
                <>
                  <UserPlus className="size-4" /> Criar conta
                </>
              )}
            </Button>
          </form>

          <button
            type="button"
            onClick={preencherDemo}
            className="mt-4 w-full rounded-xl border border-dashed border-border py-2.5 text-xs font-semibold text-muted-foreground transition hover:bg-muted"
          >
            Usar conta de demonstração
          </button>
        </div>
      </main>
    </div>
  )
}

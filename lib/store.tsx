"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type {
  Aluno,
  Atividade,
  CategoriaRecompensa,
  DB,
  Dificuldade,
  Missao,
  Recompensa,
  Squad,
  TipoSquad,
} from "./types"
import { criarSeed } from "./seed"
import { adicionarDias, nivelDoXp } from "./game"

const STORAGE_KEY = "trilha-plus-db-v5"
const SESSION_KEY = "trilha-plus-session-v4"

// ---------- helpers ----------
function recalcAluno(a: Aluno, banners: DB["banners"]): Aluno {
  const nivel = nivelDoXp(a.xp_total)
  const desbloqueados = new Set(a.banners_desbloqueados)
  banners.forEach((b) => {
    if (a.xp_total >= b.custo_xp) desbloqueados.add(b.id)
  })
  return {
    ...a,
    nivel,
    banners_desbloqueados: Array.from(desbloqueados),
    banner_equipado: a.banner_equipado ?? "b_ceu",
  }
}

function recalcSquads(db: DB): Squad[] {
  return db.squads.map((sq) => ({
    ...sq,
    xp_coletivo: sq.alunos_ids.reduce(
      (s, id) => s + (db.alunos.find((a) => a.id === id)?.xp_total ?? 0),
      0,
    ),
  }))
}

type AuthResult = { ok: boolean; error?: string }

interface AtividadeInput {
  titulo: string
  descricao: string
  prazo: string | null
  xp: number
  dificuldade: Dificuldade
  anexos: { nome: string; tipo: string }[]
}

interface RecompensaInput {
  nome: string
  descricao: string
  categoria: CategoriaRecompensa
  imagem: string | null
  custo_xp: number
  quantidade: number
  status: "ativa" | "inativa"
}

interface StoreCtx {
  db: DB
  ready: boolean
  // sessão / filtros
  professorId: string | null
  escolaId: string
  turmaId: string
  alunoId: string | null
  setEscolaId: (id: string) => void
  setTurmaId: (id: string) => void
  setAlunoId: (id: string | null) => void
  // autenticação professor
  registrarProfessor: (nome: string, email: string, senha: string) => AuthResult
  loginProfessor: (email: string, senha: string) => AuthResult
  logoutProfessor: () => void
  // turmas (professor)
  criarTurma: (nome: string, serie: string, escolaId: string) => void
  atualizarTurma: (id: string, nome: string, serie: string, escolaId: string) => void
  removerTurma: (id: string) => void
  // ações aluno
  responderExercicio: (alunoId: string, exercicioId: string) => { acertou: boolean; xp: number } | null
  fazerCheckin: (alunoId: string) => number | null
  equiparBanner: (alunoId: string, bannerId: string) => void
  concluirAtividade: (alunoId: string, atividadeId: string) => number | null
  solicitarResgate: (recompensaId: string, alunoId: string) => AuthResult
  // ações professora — alunos
  adicionarAluno: (nome: string, turmaId: string, avatar: string) => void
  atualizarAluno: (id: string, nome: string, avatar: string) => void
  removerAluno: (id: string) => void
  moverAlunoParaTurma: (alunoId: string, turmaId: string) => void
  // atividades (professor)
  criarAtividade: (turmaId: string, dados: AtividadeInput) => void
  atualizarAtividade: (id: string, dados: AtividadeInput) => void
  encerrarAtividade: (id: string) => void
  removerAtividade: (id: string) => void
  // recompensas (professor)
  criarRecompensa: (turmaId: string, dados: RecompensaInput) => void
  atualizarRecompensa: (id: string, dados: RecompensaInput) => void
  alternarStatusRecompensa: (id: string) => void
  removerRecompensa: (id: string) => void
  // squads / presença / missões
  criarSquad: (turmaId: string, nome: string, alunosIds: string[]) => void
  removerSquad: (squadId: string) => void
  gerarSquadsAuto: (turmaId: string) => void
  marcarPresenca: (alunoId: string, data: string, estado: "presente" | "falta" | "justificada") => void
  postarMissao: (turmaId: string, squadId: string | null, titulo: string, descricao: string, xp: number) => void
  aprovarResgate: (resgateId: string, aprovar: boolean) => void
  // demo
  avancarDia: () => void
  simularPresenca: () => void
  simularXP: () => void
  resetarDados: () => void
}

const Ctx = createContext<StoreCtx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(() => criarSeed())
  const [ready, setReady] = useState(false)
  const [professorId, setProfessorId] = useState<string | null>(null)
  const [escolaId, setEscolaIdState] = useState("")
  const [turmaId, setTurmaIdState] = useState("")
  const [alunoId, setAlunoId] = useState<string | null>(null)

  // carregar do localStorage
  useEffect(() => {
    let base: DB
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        base = JSON.parse(raw) as DB
      } else {
        base = criarSeed()
        localStorage.setItem(STORAGE_KEY, JSON.stringify(base))
      }
    } catch {
      base = criarSeed()
    }
    setDb(base)

    // sessão
    try {
      const rawSession = localStorage.getItem(SESSION_KEY)
      const session = rawSession ? (JSON.parse(rawSession) as { professorId?: string | null }) : null
      const pid = session?.professorId && base.professores.some((p) => p.id === session.professorId)
        ? session.professorId
        : null
      setProfessorId(pid ?? null)
      const escInicial = base.escolas[0]?.id ?? ""
      setEscolaIdState(escInicial)
      const turmasVisiveis = pid
        ? base.turmas.filter((t) => t.professor_id === pid)
        : base.turmas.filter((t) => t.escola_id === escInicial)
      setTurmaIdState(turmasVisiveis[0]?.id ?? "")
    } catch {
      setEscolaIdState(base.escolas[0]?.id ?? "")
      setTurmaIdState(base.turmas[0]?.id ?? "")
    }
    setReady(true)
  }, [])

  // persistir dados
  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  }, [db, ready])

  // persistir sessão
  useEffect(() => {
    if (ready) localStorage.setItem(SESSION_KEY, JSON.stringify({ professorId }))
  }, [professorId, ready])

  const setEscolaId = useCallback(
    (id: string) => {
      setEscolaIdState(id)
      const primeiraTurma = db.turmas.find((t) => t.escola_id === id)
      setTurmaIdState(primeiraTurma?.id ?? "")
    },
    [db.turmas],
  )
  const setTurmaId = useCallback((id: string) => setTurmaIdState(id), [])

  // ---------- autenticação professor ----------
  const registrarProfessor = useCallback((nome: string, email: string, senha: string): AuthResult => {
    const emailNorm = email.trim().toLowerCase()
    if (!nome.trim() || !emailNorm || !senha) return { ok: false, error: "Preencha todos os campos." }
    if (senha.length < 4) return { ok: false, error: "A senha deve ter ao menos 4 caracteres." }
    let result: AuthResult = { ok: true }
    setDb((prev) => {
      if (prev.professores.some((p) => p.email.toLowerCase() === emailNorm)) {
        result = { ok: false, error: "Já existe uma conta com este e-mail." }
        return prev
      }
      const novo = {
        id: `prof-${Date.now()}`,
        nome: nome.trim(),
        email: emailNorm,
        senha,
        criado_em: new Date().toISOString(),
      }
      setProfessorId(novo.id)
      const primeira = prev.turmas.find((t) => t.professor_id === novo.id)
      setTurmaIdState(primeira?.id ?? "")
      return { ...prev, professores: [...prev.professores, novo] }
    })
    return result
  }, [])

  const loginProfessor = useCallback((email: string, senha: string): AuthResult => {
    const emailNorm = email.trim().toLowerCase()
    let result: AuthResult = { ok: true }
    setDb((prev) => {
      const prof = prev.professores.find((p) => p.email.toLowerCase() === emailNorm)
      if (!prof || prof.senha !== senha) {
        result = { ok: false, error: "E-mail ou senha inválidos." }
        return prev
      }
      setProfessorId(prof.id)
      const primeira = prev.turmas.find((t) => t.professor_id === prof.id)
      setTurmaIdState(primeira?.id ?? "")
      return prev
    })
    return result
  }, [])

  const logoutProfessor = useCallback(() => {
    setProfessorId(null)
  }, [])

  // ---------- turmas ----------
  const criarTurma = useCallback(
    (nome: string, serie: string, escId: string) => {
      setDb((prev) => {
        if (!professorId) return prev
        const id = `turma-${Date.now()}`
        const nova = {
          id,
          professor_id: professorId,
          escola_id: escId || prev.escolas[0]?.id || "",
          nome,
          serie,
          criada_em: new Date().toISOString(),
        }
        setTurmaIdState(id)
        return { ...prev, turmas: [...prev.turmas, nova] }
      })
    },
    [professorId],
  )

  const atualizarTurma = useCallback((id: string, nome: string, serie: string, escId: string) => {
    setDb((prev) => ({
      ...prev,
      turmas: prev.turmas.map((t) => (t.id === id ? { ...t, nome, serie, escola_id: escId } : t)),
    }))
  }, [])

  const removerTurma = useCallback((id: string) => {
    setDb((prev) => {
      const alunosIds = prev.alunos.filter((a) => a.turma_id === id).map((a) => a.id)
      return {
        ...prev,
        turmas: prev.turmas.filter((t) => t.id !== id),
        alunos: prev.alunos.filter((a) => a.turma_id !== id),
        squads: prev.squads.filter((s) => s.turma_id !== id),
        atividades: prev.atividades.filter((a) => a.turma_id !== id),
        recompensas: prev.recompensas.filter((r) => r.turma_id !== id),
        resgates: prev.resgates.filter((r) => r.turma_id !== id),
        missoes: prev.missoes.filter((m) => m.turma_id !== id),
        progresso: prev.progresso.filter((p) => !alunosIds.includes(p.aluno_id)),
        presencas: prev.presencas.filter((p) => !alunosIds.includes(p.aluno_id)),
      }
    })
    setTurmaIdState((atual) => (atual === id ? "" : atual))
  }, [])

  // ---------- ações aluno ----------
  const responderExercicio = useCallback((aid: string, exId: string) => {
    let resultado: { acertou: boolean; xp: number } | null = null
    setDb((prev) => {
      const trilha = prev.trilhas.find((t) => t.exercicios.some((e) => e.id === exId))
      const exercicio = trilha?.exercicios.find((e) => e.id === exId)
      if (!trilha || !exercicio) return prev
      const xp = exercicio.xp_recompensa
      resultado = { acertou: true, xp }

      const alunos = prev.alunos.map((a) => {
        if (a.id !== aid) return a
        return recalcAluno({ ...a, xp_total: a.xp_total + xp }, prev.banners)
      })

      const progresso = prev.progresso.map((p) => {
        if (p.aluno_id !== aid || p.trilha_id !== trilha.id) return p
        if (p.exercicios_completos.includes(exId)) return p
        const completos = [...p.exercicios_completos, exId]
        const nivelAtual =
          exercicio.nivel >= p.nivel_atual ? Math.min(trilha.niveis, p.nivel_atual + 1) : p.nivel_atual
        return { ...p, exercicios_completos: completos, nivel_atual: nivelAtual }
      })

      const next = { ...prev, alunos, progresso }
      return { ...next, squads: recalcSquads(next) }
    })
    return resultado
  }, [])

  const fazerCheckin = useCallback((aid: string) => {
    let xpGanho: number | null = null
    setDb((prev) => {
      const hoje = prev.data_atual
      const aluno = prev.alunos.find((a) => a.id === aid)
      if (!aluno) return prev
      const jaPresente = prev.presencas.some((p) => p.aluno_id === aid && p.data === hoje && p.presente)
      const ontem = adicionarDias(hoje, -1)
      const veioOntem = aluno.ultima_presenca === ontem || aluno.streak_dias > 0
      const novoStreak = jaPresente ? aluno.streak_dias : (veioOntem ? aluno.streak_dias + 1 : 1)
      const bonus = 20
      xpGanho = jaPresente ? 0 : bonus

      const alunos = prev.alunos.map((a) =>
        a.id === aid
          ? recalcAluno(
              {
                ...a,
                xp_total: a.xp_total + (jaPresente ? 0 : bonus),
                streak_dias: novoStreak,
                ultima_presenca: hoje,
              },
              prev.banners,
            )
          : a,
      )
      const presencas = jaPresente
        ? prev.presencas
        : [...prev.presencas.filter((p) => !(p.aluno_id === aid && p.data === hoje)), { aluno_id: aid, data: hoje, presente: true, justificada: false }]

      const next = { ...prev, alunos, presencas }
      return { ...next, squads: recalcSquads(next) }
    })
    return xpGanho
  }, [])

  const equiparBanner = useCallback((aid: string, bannerId: string) => {
    setDb((prev) => ({
      ...prev,
      alunos: prev.alunos.map((a) =>
        a.id === aid && a.banners_desbloqueados.includes(bannerId)
          ? { ...a, banner_equipado: bannerId }
          : a,
      ),
    }))
  }, [])

  const concluirAtividade = useCallback((aid: string, atividadeId: string) => {
    let xpGanho: number | null = null
    setDb((prev) => {
      const atividade = prev.atividades.find((a) => a.id === atividadeId)
      const aluno = prev.alunos.find((a) => a.id === aid)
      if (!atividade || !aluno) return prev
      if (atividade.status !== "aberta") return prev
      if (atividade.alunos_concluidos.includes(aid)) return prev
      xpGanho = atividade.xp

      const atividades = prev.atividades.map((a) =>
        a.id === atividadeId ? { ...a, alunos_concluidos: [...a.alunos_concluidos, aid] } : a,
      )
      const alunos = prev.alunos.map((a) =>
        a.id === aid
          ? recalcAluno(
              { ...a, xp_total: a.xp_total + atividade.xp, atividades_concluidas: [...a.atividades_concluidas, atividadeId] },
              prev.banners,
            )
          : a,
      )
      const next = { ...prev, atividades, alunos }
      return { ...next, squads: recalcSquads(next) }
    })
    return xpGanho
  }, [])

  const solicitarResgate = useCallback((recompensaId: string, aid: string): AuthResult => {
    let result: AuthResult = { ok: true }
    setDb((prev) => {
      const recompensa = prev.recompensas.find((r) => r.id === recompensaId)
      const aluno = prev.alunos.find((a) => a.id === aid)
      if (!recompensa || !aluno) {
        result = { ok: false, error: "Recompensa indisponível." }
        return prev
      }
      if (recompensa.status !== "ativa" || recompensa.quantidade <= 0) {
        result = { ok: false, error: "Recompensa esgotada." }
        return prev
      }
      if (aluno.xp_total < recompensa.custo_xp) {
        result = { ok: false, error: "XP insuficiente." }
        return prev
      }
      const jaExiste = prev.resgates.some(
        (r) => r.recompensa_id === recompensaId && r.solicitante_id === aid && r.status === "pendente",
      )
      if (jaExiste) {
        result = { ok: false, error: "Você já tem um pedido pendente." }
        return prev
      }
      const recompensas = prev.recompensas.map((r) =>
        r.id === recompensaId ? { ...r, quantidade: r.quantidade - 1 } : r,
      )
      return {
        ...prev,
        recompensas,
        resgates: [
          ...prev.resgates,
          {
            id: `res-${Date.now()}`,
            recompensa_id: recompensaId,
            solicitante_id: aid,
            solicitante_tipo: "aluno" as const,
            turma_id: aluno.turma_id,
            custo_xp: recompensa.custo_xp,
            status: "pendente" as const,
            data: prev.data_atual,
          },
        ],
      }
    })
    return result
  }, [])

  // ---------- ações professora — alunos ----------
  const adicionarAluno = useCallback((nome: string, tId: string, avatar: string) => {
    setDb((prev) => {
      const novo: Aluno = {
        id: `${tId}-a${Date.now()}`,
        nome,
        turma_id: tId,
        avatar,
        xp_total: 0,
        nivel: 1,
        streak_dias: 0,
        squad_id: null,
        tempo_tela_minutos_hoje: 0,
        tempo_tela_minutos_semana: 0,
        tem_dispositivo_proprio: true,
        banners_desbloqueados: ["b_ceu"],
        banner_equipado: "b_ceu",
        badges: [],
        ultima_presenca: null,
        atividades_concluidas: [],
      }
      const progresso = [
        ...prev.progresso,
        ...prev.trilhas.map((t) => ({
          aluno_id: novo.id,
          trilha_id: t.id,
          nivel_atual: 1,
          exercicios_completos: [],
        })),
      ]
      return { ...prev, alunos: [...prev.alunos, novo], progresso }
    })
  }, [])

  const atualizarAluno = useCallback((id: string, nome: string, avatar: string) => {
    setDb((prev) => ({
      ...prev,
      alunos: prev.alunos.map((a) => (a.id === id ? { ...a, nome, avatar } : a)),
    }))
  }, [])

  const removerAluno = useCallback((id: string) => {
    setDb((prev) => {
      const squads = prev.squads
        .map((sq) => ({ ...sq, alunos_ids: sq.alunos_ids.filter((x) => x !== id) }))
        .filter((sq) => sq.alunos_ids.length > 0)
      const next = {
        ...prev,
        alunos: prev.alunos.filter((a) => a.id !== id),
        progresso: prev.progresso.filter((p) => p.aluno_id !== id),
        presencas: prev.presencas.filter((p) => p.aluno_id !== id),
        atividades: prev.atividades.map((a) => ({
          ...a,
          alunos_concluidos: a.alunos_concluidos.filter((x) => x !== id),
        })),
        squads,
      }
      return { ...next, squads: recalcSquads(next) }
    })
  }, [])

  const moverAlunoParaTurma = useCallback((aid: string, tId: string) => {
    setDb((prev) => {
      const squads = prev.squads
        .map((sq) => ({ ...sq, alunos_ids: sq.alunos_ids.filter((x) => x !== aid) }))
        .filter((sq) => sq.alunos_ids.length > 0)
      const alunos = prev.alunos.map((a) =>
        a.id === aid ? { ...a, turma_id: tId, squad_id: null } : a,
      )
      const next = { ...prev, alunos, squads }
      return { ...next, squads: recalcSquads(next) }
    })
  }, [])

  // ---------- atividades ----------
  const criarAtividade = useCallback((tId: string, dados: AtividadeInput) => {
    setDb((prev) => {
      const nova: Atividade = {
        id: `atv-${Date.now()}`,
        turma_id: tId,
        titulo: dados.titulo,
        descricao: dados.descricao,
        prazo: dados.prazo,
        xp: dados.xp,
        dificuldade: dados.dificuldade,
        anexos: dados.anexos.map((ax, i) => ({ id: `ax-${Date.now()}-${i}`, nome: ax.nome, tipo: ax.tipo })),
        status: "aberta",
        criada_em: new Date().toISOString(),
        alunos_concluidos: [],
      }
      return { ...prev, atividades: [...prev.atividades, nova] }
    })
  }, [])

  const atualizarAtividade = useCallback((id: string, dados: AtividadeInput) => {
    setDb((prev) => ({
      ...prev,
      atividades: prev.atividades.map((a) =>
        a.id === id
          ? {
              ...a,
              titulo: dados.titulo,
              descricao: dados.descricao,
              prazo: dados.prazo,
              xp: dados.xp,
              dificuldade: dados.dificuldade,
              anexos: dados.anexos.map((ax, i) => ({ id: `ax-${Date.now()}-${i}`, nome: ax.nome, tipo: ax.tipo })),
            }
          : a,
      ),
    }))
  }, [])

  const encerrarAtividade = useCallback((id: string) => {
    setDb((prev) => ({
      ...prev,
      atividades: prev.atividades.map((a) =>
        a.id === id ? { ...a, status: a.status === "aberta" ? "encerrada" : "aberta" } : a,
      ),
    }))
  }, [])

  const removerAtividade = useCallback((id: string) => {
    setDb((prev) => ({ ...prev, atividades: prev.atividades.filter((a) => a.id !== id) }))
  }, [])

  // ---------- recompensas ----------
  const criarRecompensa = useCallback((tId: string, dados: RecompensaInput) => {
    setDb((prev) => {
      const nova: Recompensa = {
        id: `rec-${Date.now()}`,
        turma_id: tId,
        criada_em: new Date().toISOString(),
        ...dados,
      }
      return { ...prev, recompensas: [...prev.recompensas, nova] }
    })
  }, [])

  const atualizarRecompensa = useCallback((id: string, dados: RecompensaInput) => {
    setDb((prev) => ({
      ...prev,
      recompensas: prev.recompensas.map((r) => (r.id === id ? { ...r, ...dados } : r)),
    }))
  }, [])

  const alternarStatusRecompensa = useCallback((id: string) => {
    setDb((prev) => ({
      ...prev,
      recompensas: prev.recompensas.map((r) =>
        r.id === id ? { ...r, status: r.status === "ativa" ? "inativa" : "ativa" } : r,
      ),
    }))
  }, [])

  const removerRecompensa = useCallback((id: string) => {
    setDb((prev) => ({
      ...prev,
      recompensas: prev.recompensas.filter((r) => r.id !== id),
      resgates: prev.resgates.filter((r) => r.recompensa_id !== id),
    }))
  }, [])

  // ---------- squads ----------
  const criarSquad = useCallback((tId: string, nome: string, alunosIds: string[]) => {
    setDb((prev) => {
      const tipo: TipoSquad = alunosIds.length === 2 ? "dupla" : alunosIds.length === 3 ? "trio" : "squad"
      const squadId = `${tId}-sq${Date.now()}`
      const emojis = ["🚀", "⭐", "🐉", "🔥", "🌈", "⚡"]
      const squadsLimpos = prev.squads
        .map((sq) => ({ ...sq, alunos_ids: sq.alunos_ids.filter((x) => !alunosIds.includes(x)) }))
        .filter((sq) => sq.alunos_ids.length > 0)
      const novoSquad: Squad = {
        id: squadId,
        turma_id: tId,
        nome,
        tipo,
        alunos_ids: alunosIds,
        xp_coletivo: 0,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
      }
      const alunos = prev.alunos.map((a) =>
        alunosIds.includes(a.id) ? { ...a, squad_id: squadId } : a,
      )
      const next = { ...prev, alunos, squads: [...squadsLimpos, novoSquad] }
      return { ...next, squads: recalcSquads(next) }
    })
  }, [])

  const removerSquad = useCallback((squadId: string) => {
    setDb((prev) => ({
      ...prev,
      squads: prev.squads.filter((s) => s.id !== squadId),
      alunos: prev.alunos.map((a) => (a.squad_id === squadId ? { ...a, squad_id: null } : a)),
    }))
  }, [])

  const gerarSquadsAuto = useCallback((tId: string) => {
    setDb((prev) => {
      const alunosTurma = [...prev.alunos.filter((a) => a.turma_id === tId)]
      alunosTurma.sort((a, b) => b.xp_total - a.xp_total)
      const intercalado: Aluno[] = []
      let i = 0
      let j = alunosTurma.length - 1
      while (i <= j) {
        intercalado.push(alunosTurma[i])
        if (i !== j) intercalado.push(alunosTurma[j])
        i++
        j--
      }
      const emojis = ["🚀", "⭐", "🐉", "🔥", "🌈", "⚡"]
      const nomes = ["Foguetes", "Estrelas", "Dragões", "Chamas", "Arco-íris", "Relâmpagos"]
      const novos: Squad[] = []
      for (let k = 0; k < intercalado.length; k += 3) {
        const grupo = intercalado.slice(k, k + 3)
        const ids = grupo.map((a) => a.id)
        const sqId = `${tId}-sqauto${k}-${Date.now()}`
        novos.push({
          id: sqId,
          turma_id: tId,
          nome: nomes[(k / 3) % nomes.length],
          tipo: ids.length === 2 ? "dupla" : ids.length === 3 ? "trio" : "squad",
          alunos_ids: ids,
          xp_coletivo: 0,
          emoji: emojis[(k / 3) % emojis.length],
        })
      }
      const outrosSquads = prev.squads.filter((s) => s.turma_id !== tId)
      const alunos = prev.alunos.map((a) => {
        if (a.turma_id !== tId) return a
        const sq = novos.find((s) => s.alunos_ids.includes(a.id))
        return { ...a, squad_id: sq?.id ?? null }
      })
      const next = { ...prev, squads: [...outrosSquads, ...novos], alunos }
      return { ...next, squads: recalcSquads(next) }
    })
  }, [])

  const marcarPresenca = useCallback(
    (aid: string, data: string, estado: "presente" | "falta" | "justificada") => {
      setDb((prev) => {
        const presente = estado === "presente"
        const justificada = estado === "justificada"
        const existe = prev.presencas.some((p) => p.aluno_id === aid && p.data === data)
        const presencas = existe
          ? prev.presencas.map((p) =>
              p.aluno_id === aid && p.data === data ? { ...p, presente, justificada } : p,
            )
          : [...prev.presencas, { aluno_id: aid, data, presente, justificada }]

        const alunos = prev.alunos.map((a) => {
          if (a.id !== aid) return a
          const dias = presencas
            .filter((p) => p.aluno_id === aid && p.presente)
            .map((p) => p.data)
            .sort()
          let streak = 0
          let cursor = prev.data_atual
          while (dias.includes(cursor)) {
            streak++
            cursor = adicionarDias(cursor, -1)
          }
          return { ...a, streak_dias: streak, ultima_presenca: dias[dias.length - 1] ?? null }
        })
        return { ...prev, presencas, alunos }
      })
    },
    [],
  )

  const postarMissao = useCallback(
    (tId: string, squadId: string | null, titulo: string, descricao: string, xp: number) => {
      setDb((prev) => {
        const nova: Missao = {
          id: `m-${Date.now()}`,
          turma_id: tId,
          squad_id: squadId,
          titulo,
          descricao,
          xp_recompensa: xp,
          concluida: false,
        }
        return { ...prev, missoes: [...prev.missoes, nova] }
      })
    },
    [],
  )

  const aprovarResgate = useCallback((resgateId: string, aprovar: boolean) => {
    setDb((prev) => {
      const resgate = prev.resgates.find((r) => r.id === resgateId)
      if (!resgate || resgate.status !== "pendente") return prev
      const resgates = prev.resgates.map((r) =>
        r.id === resgateId ? { ...r, status: aprovar ? ("aprovada" as const) : ("negada" as const) } : r,
      )
      if (aprovar) {
        // desconta o XP travado do aluno
        const alunos = prev.alunos.map((a) =>
          a.id === resgate.solicitante_id
            ? recalcAluno({ ...a, xp_total: Math.max(0, a.xp_total - resgate.custo_xp) }, prev.banners)
            : a,
        )
        const next = { ...prev, resgates, alunos }
        return { ...next, squads: recalcSquads(next) }
      }
      // negado: devolve a unidade reservada da recompensa
      const recompensas = prev.recompensas.map((r) =>
        r.id === resgate.recompensa_id ? { ...r, quantidade: r.quantidade + 1 } : r,
      )
      return { ...prev, resgates, recompensas }
    })
  }, [])

  // ---------- demo ----------
  const avancarDia = useCallback(() => {
    setDb((prev) => {
      const novaData = adicionarDias(prev.data_atual, 1)
      const alunos = prev.alunos.map((a) => ({ ...a, tempo_tela_minutos_hoje: 0 }))
      return { ...prev, data_atual: novaData, alunos }
    })
  }, [])

  const simularPresenca = useCallback(() => {
    setDb((prev) => {
      const hoje = prev.data_atual
      const novasPresencas = [...prev.presencas]
      const alunos = prev.alunos.map((a) => {
        const veio = Math.random() > 0.25
        const idx = novasPresencas.findIndex((p) => p.aluno_id === a.id && p.data === hoje)
        const registro = { aluno_id: a.id, data: hoje, presente: veio, justificada: !veio && Math.random() > 0.5 }
        if (idx >= 0) novasPresencas[idx] = registro
        else novasPresencas.push(registro)
        return {
          ...a,
          streak_dias: veio ? a.streak_dias + 1 : 0,
          ultima_presenca: veio ? hoje : a.ultima_presenca,
          xp_total: veio ? a.xp_total + 20 : a.xp_total,
        }
      }).map((a) => recalcAluno(a, prev.banners))
      const next = { ...prev, presencas: novasPresencas, alunos }
      return { ...next, squads: recalcSquads(next) }
    })
  }, [])

  const simularXP = useCallback(() => {
    setDb((prev) => {
      const alunos = prev.alunos
        .map((a) => ({ ...a, xp_total: a.xp_total + Math.round(20 + Math.random() * 80), tempo_tela_minutos_hoje: a.tempo_tela_minutos_hoje + Math.round(5 + Math.random() * 10) }))
        .map((a) => recalcAluno(a, prev.banners))
      const next = { ...prev, alunos }
      return { ...next, squads: recalcSquads(next) }
    })
  }, [])

  const resetarDados = useCallback(() => {
    const seed = criarSeed()
    setDb(seed)
    setProfessorId(null)
    setEscolaIdState(seed.escolas[0]?.id ?? "")
    setTurmaIdState(seed.turmas.find((t) => t.escola_id === seed.escolas[0]?.id)?.id ?? "")
    setAlunoId(null)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
  }, [])

  const value = useMemo<StoreCtx>(
    () => ({
      db,
      ready,
      professorId,
      escolaId,
      turmaId,
      alunoId,
      setEscolaId,
      setTurmaId,
      setAlunoId,
      registrarProfessor,
      loginProfessor,
      logoutProfessor,
      criarTurma,
      atualizarTurma,
      removerTurma,
      responderExercicio,
      fazerCheckin,
      equiparBanner,
      concluirAtividade,
      solicitarResgate,
      adicionarAluno,
      atualizarAluno,
      removerAluno,
      moverAlunoParaTurma,
      criarAtividade,
      atualizarAtividade,
      encerrarAtividade,
      removerAtividade,
      criarRecompensa,
      atualizarRecompensa,
      alternarStatusRecompensa,
      removerRecompensa,
      criarSquad,
      removerSquad,
      gerarSquadsAuto,
      marcarPresenca,
      postarMissao,
      aprovarResgate,
      avancarDia,
      simularPresenca,
      simularXP,
      resetarDados,
    }),
    [
      db, ready, professorId, escolaId, turmaId, alunoId, setEscolaId, setTurmaId,
      registrarProfessor, loginProfessor, logoutProfessor, criarTurma, atualizarTurma, removerTurma,
      responderExercicio, fazerCheckin, equiparBanner, concluirAtividade, solicitarResgate,
      adicionarAluno, atualizarAluno, removerAluno, moverAlunoParaTurma,
      criarAtividade, atualizarAtividade, encerrarAtividade, removerAtividade,
      criarRecompensa, atualizarRecompensa, alternarStatusRecompensa, removerRecompensa,
      criarSquad, removerSquad, gerarSquadsAuto, marcarPresenca, postarMissao, aprovarResgate,
      avancarDia, simularPresenca, simularXP, resetarDados,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useStore deve ser usado dentro de StoreProvider")
  return ctx
}

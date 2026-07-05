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
function recalcAluno(a: Aluno, banners: DB["banners"], coresNome: DB["cores_nome"]): Aluno {
  const nivel = nivelDoXp(a.xp_total)
  const desbloqueados = new Set(a.banners_desbloqueados)
  banners.forEach((b) => {
    if (a.xp_total >= b.custo_xp) desbloqueados.add(b.id)
  })
  const coresDesbloqueadas = new Set(a.cores_nome_desbloqueadas ?? [])
  coresNome.forEach((c) => {
    if (a.xp_total >= c.custo_xp) coresDesbloqueadas.add(c.id)
  })
  return {
    ...a,
    nivel,
    banners_desbloqueados: Array.from(desbloqueados),
    banner_equipado: a.banner_equipado ?? "b_ceu",
    cores_nome_desbloqueadas: Array.from(coresDesbloqueadas),
    cor_nome_equipada: a.cor_nome_equipada ?? "cn_branco",
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

// ---------- ADICIONADO: tipos de resposta para atividades do tipo quiz ----------
type TipoResposta = "texto" | "multipla_escolha"

interface AtividadeInput {
  titulo: string
  descricao: string
  prazo: string | null
  xp: number
  dificuldade: Dificuldade
  anexos: { nome: string; tipo: string }[]
  // ---------- CORRIGIDO: trilha_id agora faz parte do input e é copiado para o objeto final ----------
  trilha_id: string | null
  // ---------- ADICIONADO: campos de quiz ----------
  tipo_resposta?: TipoResposta
  pergunta?: string | null
  opcoes?: string[]
  resposta_correta?: string | null
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
  ganharXpExtra: (alunoId: string, xp: number) => void
  equiparBanner: (alunoId: string, bannerId: string) => void
  equiparCorNome: (alunoId: string, corId: string) => void
  solicitarResgate: (recompensaId: string, tipo: "aluno" | "squad", solicitanteId: string, turmaId: string) => void
  // Trilha de Recompensas (ícones de perfil por nível/xp)
  resgatarRecompensaXp: (alunoId: string, recompensaId: number, icone: string) => void
  selecionarIconePerfil: (alunoId: string, iconeId: string) => void
  // ações professora
  adicionarAluno: (nome: string, turmaId: string, avatar: string) => void
  atualizarAluno: (id: string, nome: string, avatar: string) => void
  removerAluno: (id: string) => void
  moverAlunoParaTurma: (alunoId: string, turmaId: string) => void
  // atividades (professor)
  criarAtividade: (turmaId: string, dados: AtividadeInput) => void
  atualizarAtividade: (id: string, dados: AtividadeInput) => void
  encerrarAtividade: (id: string) => void
  removerAtividade: (id: string) => void
  // ---------- ADICIONADO: conclusão de atividade pelo aluno (usada no AtividadeDialog) ----------
  concluirAtividade: (
    atividadeId: string,
    alunoId: string,
    respostaEscolhida?: string,
  ) => { concluida: boolean; acertou?: boolean; xp: number } | null
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
  simularTempoTela: () => void
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

  // carregar do localStorage - CORRIGIDO
  useEffect(() => {
    let base: DB

    try {
      const raw = localStorage.getItem(STORAGE_KEY)

      if (raw) {
        const parsed = JSON.parse(raw) as DB

        // Compatibilidade - garantindo que todas as propriedades existam
        parsed.atividades ??= []
        parsed.recompensas ??= []
        parsed.resgates ??= []
        parsed.missoes ??= []
        parsed.squads ??= []
        parsed.banners ??= []
        parsed.presencas ??= []
        parsed.progresso ??= []
        parsed.escolas ??= []
        parsed.turmas ??= []
        parsed.alunos ??= []
        parsed.professores ??= []
        parsed.trilhas ??= []
        parsed.recompensas_reais ??= []

        // Compatibilidade - Trilha de Recompensas (alunos salvos antes desses campos existirem)
        parsed.cores_nome ??= []
        if (parsed.cores_nome.length === 0) {
          parsed.cores_nome = [
            { id: "cn_branco", nome: "Branco Clássico", raridade: "comum", custo_xp: 0, classe: "text-white" },
            { id: "cn_amarelo", nome: "Amarelo Sol", raridade: "comum", custo_xp: 150, classe: "text-yellow-300" },
            { id: "cn_ciano", nome: "Ciano Elétrico", raridade: "raro", custo_xp: 400, classe: "text-cyan-300" },
            { id: "cn_verde", nome: "Verde Neon", raridade: "raro", custo_xp: 600, classe: "text-lime-300" },
            { id: "cn_rosa", nome: "Rosa Choque", raridade: "epico", custo_xp: 1000, classe: "text-pink-400" },
            { id: "cn_dourado", nome: "Dourado Real", raridade: "epico", custo_xp: 1400, classe: "text-amber-300" },
            { id: "cn_arco-iris", nome: "Arco-íris", raridade: "lendario", custo_xp: 2000, classe: "text-fuchsia-300" },
          ]
        }

        parsed.alunos = parsed.alunos.map((a) => ({
          ...a,
          recompensas_resgatadas: a.recompensas_resgatadas ?? [],
          icones_desbloqueados: a.icones_desbloqueados ?? ["default"],
          icone_selecionado: a.icone_selecionado ?? "default",
          cores_nome_desbloqueadas: a.cores_nome_desbloqueadas ?? ["cn_branco"],
          cor_nome_equipada: a.cor_nome_equipada ?? "cn_branco",
        }))

        parsed.alunos = parsed.alunos.map((a) => recalcAluno(a, parsed.banners, parsed.cores_nome))

        base = parsed
      } else {
        base = criarSeed()
        localStorage.setItem(STORAGE_KEY, JSON.stringify(base))
      }
    } catch {
      base = criarSeed()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(base))
    }

    setDb(base)

    try {
      const rawSession = localStorage.getItem(SESSION_KEY)

      const session = rawSession
        ? JSON.parse(rawSession) as { professorId?: string | null }
        : null

      const pid =
        session?.professorId &&
          base.professores.some((p) => p.id === session.professorId)
          ? session.professorId
          : null

      setProfessorId(pid)

      const primeiraEscola = base.escolas?.[0]?.id ?? ""

      setEscolaIdState(primeiraEscola)

      const turmasVisiveis = pid
        ? base.turmas.filter((t) => t.professor_id === pid)
        : base.turmas.filter((t) => t.escola_id === primeiraEscola)

      setTurmaIdState(turmasVisiveis[0]?.id ?? "")
    } catch {
      setProfessorId(null)
      setEscolaIdState(base.escolas?.[0]?.id ?? "")
      setTurmaIdState(base.turmas?.[0]?.id ?? "")
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

  // Contador real de tempo de tela do aluno logado. Soma 1 minuto por
  // minuto real decorrido, só enquanto a aba estiver visível/ativa —
  // assim não conta tempo com o app em segundo plano ou minimizado.
  useEffect(() => {
    if (!ready || !alunoId) return

    const id = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return

      setDb((prev) => {
        const alunos = prev.alunos.map((a) =>
          a.id === alunoId
            ? {
              ...a,
              tempo_tela_minutos_hoje: a.tempo_tela_minutos_hoje + 1,
              tempo_tela_minutos_semana: a.tempo_tela_minutos_semana + 1,
            }
            : a,
        )
        return { ...prev, alunos }
      })
    }, 60_000)

    return () => clearInterval(id)
  }, [ready, alunoId])

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
        return recalcAluno({ ...a, xp_total: a.xp_total + xp }, prev.banners, prev.cores_nome)
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
            prev.cores_nome,
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

  const ganharXpExtra = useCallback((aid: string, xp: number) => {
    setDb((prev) => {
      const alunos = prev.alunos.map((a) =>
        a.id === aid ? recalcAluno({ ...a, xp_total: a.xp_total + xp }, prev.banners, prev.cores_nome) : a,
      )
      const next = { ...prev, alunos }
      return { ...next, squads: recalcSquads(next) }
    })
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

  const equiparCorNome = useCallback((aid: string, corId: string) => {
    setDb((prev) => ({
      ...prev,
      alunos: prev.alunos.map((a) =>
        a.id === aid && a.cores_nome_desbloqueadas.includes(corId)
          ? { ...a, cor_nome_equipada: corId }
          : a,
      ),
    }))
  }, [])

  // ---------- Trilha de Recompensas (ícones de perfil por nível/XP) ----------
  const resgatarRecompensaXp = useCallback((aid: string, recompensaId: number, icone: string) => {
    setDb((prev) => ({
      ...prev,
      alunos: prev.alunos.map((a) => {
        if (a.id !== aid) return a
        if (a.recompensas_resgatadas.includes(recompensaId)) return a
        return {
          ...a,
          recompensas_resgatadas: [...a.recompensas_resgatadas, recompensaId],
          icones_desbloqueados: a.icones_desbloqueados.includes(icone)
            ? a.icones_desbloqueados
            : [...a.icones_desbloqueados, icone],
        }
      }),
    }))
  }, [])

  const selecionarIconePerfil = useCallback((aid: string, iconeId: string) => {
    setDb((prev) => ({
      ...prev,
      alunos: prev.alunos.map((a) =>
        a.id === aid && a.icones_desbloqueados.includes(iconeId)
          ? { ...a, icone_selecionado: iconeId }
          : a,
      ),
    }))
  }, [])

  const solicitarResgate = useCallback(
    (recompensaId: string, tipo: "aluno" | "squad", solicitanteId: string, tId: string) => {
      setDb((prev) => {
        const jaExiste = prev.resgates.some(
          (r) => r.recompensa_id === recompensaId && r.solicitante_id === solicitanteId && r.status === "pendente",
        )
        if (jaExiste) return prev
        return {
          ...prev,
          resgates: [
            ...prev.resgates,
            {
              id: `res-${Date.now()}`,
              recompensa_id: recompensaId,
              solicitante_id: solicitanteId,
              solicitante_tipo: tipo,
              turma_id: tId,
              status: "pendente",
              data: prev.data_atual,
            },
          ],
        }
      })
    },
    [],
  )

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
        cores_nome_desbloqueadas: ["cn_branco"],
        cor_nome_equipada: "cn_branco",
        badges: [],
        ultima_presenca: null,
        recompensas_resgatadas: [],
        icones_desbloqueados: ["default"],
        icone_selecionado: "default",
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
  // CORRIGIDO: trilha_id agora é copiado de dados.trilha_id para o objeto Atividade
  // (antes só existia dentro de `dados` e nunca chegava ao objeto final), e os campos
  // de quiz (tipo_resposta, pergunta, opcoes, resposta_correta) são persistidos.
  const criarAtividade = useCallback((tId: string, dados: AtividadeInput) => {
    setDb((prev) => {
      const nova: Atividade = {
        id: `atv-${Date.now()}`,
        turma_id: tId,
        // CORRIGIDO: trilha_id vem de dados.trilha_id (não confundir com turma_id)
        trilha_id: dados.trilha_id,
        titulo: dados.titulo,
        descricao: dados.descricao,
        prazo: dados.prazo,
        xp: dados.xp,
        dificuldade: dados.dificuldade,
        anexos: dados.anexos.map((ax, i) => ({ id: `ax-${Date.now()}-${i}`, nome: ax.nome, tipo: ax.tipo })),
        status: "aberta",
        criada_em: new Date().toISOString(),
        alunos_concluidos: [],
        tipo_resposta: dados.tipo_resposta ?? "texto",
        pergunta: dados.pergunta ?? null,
        opcoes: dados.opcoes ?? [],
        resposta_correta: dados.resposta_correta ?? null,
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
            // CORRIGIDO: trilha_id agora é atualizado a partir de dados.trilha_id
            trilha_id: dados.trilha_id,
            titulo: dados.titulo,
            descricao: dados.descricao,
            prazo: dados.prazo,
            xp: dados.xp,
            dificuldade: dados.dificuldade,
            anexos: dados.anexos.map((ax, i) => ({ id: `ax-${Date.now()}-${i}`, nome: ax.nome, tipo: ax.tipo })),
            tipo_resposta: dados.tipo_resposta ?? a.tipo_resposta ?? "texto",
            pergunta: dados.pergunta ?? a.pergunta ?? null,
            opcoes: dados.opcoes ?? a.opcoes ?? [],
            resposta_correta: dados.resposta_correta ?? a.resposta_correta ?? null,
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

  // ---------- ADICIONADO: concluirAtividade ----------
  // Marca a atividade como concluída para o aluno e concede XP. Se a atividade
  // for do tipo "quiz", compara `respostaEscolhida` com `resposta_correta`:
  // o XP só é concedido quando a resposta está correta. Atividades do tipo
  // "texto" concedem XP direto ao marcar como concluída (não há o que corrigir).
  // Idempotente: clicar de novo em uma atividade já concluída não duplica XP.
  const concluirAtividade = useCallback(
    (atividadeId: string, aid: string, respostaEscolhida?: string) => {
      let resultado: { concluida: boolean; acertou?: boolean; xp: number } | null = null

      setDb((prev) => {
        const atividade = prev.atividades.find((a) => a.id === atividadeId) // busca com o alunoId, não encontra
        const aluno = prev.alunos.find((a) => a.id === aid) // busca com o atividadeId, não encontra
        if (!atividade || !aluno) return prev // sai sem fazer nada

        const jaConcluida = atividade.alunos_concluidos.includes(aid)
        if (jaConcluida) {
          resultado = { concluida: true, xp: 0 }
          return prev
        }

        const ehQuiz = atividade.tipo_resposta === "multipla_escolha"
        const acertou = ehQuiz ? respostaEscolhida === atividade.resposta_correta : undefined
        const ganhaXp = ehQuiz ? acertou === true : true
        const xp = ganhaXp ? atividade.xp : 0

        resultado = { concluida: true, acertou, xp }

        const atividades = prev.atividades.map((a) =>
          a.id === atividadeId ? { ...a, alunos_concluidos: [...a.alunos_concluidos, aid] } : a,
        )

        const alunos = xp > 0
          ? prev.alunos.map((a) =>
            a.id === aid ? recalcAluno({ ...a, xp_total: a.xp_total + xp }, prev.banners, prev.cores_nome) : a,
          )
          : prev.alunos

        const next = { ...prev, atividades, alunos }
        return { ...next, squads: recalcSquads(next) }
      })

      return resultado
    },
    [],
  )

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

  // ---------- CORRIGIDO: aprovarResgate ----------
  const aprovarResgate = useCallback((resgateId: string, aprovar: boolean) => {
    setDb((prev) => {
      const resgate = prev.resgates.find((r) => r.id === resgateId)
      if (!resgate || resgate.status !== "pendente") return prev

      // Busca a recompensa para obter o custo_xp
      const recompensa = prev.recompensas.find(
        (r) => r.id === resgate.recompensa_id
      )
      if (!recompensa) return prev

      const resgates = prev.resgates.map((r) =>
        r.id === resgateId ? { ...r, status: aprovar ? ("aprovada" as const) : ("negada" as const) } : r,
      )

      if (aprovar) {
        // Desconta o XP do aluno usando o custo_xp da recompensa
        const alunos = prev.alunos.map((a) =>
          a.id === resgate.solicitante_id
            ? recalcAluno(
              { ...a, xp_total: Math.max(0, a.xp_total - recompensa.custo_xp) },
              prev.banners,
              prev.cores_nome
            )
            : a,
        )
        const next = { ...prev, resgates, alunos }
        return { ...next, squads: recalcSquads(next) }
      }

      // Negado: devolve a unidade reservada da recompensa
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
      }).map((a) => recalcAluno(a, prev.banners, prev.cores_nome))
      const next = { ...prev, presencas: novasPresencas, alunos }
      return { ...next, squads: recalcSquads(next) }
    })
  }, [])

  const simularXP = useCallback(() => {
    setDb((prev) => {
      const alunos = prev.alunos
        .map((a) => ({ ...a, xp_total: a.xp_total + Math.round(20 + Math.random() * 80), tempo_tela_minutos_hoje: a.tempo_tela_minutos_hoje + Math.round(5 + Math.random() * 10) }))
        .map((a) => recalcAluno(a, prev.banners, prev.cores_nome))

      const next = { ...prev, alunos }
      return { ...next, squads: recalcSquads(next) }
    })
  }, [])

  const simularTempoTela = useCallback(() => {
    setDb((prev) => {
      if (!alunoId) return prev
      const alunos = prev.alunos.map((a) =>
        a.id === alunoId
          ? {
            ...a,
            tempo_tela_minutos_hoje: a.tempo_tela_minutos_hoje + 5,
            tempo_tela_minutos_semana: a.tempo_tela_minutos_semana + 5,
          }
          : a,
      )
      return { ...prev, alunos }
    })
  }, [alunoId])

  const resetarDados = useCallback(() => {
    const seed = criarSeed()
    setDb(seed)
    setProfessorId(null)
    setEscolaIdState(seed.escolas[0]?.id ?? "")
    setTurmaIdState(seed.turmas.find((t) => t.escola_id === seed.escolas[0]?.id)?.id ?? "")
    setAlunoId(null)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
  }, [])

  // ---------- CORRIGIDO: useMemo com todas as dependências ----------
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
      ganharXpExtra,
      equiparBanner,
      equiparCorNome,
      solicitarResgate,
      resgatarRecompensaXp,
      selecionarIconePerfil,
      adicionarAluno,
      atualizarAluno,
      removerAluno,
      moverAlunoParaTurma,
      criarAtividade,
      atualizarAtividade,
      encerrarAtividade,
      removerAtividade,
      concluirAtividade,
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
      simularTempoTela,
      resetarDados,
    }),
    [
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
      ganharXpExtra,
      equiparBanner,
      equiparCorNome,
      solicitarResgate,
      resgatarRecompensaXp,
      selecionarIconePerfil,
      adicionarAluno,
      atualizarAluno,
      removerAluno,
      moverAlunoParaTurma,
      criarAtividade,
      atualizarAtividade,
      encerrarAtividade,
      removerAtividade,
      concluirAtividade,
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
      simularTempoTela,
      resetarDados,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useStore deve ser usado dentro de StoreProvider")
  return ctx
}
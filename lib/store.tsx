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
import type { Aluno, DB, Missao, Squad, TipoSquad } from "./types"
import { criarSeed } from "./seed"
import { adicionarDias, nivelDoXp } from "./game"

const STORAGE_KEY = "trilha-plus-db-v3"

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

interface StoreCtx {
  db: DB
  ready: boolean
  // sessão / filtros
  escolaId: string
  turmaId: string
  alunoId: string | null
  setEscolaId: (id: string) => void
  setTurmaId: (id: string) => void
  setAlunoId: (id: string | null) => void
  // ações aluno
  responderExercicio: (alunoId: string, exercicioId: string) => { acertou: boolean; xp: number } | null
  fazerCheckin: (alunoId: string) => number | null
  equiparBanner: (alunoId: string, bannerId: string) => void
  solicitarResgate: (recompensaId: string, tipo: "aluno" | "squad", solicitanteId: string, turmaId: string) => void
  // ações professora
  adicionarAluno: (nome: string, turmaId: string, avatar: string) => void
  atualizarAluno: (id: string, nome: string, avatar: string) => void
  removerAluno: (id: string) => void
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
  const [escolaId, setEscolaIdState] = useState("")
  const [turmaId, setTurmaIdState] = useState("")
  const [alunoId, setAlunoId] = useState<string | null>(null)

  // carregar do localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as DB
        setDb(parsed)
        setEscolaIdState(parsed.escolas[0]?.id ?? "")
        setTurmaIdState(parsed.turmas.find((t) => t.escola_id === parsed.escolas[0]?.id)?.id ?? "")
      } else {
        const seed = criarSeed()
        setDb(seed)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
        setEscolaIdState(seed.escolas[0]?.id ?? "")
        setTurmaIdState(seed.turmas.find((t) => t.escola_id === seed.escolas[0]?.id)?.id ?? "")
      }
    } catch {
      const seed = criarSeed()
      setDb(seed)
      setEscolaIdState(seed.escolas[0]?.id ?? "")
      setTurmaIdState(seed.turmas[0]?.id ?? "")
    }
    setReady(true)
  }, [])

  // persistir
  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  }, [db, ready])

  const setEscolaId = useCallback(
    (id: string) => {
      setEscolaIdState(id)
      const primeiraTurma = db.turmas.find((t) => t.escola_id === id)
      setTurmaIdState(primeiraTurma?.id ?? "")
    },
    [db.turmas],
  )
  const setTurmaId = useCallback((id: string) => setTurmaIdState(id), [])

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
        // sobe de nível na trilha se completou o exercício do nível atual
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
      // já fez check-in hoje?
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

  // ---------- ações professora ----------
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
        squads,
      }
      return { ...next, squads: recalcSquads(next) }
    })
  }, [])

  const criarSquad = useCallback((tId: string, nome: string, alunosIds: string[]) => {
    setDb((prev) => {
      const tipo: TipoSquad = alunosIds.length === 2 ? "dupla" : alunosIds.length === 3 ? "trio" : "squad"
      const squadId = `${tId}-sq${Date.now()}`
      const emojis = ["🚀", "⭐", "🐉", "🔥", "🌈", "⚡"]
      // remove alunos de outros squads
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
      // ordena por XP e intercala para misturar níveis de engajamento
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

        // recomputa streak simples do aluno
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
    setDb((prev) => ({
      ...prev,
      resgates: prev.resgates.map((r) =>
        r.id === resgateId ? { ...r, status: aprovar ? "aprovada" : "negada" } : r,
      ),
    }))
  }, [])

  // ---------- demo ----------
  const avancarDia = useCallback(() => {
    setDb((prev) => {
      const novaData = adicionarDias(prev.data_atual, 1)
      // reseta tempo de tela do dia
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
    setEscolaIdState(seed.escolas[0]?.id ?? "")
    setTurmaIdState(seed.turmas.find((t) => t.escola_id === seed.escolas[0]?.id)?.id ?? "")
    setAlunoId(null)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
  }, [])

  const value = useMemo<StoreCtx>(
    () => ({
      db,
      ready,
      escolaId,
      turmaId,
      alunoId,
      setEscolaId,
      setTurmaId,
      setAlunoId,
      responderExercicio,
      fazerCheckin,
      equiparBanner,
      solicitarResgate,
      adicionarAluno,
      atualizarAluno,
      removerAluno,
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
      db, ready, escolaId, turmaId, alunoId, setEscolaId, setTurmaId,
      responderExercicio, fazerCheckin, equiparBanner, solicitarResgate,
      adicionarAluno, atualizarAluno, removerAluno, criarSquad, removerSquad,
      gerarSquadsAuto, marcarPresenca, postarMissao, aprovarResgate,
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

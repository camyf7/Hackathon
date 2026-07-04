"use client"

// hooks/useRewards.ts
// Hook responsável pelas regras de resgate de recompensas e seleção de ícone de perfil.
// Usa o MESMO xp_total do aluno já existente no restante do app (via useStore),
// não existe mais uma contagem de XP separada para a Trilha de Recompensas.

import { useMemo } from "react"
import { useStore } from "@/lib/store"
import { calcularProgresso } from "@/lib/levels"
import { RECOMPENSAS, estadoDaRecompensa, type EstadoRecompensa, type Recompensa } from "@/lib/rewards"

export interface RecompensaComEstado extends Recompensa {
  estado: EstadoRecompensa
}

export function useRewards(alunoId: string) {
  const { db, ready, resgatarRecompensaXp, selecionarIconePerfil } = useStore()
  const aluno = db.alunos.find((a) => a.id === alunoId)

  const detalhesNivel = useMemo(
    () => calcularProgresso(aluno?.xp_total ?? 0),
    [aluno?.xp_total],
  )

  const recompensas: RecompensaComEstado[] = useMemo(
    () =>
      RECOMPENSAS.map((r) => ({
        ...r,
        estado: estadoDaRecompensa(r, detalhesNivel.nivel, aluno?.recompensas_resgatadas ?? []),
      })),
    [detalhesNivel.nivel, aluno?.recompensas_resgatadas],
  )

  function resgatar(recompensaId: number) {
    if (!aluno) return false
    const recompensa = RECOMPENSAS.find((r) => r.id === recompensaId)
    if (!recompensa) return false
    const estado = estadoDaRecompensa(recompensa, detalhesNivel.nivel, aluno.recompensas_resgatadas)
    if (estado !== "disponivel") return false
    resgatarRecompensaXp(aluno.id, recompensa.id, recompensa.icone)
    return true
  }

  function escolherIcone(iconeId: string) {
    if (!aluno) return
    selecionarIconePerfil(aluno.id, iconeId)
  }

  return {
    aluno,
    carregado: ready,
    xpTotal: aluno?.xp_total ?? 0,
    detalhesNivel,
    recompensas,
    ownedIcons: aluno?.icones_desbloqueados ?? ["default"],
    selectedIcon: aluno?.icone_selecionado ?? "default",
    resgatar,
    escolherIcone,
  }
}

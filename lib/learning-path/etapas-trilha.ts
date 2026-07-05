import type { Aluno, Atividade, Trilha } from "@/lib/types"

// Cada etapa da trilha agora é sempre uma atividade lançada pelo
// professor para aquela matéria (trilha) e aquela turma — nada de
// exercícios fixos do seed. Nível 1 é a primeira atividade lançada,
// nível 2 a segunda, e assim por diante.
export type EtapaTrilha = {
  id: string
  tipo: "atividade"
  nivel: number
  atividade: Atividade
}

export function getEtapasTrilha(trilha: Trilha, atividades: Atividade[], aluno: Aluno): EtapaTrilha[] {
  return atividades
    .filter((a) => a.trilha_id === trilha.id && a.turma_id === aluno.turma_id)
    .slice()
    .sort((a, b) => (a.criada_em < b.criada_em ? -1 : a.criada_em > b.criada_em ? 1 : 0))
    .map((atividade, idx) => ({
      id: atividade.id,
      tipo: "atividade" as const,
      nivel: idx + 1,
      atividade,
    }))
}

export function etapaConcluida(etapa: EtapaTrilha, alunoId: string): boolean {
  return etapa.atividade.alunos_concluidos.includes(alunoId)
}

// Nível "atual" (o próximo a ser destravado): sobe um por um, em ordem,
// e para no primeiro nível ainda não concluído pelo aluno.
export function nivelAtualTrilha(etapas: EtapaTrilha[], alunoId: string): number {
  let nivel = 1
  for (const etapa of etapas) {
    if (etapaConcluida(etapa, alunoId)) {
      nivel = etapa.nivel + 1
    } else {
      break
    }
  }
  return nivel
}
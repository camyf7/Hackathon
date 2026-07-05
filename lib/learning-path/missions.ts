import type { DificuldadeMissao, StatusMissao } from "@/lib/types"

export interface MissaoTrilhaDef {
  id: string
  trilhaId: string
  ordem: number
  titulo: string
  descricao: string
  objetivo: string
  xp: number
  tempoEstimado: number
  professor: string
  dificuldade: DificuldadeMissao
  competencias: string[]
  habilidadesBncc: string[]
  exercicioNivel: number | null
  isBoss: boolean
  row: number
  col: number
}

const PROFESSOR_PADRAO = "Prof. Marina Andrade"

function missao(
  trilhaId: string,
  ordem: number,
  titulo: string,
  descricao: string,
  objetivo: string,
  opts: Partial<MissaoTrilhaDef> = {},
): MissaoTrilhaDef {
  const row = opts.row ?? (ordem <= 4 ? 0 : 1)
  const col = opts.col ?? (ordem <= 4 ? ordem - 1 : ordem - 5)
  return {
    id: `${trilhaId}-m${ordem}`,
    trilhaId,
    ordem,
    titulo,
    descricao,
    objetivo,
    xp: opts.xp ?? 80 + ordem * 20,
    tempoEstimado: opts.tempoEstimado ?? 15 + ordem * 5,
    professor: opts.professor ?? PROFESSOR_PADRAO,
    dificuldade: opts.dificuldade ?? (ordem <= 2 ? "facil" : ordem <= 4 ? "media" : "dificil"),
    competencias: opts.competencias ?? ["Raciocínio lógico", "Resolução de problemas"],
    habilidadesBncc: opts.habilidadesBncc ?? [`(EM${ordem}) Habilidade de ${titulo}`],
    exercicioNivel: opts.exercicioNivel ?? (opts.isBoss ? null : ordem),
    isBoss: opts.isBoss ?? false,
    row,
    col,
  }
}

const MAT_MISSOES = [
  missao("mat", 1, "Diagnóstico", "Avalie seu ponto de partida em Matemática.", "Identificar lacunas iniciais"),
  missao("mat", 2, "Números e Operações", "Domine operações fundamentais.", "Calcular com precisão"),
  missao("mat", 3, "Álgebra", "Introduza variáveis e equações simples.", "Resolver equações básicas"),
  missao("mat", 4, "Geometria", "Descubra formas, medidas e propriedades.", "Aplicar conceitos geométricos", { row: 0, col: 3 }),
  missao("mat", 5, "Problemas", "Resolva situações do cotidiano.", "Modelar e resolver problemas", { row: 1, col: 0 }),
  missao("mat", 6, "Desafio Final", "Prove seu domínio em Matemática.", "Superar a avaliação final", {
    isBoss: true,
    xp: 300,
    tempoEstimado: 40,
    dificuldade: "dificil",
    row: 1,
    col: 2,
  }),
]

const PORT_MISSOES = [
  missao("port", 1, "Diagnóstico", "Avalie leitura e gramática.", "Mapear habilidades iniciais"),
  missao("port", 2, "Gramática", "Substantivos, verbos e concordância.", "Aplicar regras gramaticais"),
  missao("port", 3, "Interpretação", "Compreenda textos variados.", "Inferir e analisar"),
  missao("port", 4, "Produção", "Escreva com clareza e coesão.", "Produzir textos curtos", { row: 0, col: 3 }),
  missao("port", 5, "Literatura", "Conheça autores e gêneros.", "Identificar elementos literários", { row: 1, col: 0 }),
  missao("port", 6, "Desafio Final", "Demonstre domínio da língua.", "Avaliação integrada", { isBoss: true, xp: 300, row: 1, col: 2 }),
]

const HIST_MISSOES = [
  missao("hist", 1, "Diagnóstico", "O que você já sabe de História?", "Avaliar conhecimentos prévios"),
  missao("hist", 2, "Brasil Colonial", "Colonização e formação do país.", "Compreender o período colonial"),
  missao("hist", 3, "Independência", "Processos de emancipação.", "Analisar causas e consequências"),
  missao("hist", 4, "República", "Era republicana e transformações.", "Relacionar eventos históricos", { row: 0, col: 3 }),
  missao("hist", 5, "Mundo Contemporâneo", "Conflitos e globalização.", "Contextualizar o presente", { row: 1, col: 0 }),
  missao("hist", 6, "Desafio Final", "Prova seu repertório histórico.", "Síntese e análise crítica", { isBoss: true, xp: 300, row: 1, col: 2 }),
]

const CIE_MISSOES = [
  missao("cie", 1, "Diagnóstico", "Explore seu conhecimento científico.", "Identificar interesses"),
  missao("cie", 2, "Matéria e Energia", "Estados físicos e transformações.", "Explicar fenômenos"),
  missao("cie", 3, "Vida e Evolução", "Seres vivos e ecossistemas.", "Relacionar seres e ambientes"),
  missao("cie", 4, "Terra e Universo", "Planetas, clima e astronomia.", "Compreender sistemas naturais", { row: 0, col: 3 }),
  missao("cie", 5, "Investigação", "Método científico na prática.", "Formular hipóteses", { row: 1, col: 0 }),
  missao("cie", 6, "Desafio Final", "Avaliação científica integrada.", "Demonstrar raciocínio científico", { isBoss: true, xp: 300, row: 1, col: 2 }),
]

const GEO_MISSOES = [
  missao("geo", 1, "Diagnóstico", "Cartografia e localização.", "Orientar-se no espaço"),
  missao("geo", 2, "Brasil Físico", "Relevo, clima e biomas.", "Caracterizar regiões"),
  missao("geo", 3, "População", "Demografia e urbanização.", "Analisar dinâmicas sociais"),
  missao("geo", 4, "Economia", "Recursos e atividades produtivas.", "Compreender interdependência", { row: 0, col: 3 }),
  missao("geo", 5, "Globalização", "Conexões mundiais.", "Relacionar escala local e global", { row: 1, col: 0 }),
  missao("geo", 6, "Desafio Final", "Prova de Geografia.", "Síntese espacial", { isBoss: true, xp: 300, row: 1, col: 2 }),
]

const ING_MISSOES = [
  missao("ing", 1, "Diagnóstico", "Teste seu vocabulário básico.", "Avaliar nível inicial"),
  missao("ing", 2, "Vocabulário", "Palavras do dia a dia.", "Ampliar repertório lexical"),
  missao("ing", 3, "Gramática", "Tempos verbais e estruturas.", "Construir frases corretas"),
  missao("ing", 4, "Conversação", "Diálogos e pronúncia.", "Comunicar-se em situações simples", { row: 0, col: 3 }),
  missao("ing", 5, "Leitura", "Textos curtos em inglês.", "Compreender ideias principais", { row: 1, col: 0 }),
  missao("ing", 6, "Desafio Final", "Avaliação de inglês.", "Demonstrar proficiência básica", { isBoss: true, xp: 300, row: 1, col: 2 }),
]

const ART_MISSOES = [
  missao("art", 1, "Diagnóstico", "Expressão e percepção estética.", "Explorar preferências"),
  missao("art", 2, "Elementos Visuais", "Cor, forma, textura e composição.", "Identificar elementos artísticos"),
  missao("art", 3, "História da Arte", "Movimentos e artistas.", "Contextualizar obras"),
  missao("art", 4, "Criação", "Projetos artísticos pessoais.", "Produzir com intencionalidade", { row: 0, col: 3 }),
  missao("art", 5, "Cultura Local", "Arte e identidade regional.", "Valorizar manifestações locais", { row: 1, col: 0 }),
  missao("art", 6, "Desafio Final", "Portfólio e avaliação.", "Apresentar produção artística", { isBoss: true, xp: 300, row: 1, col: 2 }),
]

export const MISSOES_POR_TRILHA: Record<string, MissaoTrilhaDef[]> = {
  mat: MAT_MISSOES,
  port: PORT_MISSOES,
  hist: HIST_MISSOES,
  cie: CIE_MISSOES,
  geo: GEO_MISSOES,
  ing: ING_MISSOES,
  art: ART_MISSOES,
}

export function getMissoesTrilha(trilhaId: string): MissaoTrilhaDef[] {
  return MISSOES_POR_TRILHA[trilhaId] ?? []
}

export function getMissaoById(missaoId: string): MissaoTrilhaDef | undefined {
  for (const missoes of Object.values(MISSOES_POR_TRILHA)) {
    const found = missoes.find((m) => m.id === missaoId)
    if (found) return found
  }
  return undefined
}

export type MissaoComStatus = MissaoTrilhaDef & { status: StatusMissao; progresso: number }

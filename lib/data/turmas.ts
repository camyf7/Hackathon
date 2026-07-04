import { escolas, type Escola } from "./escolas"

export interface Turma {
  id: string
  nome: string
  escolaId: string
  segmento: "infantil" | "fundamental" | "eja"
}

const TURMAS_INFANTIL = ["Infantil I", "Infantil II", "Pré I", "Pré II"]
const LETRAS_TURMA = ["A", "B"] as const
const MODULOS_EJA = ["EJA - Módulo I", "EJA - Módulo II", "EJA - Módulo III", "EJA - Módulo IV"]

/**
 * Gera as turmas de uma escola a partir do seu tipo de atendimento.
 * - CEI / EMEI  -> apenas Educação Infantil
 * - EMEF        -> Ensino Fundamental (1º ao 9º ano), com EJA quando aplicável
 * - EMEIEF      -> Educação Infantil + Ensino Fundamental
 */
export function gerarTurmas(escola: Escola): Turma[] {
  const turmas: Turma[] = []

  const incluiInfantil = escola.tipo === "CEI" || escola.tipo === "EMEI" || escola.tipo === "EMEIEF"
  const incluiFundamental = escola.tipo === "EMEF" || escola.tipo === "EMEIEF"

  if (incluiInfantil) {
    for (const nome of TURMAS_INFANTIL) {
      turmas.push({
        id: `${escola.id}__infantil__${nome.toLowerCase().replace(/\s+/g, "-")}`,
        nome,
        escolaId: escola.id,
        segmento: "infantil",
      })
    }
  }

  if (incluiFundamental) {
    for (let ano = 1; ano <= 9; ano++) {
      for (const letra of LETRAS_TURMA) {
        const nome = `${ano}º Ano ${letra}`
        turmas.push({
          id: `${escola.id}__fund__${ano}${letra}`,
          nome,
          escolaId: escola.id,
          segmento: "fundamental",
        })
      }
    }

    if (escola.ofertaEja) {
      for (const nome of MODULOS_EJA) {
        turmas.push({
          id: `${escola.id}__eja__${nome.toLowerCase().replace(/\s+/g, "-")}`,
          nome,
          escolaId: escola.id,
          segmento: "eja",
        })
      }
    }
  }

  return turmas
}

/** Mapa pré-computado escolaId -> turmas, pronto para consumo pelos selects */
export const turmasPorEscola: Record<string, Turma[]> = Object.fromEntries(
  escolas.map((escola) => [escola.id, gerarTurmas(escola)])
)